import { Router } from 'express';
import { z } from 'zod';
import type { ExamPart, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { optionalAuth } from '../../core/auth';
import { handler, notFound, parse } from '../../core/http';
import { isUuid } from './courses';
import { completedAttempts } from './counts';
import { byTitleNatural, PART_TITLE, partId, partsOf, sortPartIds, toPassage, toQuestion, toTestSummary, type QuestionWithPassage } from './mappers';
import { TOEIC_PARTS_INFO, VSTEP_PARTS_INFO } from './parts-info';

export const testsRouter = Router();

const PUBLISHED = { status: 'PUBLISHED' as const, deletedAt: null };
const GROUPED: ExamPart[] = ['TOEIC_P3', 'TOEIC_P4', 'TOEIC_P6', 'TOEIC_P7', 'VSTEP_L1', 'VSTEP_L2', 'VSTEP_L3', 'VSTEP_R1', 'VSTEP_R2', 'VSTEP_R3', 'VSTEP_R4'];
const examTypeQ = z.enum(['TOEIC', 'VSTEP']).optional();

/** Map tagId → slug (bảng nhỏ, đọc một lần mỗi request). */
export async function tagSlugMap() {
  const tags = await prisma.skillTag.findMany({ select: { id: true, slug: true } });
  return new Map(tags.map((t) => [t.id, t.slug]));
}

/** Danh sách id phần (PART_x…) có trong từng đề. */
async function partIdsByTest(testIds: string[]) {
  const rows = await prisma.mockTestQuestion.groupBy({ by: ['testId', 'part'], where: { testId: { in: testIds } } });
  const m = new Map<string, string[]>();
  for (const r of rows) m.set(r.testId, [...(m.get(r.testId) ?? []), partId(r.part)]);
  for (const [k, v] of m) m.set(k, sortPartIds(v));
  return m;
}

async function findTest(idOrSlug: string) {
  return prisma.mockTest.findFirst({ where: { ...PUBLISHED, ...(isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug }) } });
}

// GET /catalog/tests?examType=TOEIC&kind=FULL&year=2026&q= → MockTestSummary[]
testsRouter.get(
  '/tests',
  handler(async (req) => {
    const q = parse(
      z.object({ examType: examTypeQ, kind: z.enum(['FULL', 'MINI', 'PLACEMENT', 'DIAGNOSTIC', 'QUIZ', 'CHECKPOINT']).optional(), year: z.coerce.number().int().optional(), q: z.string().trim().optional() }),
      req.query
    );
    const where: Prisma.MockTestWhereInput = {
      ...PUBLISHED,
      examType: q.examType,
      year: q.year,
      kind: q.kind ?? { in: ['FULL', 'MINI'] },
      ...(q.q ? { title: { contains: q.q, mode: 'insensitive' } } : {}),
    };
    const tests = (await prisma.mockTest.findMany({ where, orderBy: [{ year: 'desc' }, { createdAt: 'asc' }] })).sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || byTitleNatural(a, b));
    const [parts, attempts] = await Promise.all([partIdsByTest(tests.map((t) => t.id)), completedAttempts(tests.map((t) => t.id))]);
    return tests.map((t) => toTestSummary(t, parts.get(t.id) ?? [], attempts.get(t.id) ?? 0));
  })
);

// GET /catalog/tests/parts-info?examType=TOEIC → TestPartInfo[]
testsRouter.get(
  '/tests/parts-info',
  handler(async (req) => {
    const { examType } = parse(z.object({ examType: examTypeQ }), req.query);
    const info = examType === 'VSTEP' ? VSTEP_PARTS_INFO : examType === 'TOEIC' ? TOEIC_PARTS_INFO : [...TOEIC_PARTS_INFO, ...VSTEP_PARTS_INFO];
    // Số câu trắc nghiệm đã xuất bản trong ngân hàng theo từng phần (để hiện "x câu luyện tập")
    const counts = await prisma.question.groupBy({
      by: ['part'],
      where: { ...PUBLISHED, skill: { in: ['LISTENING', 'READING'] }, type: { notIn: ['ESSAY', 'SPEAKING_RESPONSE'] }, ...(examType ? { examType } : {}) },
      _count: { _all: true },
    });
    const byId = new Map<string, number>();
    for (const c of counts) byId.set(partId(c.part), (byId.get(partId(c.part)) ?? 0) + c._count._all);
    return info.map((p) => ({ ...p, bankCount: byId.get(p.id) ?? 0 }));
  })
);

// GET /catalog/tests/:idOrSlug → MockTestSummary + số câu từng phần
testsRouter.get(
  '/tests/:idOrSlug',
  optionalAuth,
  handler(async (req) => {
    const t = await findTest(String(req.params.idOrSlug));
    if (!t) throw notFound('Đề thi');
    const counts = await prisma.mockTestQuestion.groupBy({ by: ['part'], where: { testId: t.id }, _count: true });
    const byPart = new Map<string, number>();
    for (const c of counts) byPart.set(partId(c.part), (byPart.get(partId(c.part)) ?? 0) + c._count);
    const ids = sortPartIds([...byPart.keys()]);
    const attempts = await completedAttempts([t.id]);
    return { ...toTestSummary(t, ids, attempts.get(t.id) ?? 0), sections: ids.map((id) => ({ id, name: PART_TITLE[id] ?? id, questions: byPart.get(id) ?? 0 })) };
  })
);

