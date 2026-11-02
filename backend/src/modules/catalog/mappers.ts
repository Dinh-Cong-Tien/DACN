/**
 * Mapper DB → DTO cho catalog. Hợp đồng: frontend/src/shared/types (Course, Lesson, MockTestSummary,
 * VocabTopic, VocabWord, GrammarTopic, DictionaryEntry) và IQuestion/IPassage/IMockTest của @toeic-vstep/shared.
 */
import type { ExamPart, ExamType, MockTest, Passage, Prisma, Question, SrsCard, Word } from '@prisma/client';
import { num } from '../../core/dto';

// ---------- Part ----------
/** exam_part (DB) → id phần dùng ở frontend: TOEIC_P5 → PART_5; VSTEP_L1 → VSTEP_LISTENING */
export const partId = (p: ExamPart): string => {
  if (p.startsWith('TOEIC_P')) return `PART_${p.slice(7)}`;
  return { L: 'VSTEP_LISTENING', R: 'VSTEP_READING', W: 'VSTEP_WRITING', S: 'VSTEP_SPEAKING' }[p[6]] ?? p;
};

/** id phần frontend → danh sách exam_part (DB) */
export const partsOf = (id: string): ExamPart[] => {
  const m = id.match(/^PART_([1-7])$/);
  if (m) return [`TOEIC_P${m[1]}` as ExamPart];
  const map: Record<string, ExamPart[]> = {
    VSTEP_LISTENING: ['VSTEP_L1', 'VSTEP_L2', 'VSTEP_L3'],
    VSTEP_READING: ['VSTEP_R1', 'VSTEP_R2', 'VSTEP_R3', 'VSTEP_R4'],
    VSTEP_WRITING: ['VSTEP_W1', 'VSTEP_W2'],
    VSTEP_SPEAKING: ['VSTEP_S1', 'VSTEP_S2', 'VSTEP_S3'],
  };
  if (map[id]) return map[id];
  if (/^(TOEIC_P[1-7]|VSTEP_[LRWS]\d)$/.test(id)) return [id as ExamPart];
  return [];
};

const PART_ORDER = ['PART_1', 'PART_2', 'PART_3', 'PART_4', 'PART_5', 'PART_6', 'PART_7', 'VSTEP_LISTENING', 'VSTEP_READING', 'VSTEP_WRITING', 'VSTEP_SPEAKING'];
export const sortPartIds = (ids: string[]) => [...new Set(ids)].sort((a, b) => PART_ORDER.indexOf(a) - PART_ORDER.indexOf(b));

/** Nhãn phần như mock: ['Part 1–7'] / ['Part 5'] / ['Nghe','Đọc',…] */
export function partLabels(examType: ExamType, ids: string[]): string[] {
  if (examType === 'VSTEP') {
    const vi: Record<string, string> = { VSTEP_LISTENING: 'Nghe', VSTEP_READING: 'Đọc', VSTEP_WRITING: 'Viết', VSTEP_SPEAKING: 'Nói' };
    return ids.map((i) => vi[i]).filter(Boolean);
  }
  const nums = ids.map((i) => Number(i.replace('PART_', ''))).filter(Boolean).sort((a, b) => a - b);
  if (!nums.length) return [];
  const runs: string[] = [];
  let start = nums[0];
  let prev = nums[0];
  for (const n of [...nums.slice(1), Infinity]) {
    if (n !== prev + 1) {
      runs.push(start === prev ? `Part ${start}` : `Part ${start}–${prev}`);
      start = n;
    }
    prev = n;
  }
  return runs;
}

export const PART_TITLE: Record<string, string> = {
  PART_1: 'Part 1 · Mô tả tranh',
  PART_2: 'Part 2 · Hỏi – Đáp',
  PART_3: 'Part 3 · Hội thoại ngắn',
  PART_4: 'Part 4 · Bài nói ngắn',
  PART_5: 'Part 5 · Hoàn thành câu',
  PART_6: 'Part 6 · Hoàn thành đoạn văn',
  PART_7: 'Part 7 · Đọc hiểu',
  VSTEP_LISTENING: 'Listening · Kỹ năng Nghe',
  VSTEP_READING: 'Reading · Kỹ năng Đọc',
  VSTEP_WRITING: 'Writing · Kỹ năng Viết',
  VSTEP_SPEAKING: 'Speaking · Kỹ năng Nói',
};

// ---------- Câu hỏi ----------
export type QuestionWithPassage = Question & { passage: Passage | null };

export const toPassage = (p: Passage) => ({
  id: p.id,
  examType: (p.examType ?? 'TOEIC') as ExamType,
  partOrSkill: p.part ? partId(p.part) : 'DICTATION',
  title: p.title,
  content: p.contentMd ?? '',
  audioUrl: p.audioUrl,
  imageUrl: p.imageUrl,
});

