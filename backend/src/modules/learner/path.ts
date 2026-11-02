/** Mục tiêu học + lộ trình cơ bản 3 chặng (luồng #2, phần không dùng thuật toán nâng cao). */
import { Router } from 'express';
import { pid } from './learner.shared';
import { z } from 'zod';
import type { ExamType, LearningPathItem, PathItemType, Prisma, SkillType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { handler, me, notFound, parse } from '../../core/http';
import { ymd } from '../../core/dto';

export const pathRouter = Router();

const goalBody = z
  .object({
    examType: z.enum(['TOEIC', 'VSTEP']),
    currentLevel: z.string().max(20).nullable().optional(),
    targetScore: z.number().int().min(10).max(990).nullable().optional(),
    targetLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).nullable().optional(),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    purpose: z.enum(['GRADUATION', 'CAREER', 'STUDY_ABROAD', 'PERSONAL']).nullable().optional(),
    studyDays: z.array(z.number().int().min(1).max(7)).min(1).max(7).default([1, 2, 3, 4, 5]),
    minutesPerDay: z.number().int().min(10).max(480).default(60),
    preferredSlot: z.enum(['MORNING', 'AFTERNOON', 'EVENING']).nullable().optional(),
  })
  .refine((g) => g.targetScore || g.targetLevel, 'Cần điểm mục tiêu (TOEIC) hoặc bậc mục tiêu (VSTEP)');

const toGoal = (g: Prisma.LearningGoalGetPayload<object>) => ({
  id: g.id,
  examType: g.examType,
  currentLevel: g.currentLevel,
  targetScore: g.targetScore,
  targetLevel: g.targetLevel,
  targetDate: ymd(g.targetDate),
  purpose: g.purpose,
  studyDays: g.studyDays,
  minutesPerDay: g.minutesPerDay,
  preferredSlot: g.preferredSlot,
});

pathRouter.get(
  '/goal',
  handler(async (req) => {
    const g = await prisma.learningGoal.findFirst({ where: { userId: me(req).id, isActive: true } });
    return g ? toGoal(g) : null;
  })
);

/** Đặt mục tiêu mới: giữ lịch sử (bản cũ is_active=false) và sinh lại lộ trình */
pathRouter.put(
  '/goal',
  handler(async (req) => {
    const userId = me(req).id;
    const body = parse(goalBody, req.body);
    const goal = await prisma.$transaction(async (tx) => {
      await tx.learningGoal.updateMany({ where: { userId, isActive: true }, data: { isActive: false } });
      const g = await tx.learningGoal.create({
        data: {
          userId,
          examType: body.examType,
          currentLevel: body.currentLevel ?? null,
          targetScore: body.targetScore ?? null,
          targetLevel: body.targetLevel ?? null,
          targetDate: body.targetDate ? new Date(`${body.targetDate}T00:00:00.000Z`) : null,
          purpose: body.purpose ?? null,
          studyDays: body.studyDays,
          minutesPerDay: body.minutesPerDay,
          preferredSlot: body.preferredSlot ?? null,
        },
      });
      await generatePath(tx, userId, g.id, body.examType);
      return g;
    });
    return { goal: toGoal(goal), path: await pathOf(userId) };
  })
);

type ItemSeed = { phase: 1 | 2 | 3; title: string; itemType: PathItemType; refId?: string; refConfig?: Prisma.InputJsonValue; skill?: SkillType; durationMin: number };

