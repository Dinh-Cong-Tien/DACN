/** Sổ tay lỗi sai, ôn tập SM-2 (luồng #9), flashcard từ vựng, chép chính tả. */
import { Router } from 'express';
import { pid } from './learner.shared';
import { z } from 'zod';
import type { MistakeCause, Prisma, SrsCard, Word } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { badRequest, forbidden, handler, me, notFound, parse } from '../../core/http';
import { correctKeyOf, feToParts, recordActivity, reviewStatusOf, selectedKeyOf, sm2, toIQuestion } from './learner.shared';
import { evaluateAchievements } from './progress';

export const studyRouter = Router();

const CAUSES = ['GRAMMAR', 'VOCABULARY', 'LISTENING', 'READING', 'TIME_PRESSURE', 'CARELESS', 'UNCLASSIFIED'] as const;
const SOURCE_LABEL: Record<string, string> = { MOCK_TEST: 'Đề thi thử', PRACTICE: 'Luyện tập', PLACEMENT: 'Bài test đầu vào', LESSON_QUIZ: 'Bài kiểm tra bài học', ASSIGNMENT: 'Bài được giao', DRILL: 'Luyện điểm yếu' };

// ---------------- Mistake DTO ----------------
const mistakeInclude = {
  question: { include: { passage: true } },
  lastAttempt: { include: { test: { select: { title: true } } } },
  srsCardMistakes: true,
} satisfies Prisma.MistakeEntryInclude;
type MistakeRow = Prisma.MistakeEntryGetPayload<{ include: typeof mistakeInclude }>;

function toMistake(m: MistakeRow) {
  const card = m.srsCardMistakes[0];
  return {
    id: m.id,
    question: toIQuestion(m.question, true),
    userAnswer: selectedKeyOf(m.lastWrongAnswer) ?? '',
    correctAnswer: correctKeyOf(m.question),
    cause: m.cause,
    source: m.lastAttempt?.test?.title ?? SOURCE_LABEL[m.source] ?? m.source,
    date: m.lastWrongAt.toISOString(),
    count: m.wrongCount,
    isResolved: m.isResolved,
    nextReviewAt: (card?.nextReviewAt ?? m.lastWrongAt).toISOString(),
    note: m.note ?? undefined,
    cardId: card?.id,
  };
}

studyRouter.get(
  '/mistakes',
  handler(async (req) => {
    const q = parse(
      z.object({
        cause: z.enum(CAUSES).optional(),
        part: z.string().optional(),
        resolved: z.enum(['true', 'false']).optional(),
        due: z.enum(['true']).optional(),
      }),
      req.query
    );
    const where: Prisma.MistakeEntryWhereInput = {
      userId: me(req).id,
      ...(q.cause ? { cause: q.cause } : {}),
      ...(q.part ? { question: { part: { in: feToParts(q.part) } } } : {}),
      ...(q.resolved ? { isResolved: q.resolved === 'true' } : {}),
      ...(q.due ? { srsCardMistakes: { some: { nextReviewAt: { lte: new Date() }, status: { not: 'SUSPENDED' } } } } : {}),
    };
    const rows = await prisma.mistakeEntry.findMany({ where, include: mistakeInclude, orderBy: { lastWrongAt: 'desc' }, take: 500 });
    return rows.map(toMistake);
  })
);

studyRouter.patch(
  '/mistakes/:id',
  handler(async (req) => {
    const body = parse(z.object({ note: z.string().max(2000).nullable().optional(), cause: z.enum(CAUSES).optional(), isResolved: z.boolean().optional() }), req.body);
    const m = await prisma.mistakeEntry.findUnique({ where: { id: pid(req) } });
    if (!m || m.userId !== me(req).id) throw notFound('Lỗi sai');
    const updated = await prisma.mistakeEntry.update({
      where: { id: m.id },
      data: {
        note: body.note,
        cause: body.cause as MistakeCause | undefined,
        causeSource: body.cause ? 'USER' : undefined,
        isResolved: body.isResolved,
        resolvedAt: body.isResolved === undefined ? undefined : body.isResolved ? new Date() : null,
      },
      include: mistakeInclude,
    });
    if (body.isResolved !== undefined) {
      await prisma.srsCard.updateMany({ where: { mistakeId: m.id }, data: { status: body.isResolved ? 'MASTERED' : 'LEARNING' } });
      if (body.isResolved) await evaluateAchievements(m.userId).catch(() => undefined);
    }
    return toMistake(updated);
  })
);

