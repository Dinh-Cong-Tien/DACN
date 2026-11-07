import type { Lesson as DbLesson } from '@prisma/client';
import { buildArticleGraph, type ArticleGraphIndex } from '@toeic-vstep/shared';
import { toKnowledge } from './lesson-knowledge';
import { toCues } from './lesson-transcript';

/**
 * Pha INDEXING của GraphRAG mạo từ (thuật toán ở packages/shared/src/logic/article-graphrag.ts).
 * Nguồn: lời thoại (phụ đề) của video; bài chưa có phụ đề → bài giảng viết của chính bài. Bảng từ vựng chỉ để tra phiên âm / từ loại.
 * Index dựng lại khi bài đổi (khoá cache theo updatedAt) — admin sửa nội dung là sơ đồ cập nhật ngay.
 */
const MAX_CACHE = 300;
const cache = new Map<string, { at: number; graph: ArticleGraphIndex | null }>();

export function lessonArticleGraph(l: DbLesson): ArticleGraphIndex | undefined {
  const at = l.updatedAt.getTime();
  const hit = cache.get(l.id);
  if (hit && hit.at === at) return hit.graph ?? undefined;
  const k = toKnowledge(l.knowledge);
  const graph = buildArticleGraph({
    content: l.contentMd ?? undefined,
    transcript: toCues(l.transcript).map((c) => ({ startMs: c.startMs, en: c.en })),
    vocab: k?.vocab ?? [],
  });
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
  cache.set(l.id, { at, graph });
  return graph ?? undefined;
}