/** Lộ trình theo quy tắc: Chặng 1 nền tảng · Chặng 2 luyện từng phần · Chặng 3 thi thử. Nội dung lấy từ dữ liệu đã PUBLISHED. */
async function generatePath(tx: Prisma.TransactionClient, userId: string, goalId: string, examType: ExamType) {
  const [course, vocab, tests] = await Promise.all([
    tx.course.findFirst({
      where: { status: 'PUBLISHED', deletedAt: null, category: { in: ['FOUNDATION', 'GRAMMAR'] } },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
      include: { courseSectionCourses: { orderBy: { orderIndex: 'asc' }, include: { lessonSections: { where: { status: 'PUBLISHED', deletedAt: null }, orderBy: { orderIndex: 'asc' }, take: 3 } } } },
    }),
    tx.vocabTopic.findMany({ where: { deletedAt: null, OR: [{ examType }, { examType: null }] }, orderBy: { orderIndex: 'asc' }, take: 2 }),
    tx.mockTest.findMany({ where: { examType, status: 'PUBLISHED', deletedAt: null, kind: { in: ['FULL', 'MINI'] } }, orderBy: [{ isFree: 'desc' }, { createdAt: 'asc' }], take: 3 }),
  ]);
  const lessons = (course?.courseSectionCourses ?? []).flatMap((s) => s.lessonSections).slice(0, 3);
  const items: ItemSeed[] = [];
  lessons.forEach((l) => items.push({ phase: 1, title: l.title, itemType: 'LESSON', refId: l.id, refConfig: { courseSlug: course!.slug }, skill: l.skill ?? undefined, durationMin: l.durationMin }));
  const toeic = examType === 'TOEIC';
  items.push({ phase: 1, title: toeic ? 'Luyện Part 5 — 20 câu' : 'Luyện Reading — 10 câu', itemType: 'PRACTICE', refConfig: { parts: [toeic ? 'PART_5' : 'VSTEP_READING'], questions: toeic ? 20 : 10 }, skill: toeic ? 'GRAMMAR' : 'READING', durationMin: 15 });
  if (vocab[0]) items.push({ phase: 1, title: `Flashcard: ${vocab[0].name}`, itemType: 'VOCAB', refId: vocab[0].id, skill: 'VOCABULARY', durationMin: 10 });

  const phase2Parts = toeic ? ['PART_2', 'PART_3', 'PART_4', 'PART_6', 'PART_7'] : ['VSTEP_LISTENING', 'VSTEP_READING'];
  for (const p of phase2Parts)
    items.push({ phase: 2, title: `Luyện ${p.replace('PART_', 'Part ').replace('VSTEP_', '').replace(/^(\w)(\w+)$/, (_, a, b) => a + b.toLowerCase())} — 15 câu`, itemType: 'PRACTICE', refConfig: { parts: [p], questions: 15 }, skill: /PART_[1-4]|LISTENING/.test(p) ? 'LISTENING' : 'READING', durationMin: 15 });
  items.push({ phase: 2, title: 'Ôn tập lỗi sai tuần này', itemType: 'REVIEW', skill: undefined, durationMin: 10 });
  if (vocab[1]) items.push({ phase: 2, title: `Flashcard: ${vocab[1].name}`, itemType: 'VOCAB', refId: vocab[1].id, skill: 'VOCABULARY', durationMin: 10 });

  tests.forEach((t) => items.push({ phase: 3, title: `${t.title}${t.kind === 'FULL' ? ' (Full)' : ''}`, itemType: 'MOCK_TEST', refId: t.id, refConfig: { slug: t.slug }, durationMin: t.durationMin }));
  items.push({ phase: 3, title: 'Phân tích lỗi & luyện điểm yếu', itemType: 'REVIEW', refConfig: { link: '/app/drills' }, durationMin: 30 });

  await tx.learningPath.updateMany({ where: { userId, isActive: true }, data: { isActive: false } });
  const prev = await tx.learningPath.count({ where: { userId } });
  const path = await tx.learningPath.create({
    data: {
      userId,
      goalId,
      examType,
      version: prev + 1,
      milestones: MILESTONES as unknown as Prisma.InputJsonValue,
    },
  });
  const counters = { 1: 0, 2: 0, 3: 0 };
  await tx.learningPathItem.createMany({
    data: items.map((it, idx) => ({
      pathId: path.id,
      phase: it.phase,
      title: it.title.slice(0, 160),
      itemType: it.itemType,
      refId: it.refId,
      refConfig: it.refConfig,
      skill: it.skill,
      durationMin: it.durationMin,
      orderIndex: ++counters[it.phase],
      status: idx === 0 ? 'AVAILABLE' : 'LOCKED',
    })),
  });
}

const MILESTONES = [
  { phase: 1, title: 'Chặng 1 — Nền tảng', subtitle: 'Tuần 1–4', weeksLabel: '4 tuần', description: 'Củng cố ngữ pháp cốt lõi, từ vựng thông dụng và làm quen cấu trúc đề.' },
  { phase: 2, title: 'Chặng 2 — Chuyên sâu', subtitle: 'Tuần 5–9', weeksLabel: '5 tuần', description: 'Luyện chiến thuật từng phần thi, ôn lỗi sai và mở rộng vốn từ.' },
  { phase: 3, title: 'Chặng 3 — Thực chiến', subtitle: 'Tuần 10–12', weeksLabel: '3 tuần', description: 'Thi thử đề đầy đủ, phân tích điểm yếu và tinh chỉnh trước ngày thi.' },
];