studyRouter.delete(
  '/mistakes/:id',
  handler(async (req) => {
    const m = await prisma.mistakeEntry.findUnique({ where: { id: pid(req) } });
    if (!m || m.userId !== me(req).id) throw notFound('Lỗi sai');
    await prisma.mistakeEntry.delete({ where: { id: m.id } }); // srs_cards xoá theo CASCADE
    return { ok: true };
  })
);

// ---------------- VocabWord DTO ----------------
function toVocabWord(w: Word & { topic?: { name: string } | null }, card?: SrsCard | null) {
  return {
    id: w.id,
    word: w.headword,
    ipa: w.ipaUs ?? w.ipaUk ?? '',
    ipaUk: w.ipaUk ?? undefined,
    pos: w.pos,
    meaningVi: w.meaningVi,
    meaningEn: w.meaningEn ?? undefined,
    example: w.exampleEn ?? '',
    exampleVi: w.exampleVi ?? undefined,
    imageUrl: w.imageUrl ?? undefined,
    audioUrl: w.audioUrl ?? undefined,
    topic: w.topic?.name ?? '',
    topicId: w.topicId ?? undefined,
    status: reviewStatusOf(card?.status),
    isLearning: !!card,
    nextReviewAt: (card?.nextReviewAt ?? new Date()).toISOString(),
    easeFactor: card ? Number(card.easeFactor) : 2.5,
    intervalDays: card?.intervalDays ?? 0,
    repetitions: card?.repetitions ?? 0,
    cardId: card?.id,
  };
}

/** VocabTopic kèm số từ đã học của tôi */
studyRouter.get(
  '/vocab/topics',
  handler(async (req) => {
    const userId = me(req).id;
    const topics = await prisma.vocabTopic.findMany({ where: { deletedAt: null }, orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }] });
    const learned = await prisma.$queryRaw<{ topic_id: string; n: bigint }[]>`
      SELECT w.topic_id, count(*) AS n FROM srs_cards c JOIN words w ON w.id = c.word_id
      WHERE c.user_id = ${userId}::uuid AND c.status IN ('REVIEWING','MASTERED') GROUP BY w.topic_id`;
    const lmap = new Map(learned.map((l) => [l.topic_id, Number(l.n)]));
    return topics.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      icon: t.icon ?? 'BookOpen',
      total: t.wordsCount,
      learned: lmap.get(t.id) ?? 0,
      gradient: t.themeGradient ?? 'from-indigo-500 to-violet-500',
      examType: t.examType ?? undefined,
      level: t.level ?? undefined,
      isFree: t.isFree,
    }));
  })
);

studyRouter.get(
  '/vocab/topics/:id/words',
  handler(async (req) => {
    const userId = me(req).id;
    const topic = await prisma.vocabTopic.findFirst({ where: { deletedAt: null, OR: [{ id: /^[0-9a-f-]{36}$/i.test(pid(req)) ? pid(req) : undefined }, { slug: pid(req) }] } });
    if (!topic) throw notFound('Bộ từ vựng');
    const words = await prisma.word.findMany({ where: { topicId: topic.id }, include: { topic: { select: { name: true } } }, orderBy: [{ orderInTopic: 'asc' }, { headword: 'asc' }] });
    const cards = await prisma.srsCard.findMany({ where: { userId, wordId: { in: words.map((w) => w.id) } } });
    const cmap = new Map(cards.map((c) => [c.wordId, c]));
    return { topic: { id: topic.id, slug: topic.slug, name: topic.name, icon: topic.icon ?? 'BookOpen', total: words.length }, words: words.map((w) => toVocabWord(w, cmap.get(w.id))) };
  })
);

/** Từ trong sổ ôn tập của tôi (MOCK_VOCAB) */
studyRouter.get(
  '/vocab/my-words',
  handler(async (req) => {
    const cards = await prisma.srsCard.findMany({
      where: { userId: me(req).id, wordId: { not: null } },
      include: { word: { include: { topic: { select: { name: true } } } } },
      orderBy: { nextReviewAt: 'asc' },
      take: 1000,
    });
    return cards.filter((c) => c.word).map((c) => toVocabWord(c.word!, c));
  })
);

