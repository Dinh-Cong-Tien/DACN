import { Router } from 'express';
import { z } from 'zod';
import type { SrsCard } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { optionalAuth } from '../../core/auth';
import { limits, rateLimit } from '../../middleware/rate-limit';
import { handler, notFound, parse } from '../../core/http';
import { isUuid } from './courses';
import { gradientAt, toDictionaryEntry, toQuestion, toRules, toVocabWord } from './mappers';
import { tagSlugMap } from './tests';

/** Từ vựng (flashcard), tra từ và ngữ pháp. */
export const lexiconRouter = Router();

const topicWhere = (idOrSlug: string) => ({ deletedAt: null, ...(isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug }) });

// GET /catalog/vocabulary/topics?examType= → VocabTopic[] (learned = số thẻ đã ôn ít nhất 1 lần)
lexiconRouter.get(
  '/vocabulary/topics',
  optionalAuth,
  handler(async (req) => {
    const { examType } = parse(z.object({ examType: z.enum(['TOEIC', 'VSTEP']).optional() }), req.query);
    const topics = await prisma.vocabTopic.findMany({
      where: { deletedAt: null, ...(examType ? { OR: [{ examType }, { examType: null }] } : {}) },
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { wordTopics: true } } },
    });
    const learned = new Map<string, number>();
    if (req.user) {
      const rows = await prisma.$queryRaw<{ topic_id: string; n: bigint }[]>`
        SELECT w.topic_id, count(*) AS n FROM srs_cards c JOIN words w ON w.id = c.word_id
        WHERE c.user_id = ${req.user.id}::uuid AND c.repetitions > 0 AND w.topic_id IS NOT NULL GROUP BY w.topic_id`;
      rows.forEach((r) => learned.set(r.topic_id, Number(r.n)));
    }
    return topics.map((t, i) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      icon: t.icon ?? 'BookOpen',
      total: t._count.wordTopics || t.wordsCount,
      learned: learned.get(t.id) ?? 0,
      gradient: t.themeGradient ?? gradientAt(i),
      examType: t.examType ?? undefined,
      level: t.level ?? undefined,
      isFree: t.isFree,
    }));
  })
);

// GET /catalog/vocabulary/topics/:idOrSlug → { topic, words: VocabWord[] } (kèm trạng thái SRS nếu đăng nhập)
lexiconRouter.get(
  '/vocabulary/topics/:idOrSlug',
  optionalAuth,
  handler(async (req) => {
    const t = await prisma.vocabTopic.findFirst({ where: topicWhere(String(req.params.idOrSlug)) });
    if (!t) throw notFound('Bộ từ vựng');
    const words = await prisma.word.findMany({ where: { topicId: t.id }, orderBy: [{ orderInTopic: 'asc' }, { headword: 'asc' }] });
    const cards = req.user ? await prisma.srsCard.findMany({ where: { userId: req.user.id, wordId: { in: words.map((w) => w.id) } } }) : [];
    const byWord = new Map<string, SrsCard>(cards.map((c) => [c.wordId as string, c]));
    return {
      topic: { id: t.id, slug: t.slug, name: t.name, icon: t.icon ?? 'BookOpen', total: words.length, learned: cards.filter((c) => c.repetitions > 0).length, gradient: t.themeGradient ?? gradientAt(t.orderIndex), isFree: t.isFree },
      words: words.map((w) => toVocabWord(w, t.name, byWord.get(w.id))),
    };
  })
);

/** GET /catalog/dictionary?q=accomplish&limit=10 → DictionaryEntry[] (khớp đầu từ trước, rồi gần đúng pg_trgm) */
lexiconRouter.get(
  '/dictionary',
  optionalAuth,
  rateLimit('dict', limits.guestDictionary, { onlyGuest: true, message: 'Bạn tra từ quá nhiều. Đăng nhập để tra không giới hạn, hoặc thử lại sau ít phút.' }),
  handler(async (req) => {
    const q = parse(z.object({ q: z.string().trim().min(1).max(80), limit: z.coerce.number().int().min(1).max(30).default(10) }), req.query);
    const term = q.q.toLowerCase();
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM words
      WHERE lower(headword) LIKE ${term + '%'} OR headword % ${term}
      ORDER BY (lower(headword) = ${term}) DESC, (lower(headword) LIKE ${term + '%'}) DESC, similarity(headword, ${term}) DESC, length(headword)
      LIMIT ${q.limit * 3}`;
    const words = await prisma.word.findMany({ where: { id: { in: rows.map((r) => r.id) } } });
    const order = new Map(rows.map((r, i) => [r.id, i]));
    // Một từ có thể xuất hiện ở nhiều bộ: giữ bản đầu tiên theo (headword, pos)
    const seen = new Set<string>();
    return words
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
      .filter((w) => {
        const k = `${w.headword.toLowerCase()}|${w.pos}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, q.limit)
      .map(toDictionaryEntry);
  })
);