/** irt_b (−4…4) → độ khó 1–5 hiển thị */
const difficulty = (b: Prisma.Decimal) => Math.min(5, Math.max(1, Math.round(Number(b) / 1.5 + 3)));

const LEVEL_LABEL = (q: Question) => q.level ?? (q.examType === 'TOEIC' ? '' : '');

/**
 * IQuestion. Khi `reveal=false` (đang làm bài) không trả đáp án / lời giải.
 * Câu đơn có audio/ảnh riêng (Part 1–2) được bọc thành passage ảo `q:<id>` để engine hiển thị media.
 */
export function toQuestion(q: QuestionWithPassage, tagSlugs: Map<string, string>, reveal = false) {
  const own = !q.passage && (q.audioUrl || q.imageUrl);
  const passage = q.passage
    ? toPassage(q.passage)
    : own
      ? { id: `q:${q.id}`, examType: q.examType, partOrSkill: partId(q.part), title: null, content: '', audioUrl: q.audioUrl, imageUrl: q.imageUrl }
      : null;
  const correct = q.correctAnswer as { keys?: string[]; text?: string[] } | null;
  return {
    id: q.id,
    examType: q.examType,
    type: q.type,
    skillType: q.skill,
    partOrSkill: partId(q.part),
    level: LEVEL_LABEL(q),
    stem: q.stem,
    options: (q.options as { key: string; text: string }[] | null) ?? [],
    correctAnswer: reveal ? (correct?.keys?.length === 1 ? { key: correct.keys[0] } : (correct?.keys ?? correct?.text ?? '')) : '',
    explanation: reveal ? q.explanationMd : null,
    translationVi: reveal ? q.translationVi : undefined,
    difficulty: difficulty(q.irtB),
    tags: q.tagIds.map((t) => tagSlugs.get(t)).filter((x): x is string => !!x),
    passageId: passage?.id ?? null,
    passage,
    orderInPassage: q.orderInPassage ?? undefined,
    audioUrl: q.audioUrl,
    imageUrl: q.imageUrl,
    taskConfig: q.taskConfig ?? undefined,
  };
}

// ---------- Đề ----------
export const toTestSummary = (t: MockTest, partIds: string[]) => ({
  id: t.id,
  slug: t.slug,
  title: t.title,
  examType: t.examType,
  level: t.level ?? '',
  durationMinutes: t.durationMin,
  totalQuestions: t.totalQuestions,
  parts: partLabels(t.examType, partIds),
  partIds,
  attempts: t.attemptsCount,
  isFree: t.isFree,
  year: t.year ?? t.createdAt.getFullYear(),
  tags: t.tags,
  coverUrl: t.coverUrl ?? undefined,
  kind: t.kind,
});

// ---------- Từ vựng ----------
/** srs_status → ReviewStatus của frontend ('LEARNING' | 'REVIEWING' | 'MASTERED') */
export const reviewStatus = (c?: SrsCard | null): 'LEARNING' | 'REVIEWING' | 'MASTERED' =>
  !c || c.status === 'NEW' || c.status === 'LEARNING' ? 'LEARNING' : c.status === 'MASTERED' ? 'MASTERED' : 'REVIEWING';

export const toVocabWord = (w: Word, topicName: string, card?: SrsCard | null) => ({
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
  topic: topicName,
  status: reviewStatus(card),
  nextReviewAt: (card?.nextReviewAt ?? new Date()).toISOString(),
  easeFactor: num(card?.easeFactor) ?? 2.5,
  intervalDays: card?.intervalDays ?? 0,
  repetitions: card?.repetitions ?? 0,
  cardId: card?.id,
});

export const toDictionaryEntry = (w: Word) => ({
  id: w.id,
  word: w.headword,
  ipa: w.ipaUs ?? w.ipaUk ?? '',
  pos: w.pos,
  meaningVi: w.meaningVi,
  meaningEn: w.meaningEn ?? '',
  example: w.exampleEn ?? '',
});

// ---------- Ngữ pháp ----------
type RawRule = { title?: string; detail?: string; detailMd?: string; example?: string; commonErrors?: unknown };
export const toRules = (rules: Prisma.JsonValue) =>
  (Array.isArray(rules) ? (rules as RawRule[]) : []).map((r) => ({
    title: r.title ?? '',
    detail: r.detail ?? r.detailMd ?? '',
    example: r.example ?? '',
    commonErrors: r.commonErrors,
  }));

/** Mã màu gradient mặc định khi bản ghi không có theme_gradient */
export const GRADIENTS = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500', 'from-rose-500 to-pink-500', 'from-amber-400 to-orange-500', 'from-sky-500 to-cyan-500', 'from-fuchsia-500 to-purple-500'];
export const gradientAt = (i: number) => GRADIENTS[i % GRADIENTS.length];