/** Thêm từ vào ôn tập (tạo thẻ SRS); body.wordIds hoặc topicId (cả bộ) */
studyRouter.post(
  '/vocab/learn',
  handler(async (req) => {
    const userId = me(req).id;
    const body = parse(z.object({ wordIds: z.array(z.string().uuid()).max(500).optional(), topicId: z.string().uuid().optional() }), req.body);
    let ids = body.wordIds ?? [];
    if (body.topicId) {
      const topic = await prisma.vocabTopic.findUnique({ where: { id: body.topicId } });
      if (!topic) throw notFound('Bộ từ vựng');
      ids = [...ids, ...(await prisma.word.findMany({ where: { topicId: topic.id }, select: { id: true } })).map((w) => w.id)];
    }
    if (!ids.length) throw badRequest('Chưa chọn từ');
    const r = await prisma.srsCard.createMany({ data: [...new Set(ids)].map((wordId) => ({ userId, wordId })), skipDuplicates: true });
    return { added: r.count };
  })
);

/**
 * Thêm từ vào sổ từ cá nhân: từ đã có trong kho (khớp headword) thì dùng lại, chưa có thì thêm vào kho tra cứu (topic NULL).
 * Sau đó tạo thẻ SRS để từ xuất hiện trong lịch ôn.
 */
studyRouter.post(
  '/vocab/custom',
  handler(async (req) => {
    const userId = me(req).id;
    const body = parse(
      z.object({ word: z.string().trim().min(1).max(80), meaning: z.string().trim().min(1).max(500), example: z.string().trim().max(500).optional(), pos: z.string().trim().max(12).optional() }),
      req.body
    );
    const existing = await prisma.word.findFirst({ where: { headword: { equals: body.word, mode: 'insensitive' } }, orderBy: { topicId: 'asc' } });
    const word =
      existing ??
      (await prisma.word.create({ data: { headword: body.word, pos: body.pos || 'word', meaningVi: body.meaning, exampleEn: body.example || null, topicId: null } }));
    const card = await prisma.srsCard.upsert({
      where: { userId_wordId: { userId, wordId: word.id } },
      create: { userId, wordId: word.id },
      update: {},
      include: { word: { include: { topic: { select: { name: true } } } } },
    });
    return toVocabWord(card.word!, card);
  })
);

// ---------------- Ôn tập SM-2 ----------------
studyRouter.get(
  '/review/due',
  handler(async (req) => {
    const userId = me(req).id;
    const { limit } = parse(z.object({ limit: z.coerce.number().int().min(1).max(200).default(50) }), req.query);
    const now = new Date();
    const cards = await prisma.srsCard.findMany({
      where: { userId, status: { not: 'SUSPENDED' }, nextReviewAt: { lte: now } },
      include: { word: { include: { topic: { select: { name: true } } } }, mistake: { include: mistakeInclude } },
      orderBy: { nextReviewAt: 'asc' },
      take: limit,
    });
    const [totalDue, upcoming] = await Promise.all([
      prisma.srsCard.count({ where: { userId, status: { not: 'SUSPENDED' }, nextReviewAt: { lte: now } } }),
      prisma.srsCard.count({ where: { userId, status: { not: 'SUSPENDED' }, nextReviewAt: { gt: now, lte: new Date(now.getTime() + 7 * 86400_000) } } }),
    ]);
    return {
      totalDue,
      upcoming7d: upcoming,
      words: cards.filter((c) => c.word).map((c) => toVocabWord(c.word!, c)),
      mistakes: cards.filter((c) => c.mistake).map((c) => toMistake(c.mistake!)),
    };
  })
);

const reviewBody = z
  .object({
    cardId: z.string().uuid().optional(),
    wordId: z.string().uuid().optional(),
    mistakeId: z.string().uuid().optional(),
    quality: z.number().int().min(0).max(5),
    responseMs: z.number().int().min(0).max(600_000).optional(),
  })
  .refine((b) => b.cardId || b.wordId || b.mistakeId, 'Thiếu cardId / wordId / mistakeId');