function linkOf(it: LearningPathItem): string {
  const cfg = (it.refConfig ?? {}) as { courseSlug?: string; parts?: string[]; slug?: string; link?: string; questions?: number };
  switch (it.itemType) {
    case 'LESSON':
      return `/app/courses/${cfg.courseSlug ?? ''}/lessons/${it.refId}`;
    case 'PRACTICE':
      return `/app/practice/session/${cfg.parts?.[0] ?? 'PART_5'}`;
    case 'MOCK_TEST':
      return `/app/mock-tests/${cfg.slug ?? it.refId}`;
    case 'VOCAB':
      return it.refId ? `/app/vocabulary/flashcards/${it.refId}` : '/app/vocabulary';
    case 'GRAMMAR':
      return `/app/grammar/${cfg.slug ?? ''}`;
    default:
      return cfg.link ?? '/app/review';
  }
}

const SKILL_LABEL: Record<string, string> = { LISTENING: 'Listening', READING: 'Reading', WRITING: 'Writing', SPEAKING: 'Speaking', VOCABULARY: 'Vocabulary', GRAMMAR: 'Grammar' };

/** Milestone[] / PathItem[] theo hợp đồng frontend */
async function pathOf(userId: string) {
  const path = await prisma.learningPath.findFirst({ where: { userId, isActive: true }, include: { learningPathItemPaths: { orderBy: [{ phase: 'asc' }, { orderIndex: 'asc' }] } } });
  if (!path) return null;
  const items = path.learningPathItemPaths;
  const firstOpen = items.find((i) => i.status !== 'COMPLETED');
  const ms = (path.milestones as { phase: number; title: string; subtitle: string; description: string; weeksLabel: string }[]).map((m) => {
    const its = items.filter((i) => i.phase === m.phase);
    const done = its.filter((i) => i.status === 'COMPLETED').length;
    const status = its.length && done === its.length ? 'DONE' : its.some((i) => i.id === firstOpen?.id) ? 'CURRENT' : 'LOCKED';
    return {
      id: `${path.id}-m${m.phase}`,
      phase: m.phase as 1 | 2 | 3,
      title: m.title,
      subtitle: m.subtitle,
      description: m.description,
      weeks: m.weeksLabel,
      status,
      progress: its.length ? Math.round((done / its.length) * 100) : 0,
      items: its.map((i) => ({
        id: i.id,
        title: i.title,
        type: (i.itemType === 'GRAMMAR' ? 'LESSON' : i.itemType) as 'LESSON' | 'PRACTICE' | 'MOCK_TEST' | 'REVIEW' | 'VOCAB',
        durationMin: i.durationMin,
        status: i.status === 'COMPLETED' ? 'DONE' : i.id === firstOpen?.id ? 'CURRENT' : 'LOCKED',
        link: linkOf(i),
        skill: i.skill ? SKILL_LABEL[i.skill] : i.itemType === 'REVIEW' ? 'Review' : i.itemType === 'MOCK_TEST' ? 'Full' : undefined,
      })),
    };
  });
  const total = items.length;
  const done = items.filter((i) => i.status === 'COMPLETED').length;
  return { id: path.id, examType: path.examType, version: path.version, progress: total ? Math.round((done / total) * 100) : 0, milestones: ms };
}

pathRouter.get(
  '/path',
  handler(async (req) => pathOf(me(req).id))
);

/** Đánh dấu hoàn thành nhiệm vụ; mở nhiệm vụ kế tiếp */
pathRouter.post(
  '/path/items/:id/complete',
  handler(async (req) => {
    const userId = me(req).id;
    const item = await prisma.learningPathItem.findUnique({ where: { id: pid(req) }, include: { path: true } });
    if (!item || item.path.userId !== userId) throw notFound('Nhiệm vụ');
    await prisma.$transaction(async (tx) => {
      await tx.learningPathItem.update({ where: { id: item.id }, data: { status: 'COMPLETED', completedAt: new Date() } });
      const next = await tx.learningPathItem.findFirst({ where: { pathId: item.pathId, status: 'LOCKED' }, orderBy: [{ phase: 'asc' }, { orderIndex: 'asc' }] });
      if (next) await tx.learningPathItem.update({ where: { id: next.id }, data: { status: 'AVAILABLE' } });
      const all = await tx.learningPathItem.findMany({ where: { pathId: item.pathId }, select: { status: true } });
      await tx.learningPath.update({ where: { id: item.pathId }, data: { progressPct: Math.round((all.filter((a) => a.status === 'COMPLETED').length / all.length) * 10000) / 100 } });
    });
    return pathOf(userId);
  })
);