/** Số câu bài tập + độ thành thạo theo chủ điểm ngữ pháp (qua tag_id). */
async function grammarStats(tagIds: string[], userId?: string) {
  const counts = new Map<string, number>();
  if (tagIds.length) {
    const rows = await prisma.$queryRaw<{ tag: string; n: bigint }[]>`
      SELECT t AS tag, count(*) AS n FROM questions, unnest(tag_ids) AS t
      WHERE status = 'PUBLISHED' AND deleted_at IS NULL AND t = ANY(${tagIds}::uuid[]) GROUP BY t`;
    rows.forEach((r) => counts.set(r.tag, Number(r.n)));
  }
  const mastery = new Map<string, number>();
  if (userId && tagIds.length) {
    const ab = await prisma.userAbility.findMany({ where: { userId, tagId: { in: tagIds } } });
    ab.forEach((a) => mastery.set(a.tagId as string, Math.round(Number(a.mastery) * 100)));
  }
  return { counts, mastery };
}

// GET /catalog/grammar → GrammarTopic[]
lexiconRouter.get(
  '/grammar',
  optionalAuth,
  handler(async (req) => {
    const topics = await prisma.grammarTopic.findMany({ where: { deletedAt: null, status: 'PUBLISHED' }, orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }] });
    const { counts, mastery } = await grammarStats(topics.map((t) => t.tagId).filter((x): x is string => !!x), req.user?.id);
    return topics.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      level: t.level ?? '',
      category: t.category,
      summary: t.summary,
      rules: toRules(t.rules),
      questionsCount: t.tagId ? (counts.get(t.tagId) ?? 0) : 0,
      progress: t.tagId ? (mastery.get(t.tagId) ?? 0) : 0,
    }));
  })
);

// GET /catalog/grammar/:slug → GrammarTopic
lexiconRouter.get(
  '/grammar/:slug',
  optionalAuth,
  handler(async (req) => {
    const t = await prisma.grammarTopic.findFirst({ where: { deletedAt: null, status: 'PUBLISHED', ...(isUuid(String(req.params.slug)) ? { id: String(req.params.slug) } : { slug: String(req.params.slug) }) } });
    if (!t) throw notFound('Chủ điểm ngữ pháp');
    const { counts, mastery } = await grammarStats(t.tagId ? [t.tagId] : [], req.user?.id);
    return {
      id: t.id,
      slug: t.slug,
      title: t.title,
      level: t.level ?? '',
      category: t.category,
      summary: t.summary,
      rules: toRules(t.rules),
      questionsCount: t.tagId ? (counts.get(t.tagId) ?? 0) : 0,
      progress: t.tagId ? (mastery.get(t.tagId) ?? 0) : 0,
    };
  })
);

// GET /catalog/grammar/:slug/questions?limit=10 → IQuestion[] (ngẫu nhiên, không kèm đáp án; chấm qua /practice/check)
lexiconRouter.get(
  '/grammar/:slug/questions',
  handler(async (req) => {
    const { limit } = parse(z.object({ limit: z.coerce.number().int().min(1).max(50).default(10) }), req.query);
    const t = await prisma.grammarTopic.findFirst({ where: { deletedAt: null, ...(isUuid(String(req.params.slug)) ? { id: String(req.params.slug) } : { slug: String(req.params.slug) }) } });
    if (!t) throw notFound('Chủ điểm ngữ pháp');
    if (!t.tagId) return [];
    const ids = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM questions WHERE status = 'PUBLISHED' AND deleted_at IS NULL AND ${t.tagId}::uuid = ANY(tag_ids)
        AND type NOT IN ('ESSAY','SPEAKING_RESPONSE') ORDER BY random() LIMIT ${limit}`;
    const rows = await prisma.question.findMany({ where: { id: { in: ids.map((i) => i.id) } }, include: { passage: true } });
    const tags = await tagSlugMap();
    return rows.map((r) => toQuestion(r, tags));
  })
);