// Luồng #9
studyRouter.post(
  '/review',
  handler(async (req) => {
    const userId = me(req).id;
    const body = parse(reviewBody, req.body);
    let card = body.cardId
      ? await prisma.srsCard.findUnique({ where: { id: body.cardId } })
      : body.wordId
        ? await prisma.srsCard.findUnique({ where: { userId_wordId: { userId, wordId: body.wordId } } })
        : await prisma.srsCard.findUnique({ where: { userId_mistakeId: { userId, mistakeId: body.mistakeId! } } });
    // Ôn từ chưa có thẻ (học flashcard lần đầu) → tạo thẻ
    if (!card && body.wordId) card = await prisma.srsCard.create({ data: { userId, wordId: body.wordId } });
    if (!card) throw notFound('Thẻ ôn tập');
    if (card.userId !== userId) throw forbidden();

    const next = sm2({ easeFactor: Number(card.easeFactor), intervalDays: card.intervalDays, repetitions: card.repetitions, lapses: card.lapses }, body.quality);
    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.srsCard.update({
        where: { id: card!.id },
        data: { easeFactor: next.easeFactor, intervalDays: next.intervalDays, repetitions: next.repetitions, lapses: next.lapses, status: next.status, nextReviewAt: next.nextReviewAt, lastReviewedAt: new Date() },
      });
      await tx.srsReviewLog.create({
        data: { cardId: c.id, userId, quality: body.quality, prevInterval: card!.intervalDays, newInterval: next.intervalDays, newEase: next.easeFactor, responseMs: body.responseMs },
      });
      if (c.mistakeId) {
        if (next.status === 'MASTERED') await tx.mistakeEntry.update({ where: { id: c.mistakeId }, data: { isResolved: true, resolvedAt: new Date() } });
      }
      await recordActivity(tx, userId, { cards: 1, xp: body.quality >= 3 ? 2 : 1 });
      return c;
    });
    if (next.status === 'MASTERED') await evaluateAchievements(userId).catch(() => undefined);
    return {
      cardId: updated.id,
      status: reviewStatusOf(updated.status),
      intervalDays: updated.intervalDays,
      easeFactor: Number(updated.easeFactor),
      repetitions: updated.repetitions,
      nextReviewAt: updated.nextReviewAt.toISOString(),
    };
  })
);

// ---------------- Chép chính tả ----------------
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

/** So khớp từ theo LCS → đánh dấu đúng / thiếu / thừa */
function diffWords(ref: string[], typed: string[]) {
  const n = ref.length, m = typed.length;
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = ref[i] === typed[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: { word: string; status: 'ok' | 'missing' | 'extra' }[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (ref[i] === typed[j]) (out.push({ word: ref[i], status: 'ok' }), i++, j++);
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ word: ref[i++], status: 'missing' });
    else out.push({ word: typed[j++], status: 'extra' });
  }
  while (i < n) out.push({ word: ref[i++], status: 'missing' });
  while (j < m) out.push({ word: typed[j++], status: 'extra' });
  return { matched: dp[0][0], diff: out };
}

studyRouter.post(
  '/dictation',
  handler(async (req) => {
    const userId = me(req).id;
    const body = parse(
      z.object({ passageId: z.string().uuid(), typedText: z.string().max(20000), segmentIndex: z.number().int().min(0).optional(), replays: z.number().int().min(0).max(999).optional(), timeSpentSec: z.number().int().min(0).max(36000).optional() }),
      req.body
    );
    const p = await prisma.passage.findFirst({ where: { id: body.passageId, purpose: 'DICTATION', deletedAt: null } });
    if (!p) throw notFound('Bài chép chính tả');
    const segs = (p.segments as { text: string }[] | null) ?? [];
    const refText = body.segmentIndex !== undefined && segs[body.segmentIndex] ? segs[body.segmentIndex].text : (p.transcript ?? '');
    const ref = norm(refText);
    if (!ref.length) throw badRequest('Bài chưa có đáp án');
    const { matched, diff } = diffWords(ref, norm(body.typedText));
    const accuracy = Math.round((matched / ref.length) * 1000) / 10;
    const at = await prisma.$transaction(async (tx) => {
      const a = await tx.examAttempt.create({
        data: {
          userId,
          passageId: p.id,
          mode: 'DICTATION',
          status: 'COMPLETED',
          submittedAt: new Date(),
          timeSpentSec: body.timeSpentSec ?? 0,
          correctCount: matched,
          totalCount: Math.min(ref.length, 32767),
          scoreTotal: accuracy,
          resultDetail: { typedText: body.typedText, diff, replays: body.replays ?? 0, segmentIndex: body.segmentIndex ?? null },
        },
      });
      await recordActivity(tx, userId, { minutes: Math.max(1, Math.round((body.timeSpentSec ?? 60) / 60)), xp: Math.round(accuracy / 10) });
      return a;
    });
    return { attemptId: at.id, accuracy, matched, total: ref.length, diff, reference: refText };
  })
);

studyRouter.get(
  '/dictation/history',
  handler(async (req) => {
    const rows = await prisma.examAttempt.findMany({
      where: { userId: me(req).id, mode: 'DICTATION' },
      include: { passage: { select: { id: true, title: true } } },
      orderBy: { submittedAt: 'desc' },
      take: 50,
    });
    return rows.map((r) => ({ attemptId: r.id, passageId: r.passageId, title: r.passage?.title ?? '', accuracy: Number(r.scoreTotal ?? 0), date: (r.submittedAt ?? r.startedAt).toISOString() }));
  })
);