/**
 * GET /catalog/tests/:idOrSlug/paper?parts=PART_1,PART_5 → IMockTest (đề để làm bài, KHÔNG kèm đáp án).
 * Bỏ trống `parts` = toàn bộ đề (FULL).
 */
testsRouter.get(
  '/tests/:idOrSlug/paper',
  optionalAuth,
  handler(async (req) => {
    const q = parse(z.object({ parts: z.string().optional() }), req.query);
    const t = await findTest(String(req.params.idOrSlug));
    if (!t) throw notFound('Đề thi');
    const wanted = q.parts ? q.parts.split(',').flatMap((p) => partsOf(p.trim())) : undefined;
    const links = await prisma.mockTestQuestion.findMany({
      where: { testId: t.id, ...(wanted ? { part: { in: wanted } } : {}) },
      orderBy: { questionNo: 'asc' },
      include: { question: { include: { passage: true } } },
    });
    const tags = await tagSlugMap();
    const sections = new Map<string, ReturnType<typeof toQuestion>[]>();
    for (const l of links) {
      const id = partId(l.part);
      sections.set(id, [...(sections.get(id) ?? []), { ...toQuestion(l.question, tags), questionNo: l.questionNo } as ReturnType<typeof toQuestion>]);
    }
    const ordered = sortPartIds([...sections.keys()]);
    return {
      id: t.id,
      slug: t.slug,
      title: t.title,
      examType: t.examType,
      targetLevel: t.level,
      durationMinutes: wanted ? 0 : t.durationMin,
      totalQuestions: links.length,
      isFree: t.isFree,
      sections: ordered.map((id, i) => {
        const qs = sections.get(id) ?? [];
        return { id: `${t.id}-${id}`, partId: id, name: PART_TITLE[id] ?? id, skillType: qs[0]?.skillType ?? 'READING', durationMins: null, orderIndex: i + 1, questions: qs };
      }),
    };
  })
);

// ================= Luyện tập =================

/**
 * GET /catalog/practice/questions?part=PART_5&skill=GRAMMAR&tag=<slug>&examType=TOEIC&limit=20
 * Lấy ngẫu nhiên câu đã duyệt (không kèm đáp án). Part theo nhóm (3,4,6,7, VSTEP Nghe/Đọc) lấy trọn passage.
 */
testsRouter.get(
  '/practice/questions',
  handler(async (req) => {
    const q = parse(
      z.object({
        part: z.string().optional(),
        skill: z.enum(['LISTENING', 'READING', 'WRITING', 'SPEAKING', 'VOCABULARY', 'GRAMMAR']).optional(),
        tag: z.string().optional(),
        examType: examTypeQ,
        limit: z.coerce.number().int().min(1).max(100).default(20),
      }),
      req.query
    );
    const parts = q.part ? partsOf(q.part) : undefined;
    let tagId: string | undefined;
    if (q.tag) {
      const tag = await prisma.skillTag.findFirst({ where: isUuid(q.tag) ? { id: q.tag } : { slug: q.tag } });
      if (!tag) throw notFound('Chủ điểm');
      tagId = tag.id;
    }
    const base: Prisma.QuestionWhereInput = {
      ...PUBLISHED,
      examType: q.examType,
      skill: q.skill,
      type: { notIn: ['ESSAY', 'SPEAKING_RESPONSE'] },
      ...(parts ? { part: { in: parts } } : {}),
      ...(tagId ? { tagIds: { has: tagId } } : {}),
    };
    const grouped = parts?.length && parts.every((p) => GROUPED.includes(p));
    const tags = await tagSlugMap();

    if (grouped) {
      // Chọn ngẫu nhiên passage rồi lấy tất cả câu của passage tới khi đủ số câu
      const ids = await prisma.$queryRaw<{ passage_id: string; n: bigint }[]>`
        SELECT passage_id, count(*) AS n FROM questions
        WHERE passage_id IS NOT NULL AND status = 'PUBLISHED' AND deleted_at IS NULL AND part::text = ANY(${parts as string[]})
        GROUP BY passage_id ORDER BY random() LIMIT ${q.limit}`;
      const pick: string[] = [];
      let total = 0;
      for (const r of ids) {
        if (total >= q.limit) break;
        pick.push(r.passage_id);
        total += Number(r.n);
      }
      const rows = await prisma.question.findMany({ where: { ...base, passageId: { in: pick } }, include: { passage: true }, orderBy: [{ passageId: 'asc' }, { orderInPassage: 'asc' }] });
      return rows.map((r) => toQuestion(r, tags));
    }

    const all = await prisma.question.findMany({ where: base, select: { id: true } });
    const chosen = shuffle(all.map((a) => a.id)).slice(0, q.limit);
    const rows = await prisma.question.findMany({ where: { id: { in: chosen } }, include: { passage: true } });
    const order = new Map(chosen.map((id, i) => [id, i]));
    return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)).map((r) => toQuestion(r, tags));
  })
);

const shuffle = <T>(a: T[]) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

const answerOf = (correct: Prisma.JsonValue | null) => {
  const c = (correct ?? {}) as { keys?: string[]; text?: string[] };
  return { keys: (c.keys ?? []).map((k) => k.toUpperCase()), text: (c.text ?? []).map((t) => t.trim().toLowerCase()) };
};

/**
 * POST /catalog/practice/check { answers: [{ questionId, answer }] }
 * Chấm ngay từng câu ở chế độ luyện tập (không lưu lượt làm). Trả đáp án đúng + lời giải.
 */
testsRouter.post(
  '/practice/check',
  handler(async (req) => {
    const body = parse(
      z.object({ answers: z.array(z.object({ questionId: z.string().uuid(), answer: z.union([z.string(), z.array(z.string())]).nullable() })).min(1).max(200) }),
      req.body
    );
    const rows = await prisma.question.findMany({ where: { id: { in: body.answers.map((a) => a.questionId) }, deletedAt: null } });
    const byId = new Map(rows.map((r) => [r.id, r]));
    return body.answers.map((a) => {
      const qn = byId.get(a.questionId);
      if (!qn) return { questionId: a.questionId, isCorrect: false, correctAnswer: null, explanation: null };
      const ans = answerOf(qn.correctAnswer);
      const given = (Array.isArray(a.answer) ? a.answer : a.answer ? [a.answer] : []).map((x) => x.trim());
      const isCorrect = ans.keys.length
        ? given.length === ans.keys.length && given.every((g) => ans.keys.includes(g.toUpperCase()))
        : ans.text.length
          ? given.some((g) => ans.text.includes(g.toLowerCase()))
          : false;
      return {
        questionId: qn.id,
        isCorrect,
        correctAnswer: ans.keys.length === 1 ? ans.keys[0] : ans.keys.length ? ans.keys : ans.text,
        explanation: qn.explanationMd,
        translationVi: qn.translationVi,
      };
    });
  })
);

/** Đề Viết/Nói: GET /catalog/practice/writing | /speaking?examType=&part=&limit= */
for (const [path, type] of [
  ['/practice/writing', 'ESSAY'],
  ['/practice/speaking', 'SPEAKING_RESPONSE'],
] as const) {
  testsRouter.get(
    path,
    handler(async (req) => {
      const q = parse(z.object({ examType: examTypeQ, part: z.string().optional(), limit: z.coerce.number().int().min(1).max(500).default(100) }), req.query);
      const parts = q.part ? partsOf(q.part) : undefined;
      const rows = await prisma.question.findMany({
        where: { ...PUBLISHED, type, examType: q.examType, ...(parts ? { part: { in: parts } } : {}) },
        include: { passage: true, rubric: true },
        orderBy: [{ examType: 'asc' }, { part: 'asc' }, { createdAt: 'asc' }],
        take: q.limit,
      });
      const tags = await tagSlugMap();
      return rows.map((r: QuestionWithPassage & { rubric: { code: string; name: string; criteria: Prisma.JsonValue; scaleMax: Prisma.Decimal } | null }) => ({
        ...toQuestion(r, tags),
        sampleAnswer: (r.taskConfig as { sampleAnswer?: string } | null)?.sampleAnswer,
        rubric: r.rubric ? { code: r.rubric.code, name: r.rubric.name, scaleMax: Number(r.rubric.scaleMax), criteria: r.rubric.criteria } : undefined,
      }));
    })
  );
}

// GET /catalog/practice/dictation → danh sách bài chép chính tả
testsRouter.get(
  '/practice/dictation',
  handler(async () => {
    const rows = await prisma.passage.findMany({ where: { ...PUBLISHED, purpose: 'DICTATION' }, orderBy: { createdAt: 'asc' } });
    return rows.map((p) => ({
      id: p.id,
      title: p.title ?? 'Bài nghe',
      level: p.level ?? undefined,
      examType: p.examType ?? undefined,
      audioUrl: p.audioUrl ?? undefined,
      sentences: Array.isArray(p.segments) ? p.segments.length : 0,
      isFree: p.isFree,
    }));
  })
);

// GET /catalog/practice/dictation/:id → bài chép chính tả (segments [{startMs,endMs,text}], transcript)
testsRouter.get(
  '/practice/dictation/:id',
  handler(async (req) => {
    if (!isUuid(String(req.params.id))) throw notFound('Bài chép chính tả');
    const p = await prisma.passage.findFirst({ where: { id: String(req.params.id), ...PUBLISHED, purpose: 'DICTATION' } });
    if (!p) throw notFound('Bài chép chính tả');
    return { ...toPassage(p), level: p.level ?? undefined, transcript: p.transcript ?? '', segments: (p.segments as unknown[]) ?? [] };
  })
);
