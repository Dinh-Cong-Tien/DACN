/**
 * Phần dùng chung của module learner: mapper câu hỏi/đề theo hợp đồng frontend (IQuestion, IMockTest),
 * quy đổi điểm, SM-2, ngày giờ VN, cộng XP/streak, cập nhật daily_activities.
 */
import type { ExamPart, ExamType, Passage, Prisma, PrismaClient, Question, SkillType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { badRequest, notFound } from '../../core/http';

export type Tx = Prisma.TransactionClient | PrismaClient;

// ---------------- Part: DB enum ↔ id frontend ----------------
/** TOEIC_P5 → PART_5 · VSTEP_L1..3 → VSTEP_LISTENING · VSTEP_R* → VSTEP_READING · VSTEP_W* → VSTEP_WRITING · VSTEP_S* → VSTEP_SPEAKING */
export function partToFe(p: ExamPart): string {
  if (p.startsWith('TOEIC_P')) return `PART_${p.slice(7)}`;
  if (p.startsWith('VSTEP_L')) return 'VSTEP_LISTENING';
  if (p.startsWith('VSTEP_R')) return 'VSTEP_READING';
  if (p.startsWith('VSTEP_W')) return 'VSTEP_WRITING';
  return 'VSTEP_SPEAKING';
}

/** Id phần của frontend → danh sách ExamPart trong DB */
export function feToParts(id: string): ExamPart[] {
  const m = id.match(/^PART_([1-7])$/);
  if (m) return [`TOEIC_P${m[1]}` as ExamPart];
  if (/^TOEIC_P[1-7]$/.test(id) || /^VSTEP_[LRWS]\d$/.test(id)) return [id as ExamPart];
  const map: Record<string, ExamPart[]> = {
    VSTEP_LISTENING: ['VSTEP_L1', 'VSTEP_L2', 'VSTEP_L3'],
    VSTEP_READING: ['VSTEP_R1', 'VSTEP_R2', 'VSTEP_R3', 'VSTEP_R4'],
    VSTEP_WRITING: ['VSTEP_W1', 'VSTEP_W2'],
    VSTEP_SPEAKING: ['VSTEP_S1', 'VSTEP_S2', 'VSTEP_S3'],
  };
  if (map[id]) return map[id];
  throw badRequest(`Phần thi không hợp lệ: ${id}`);
}

export const PART_NAME: Record<string, string> = {
  PART_1: 'Part 1 · Mô tả tranh',
  PART_2: 'Part 2 · Hỏi – Đáp',
  PART_3: 'Part 3 · Hội thoại ngắn',
  PART_4: 'Part 4 · Bài nói ngắn',
  PART_5: 'Part 5 · Hoàn thành câu',
  PART_6: 'Part 6 · Hoàn thành đoạn văn',
  PART_7: 'Part 7 · Đọc hiểu',
  VSTEP_LISTENING: 'Listening',
  VSTEP_READING: 'Reading',
  VSTEP_WRITING: 'Writing',
  VSTEP_SPEAKING: 'Speaking',
};

export const isListeningPart = (p: ExamPart) => /^TOEIC_P[1-4]$/.test(p) || p.startsWith('VSTEP_L');
export const isObjective = (q: Pick<Question, 'type'>) => q.type !== 'ESSAY' && q.type !== 'SPEAKING_RESPONSE';

// ---------------- Mapper IQuestion ----------------
type QWithPassage = Question & { passage?: Passage | null };

/** Đáp án đúng trong DB: {keys:["B"]} | {text:[...]} | "B" → key/chuỗi */
export function correctKeyOf(q: Pick<Question, 'correctAnswer'>): string {
  const c = q.correctAnswer as unknown;
  if (!c) return '';
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return String(c[0] ?? '');
  const o = c as { keys?: string[]; key?: string; text?: string[] | string };
  if (o.keys?.length) return o.keys.join(',');
  if (o.key) return o.key;
  if (Array.isArray(o.text)) return o.text.join(' | ');
  return o.text ?? '';
}

export function selectedKeyOf(sel: unknown): string | undefined {
  if (!sel) return undefined;
  if (typeof sel === 'string') return sel;
  const o = sel as { keys?: string[]; key?: string; text?: string };
  if (o.keys?.length) return o.keys.join(',');
  return o.key ?? o.text ?? undefined;
}

/** Độ khó 1–5 suy từ tham số IRT b (−4…4) */
const difficultyOf = (b: Prisma.Decimal | number) => Math.min(5, Math.max(1, Math.round(Number(b) / 2 + 3)));

/**
 * IQuestion (packages/shared). `withKey=false` khi đang làm bài: ẩn đáp án, giải thích, bản dịch.
 */
export function toIQuestion(q: QWithPassage, withKey: boolean) {
  const p = q.passage;
  return {
    id: q.id,
    examType: q.examType,
    type: q.type,
    skillType: q.skill,
    partOrSkill: partToFe(q.part),
    level: q.level ?? '',
    stem: q.stem,
    options: ((q.options as { key: string; text: string }[] | null) ?? []).map((o) => ({ key: o.key, text: o.text })),
    correctAnswer: withKey ? (q.type === 'SINGLE_CHOICE' || q.type === 'TRUE_FALSE_NOT_GIVEN' ? { key: correctKeyOf(q) } : correctKeyOf(q)) : '',
    explanation: withKey ? q.explanationMd : null,
    translationVi: withKey ? q.translationVi : undefined,
    difficulty: difficultyOf(q.irtB),
    tags: q.tagIds,
    audioUrl: q.audioUrl ?? undefined,
    imageUrl: q.imageUrl ?? undefined,
    taskConfig: q.taskConfig ?? undefined,
    passageId: q.passageId,
    orderInPassage: q.orderInPassage ?? undefined,
    passage: p
      ? {
          id: p.id,
          examType: p.examType ?? q.examType,
          partOrSkill: p.part ? partToFe(p.part) : partToFe(q.part),
          title: p.title,
          content: p.contentMd ?? '',
          transcript: withKey ? (p.transcript ?? undefined) : undefined,
          // P1/P2 không có passage nên media nằm trên câu hỏi; P3/P4 media nằm ở passage
          audioUrl: p.audioUrl ?? q.audioUrl ?? null,
          imageUrl: p.imageUrl ?? q.imageUrl ?? null,
        }
      : q.audioUrl || q.imageUrl
        ? { id: `q-${q.id}`, examType: q.examType, partOrSkill: partToFe(q.part), title: null, content: '', audioUrl: q.audioUrl, imageUrl: q.imageUrl }
        : null,
  };
}

/** IMockTest: chia section theo Part, giữ thứ tự `ids`. */
export function toIMockTest(
  meta: { id: string; slug: string; title: string; examType: ExamType; durationMinutes: number; targetLevel?: string | null },
  ids: string[],
  questions: QWithPassage[],
  withKey: boolean,
  sectionMinutes?: Record<string, number>
) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const sections: { id: string; name: string; skillType: SkillType; durationMins?: number | null; orderIndex: number; questions: ReturnType<typeof toIQuestion>[] }[] = [];
  for (const id of ids) {
    const q = byId.get(id);
    if (!q) continue;
    const part = partToFe(q.part);
    let sec = sections.find((s) => s.id.endsWith(`-${part}`));
    if (!sec) {
      sec = { id: `${meta.id}-${part}`, name: PART_NAME[part] ?? part, skillType: q.skill, durationMins: sectionMinutes?.[part] ?? null, orderIndex: sections.length + 1, questions: [] };
      sections.push(sec);
    }
    sec.questions.push(toIQuestion(q, withKey));
  }
  return { ...meta, totalQuestions: sections.reduce((a, s) => a + s.questions.length, 0), sections };
}

// ---------------- Tra đề theo id hoặc slug ----------------
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string) => UUID_RE.test(s);

export async function findTest(idOrSlug: string) {
  const t = await prisma.mockTest.findFirst({ where: { deletedAt: null, ...(isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug }) } });
  if (!t) throw notFound('Đề thi');
  return t;
}

// ---------------- Quy đổi điểm ----------------
type ConvTable = { LISTENING?: Record<string, number>; READING?: Record<string, number> };
let convCache: { at: number; toeic: ConvTable | null } | null = null;

async function toeicTable(): Promise<ConvTable | null> {
  if (convCache && Date.now() - convCache.at < 60_000) return convCache.toeic;
  const row = await prisma.systemSetting.findUnique({ where: { key: 'score.conversion.TOEIC' } });
  convCache = { at: Date.now(), toeic: (row?.value as ConvTable) ?? null };
  return convCache.toeic;
}

/** Số câu đúng (trên `total` câu của phần) → điểm TOEIC 5–495, dùng bảng quy đổi 100 câu trong system_settings. */
export async function toeicScaled(skill: 'LISTENING' | 'READING', correct: number, total: number): Promise<number> {
  if (total <= 0) return 5;
  const idx = Math.round((correct / total) * 100);
  const table = (await toeicTable())?.[skill];
  if (table) {
    const v = table[String(idx)];
    if (typeof v === 'number') return v;
    // bảng có thể chỉ có một số mốc → nội suy tuyến tính giữa 2 mốc gần nhất
    const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
    const lo = [...keys].reverse().find((k) => k <= idx) ?? keys[0];
    const hi = keys.find((k) => k >= idx) ?? keys[keys.length - 1];
    if (lo !== undefined && hi !== undefined) {
      const a = table[String(lo)], b = table[String(hi)];
      return hi === lo ? a : Math.round((a + ((b - a) * (idx - lo)) / (hi - lo)) / 5) * 5;
    }
  }
  // Không có bảng: xấp xỉ tuyến tính, làm tròn bội 5
  return Math.max(5, Math.min(495, Math.round((5 + idx * 4.9) / 5) * 5));
}

/** VSTEP: thang 10, làm tròn 0,5 */
export const vstepScaled = (correct: number, total: number) => (total > 0 ? Math.round((correct / total) * 20) / 2 : 0);

export const vstepCefr = (score: number) => (score >= 8.5 ? 'C1' : score >= 6 ? 'B2' : score >= 4 ? 'B1' : null);

// ---------------- SM-2 ----------------
export interface Sm2State {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
}

/** Thuật toán SuperMemo SM-2 (mục 3.2 kế hoạch). quality 0–5. */
export function sm2(s: Sm2State, quality: number) {
  let { easeFactor: ef, intervalDays: interval, repetitions: reps, lapses } = s;
  if (quality < 3) {
    if (reps > 0) lapses += 1;
    reps = 0;
    interval = 1;
  } else {
    interval = reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * ef);
    reps += 1;
  }
  ef = Math.max(1.3, Math.round((ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))) * 100) / 100);
  const status = interval >= 21 ? 'MASTERED' : reps >= 1 ? 'REVIEWING' : 'LEARNING';
  return { easeFactor: ef, intervalDays: interval, repetitions: reps, lapses, status: status as 'MASTERED' | 'REVIEWING' | 'LEARNING', nextReviewAt: new Date(Date.now() + interval * 86400_000) };
}

/** NEW/LEARNING → LEARNING (ReviewStatus của frontend chỉ có 3 giá trị) */
export const reviewStatusOf = (s?: string | null): 'LEARNING' | 'REVIEWING' | 'MASTERED' => (s === 'MASTERED' ? 'MASTERED' : s === 'REVIEWING' ? 'REVIEWING' : 'LEARNING');

// ---------------- Ngày theo giờ Việt Nam ----------------
const VN_OFFSET = 7 * 3600_000;
/** 'YYYY-MM-DD' theo giờ VN */
export const vnDateStr = (d = new Date()) => new Date(d.getTime() + VN_OFFSET).toISOString().slice(0, 10);
/** Date (UTC 00:00) đại diện cho ngày VN — dùng cho cột DATE */
export const vnDate = (d = new Date()) => new Date(`${vnDateStr(d)}T00:00:00.000Z`);
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400_000);
/** Thứ Hai đầu tuần (giờ VN) */
export function vnWeekStart(d = new Date()) {
  const day = vnDate(d);
  const dow = (day.getUTCDay() + 6) % 7; // 0 = T2
  return addDays(day, -dow);
}

// ---------------- XP, streak, daily_activities ----------------
export async function recordActivity(
  tx: Tx,
  userId: string,
  delta: { minutes?: number; questions?: number; lessons?: number; cards?: number; xp?: number }
) {
  const today = vnDate();
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { lastStudyDate: true, streakCurrent: true, streakLongest: true, settings: true } });
  const goalMin = Number((user.settings as { dailyGoalMinutes?: number } | null)?.dailyGoalMinutes ?? 20);
  const act = await tx.dailyActivity.upsert({
    where: { userId_activityDate: { userId, activityDate: today } },
    create: {
      userId,
      activityDate: today,
      minutes: delta.minutes ?? 0,
      questionsAnswered: delta.questions ?? 0,
      lessonsCompleted: delta.lessons ?? 0,
      cardsReviewed: delta.cards ?? 0,
      xp: delta.xp ?? 0,
    },
    update: {
      minutes: { increment: delta.minutes ?? 0 },
      questionsAnswered: { increment: delta.questions ?? 0 },
      lessonsCompleted: { increment: delta.lessons ?? 0 },
      cardsReviewed: { increment: delta.cards ?? 0 },
      xp: { increment: delta.xp ?? 0 },
    },
  });
  if (!act.goalMet && act.minutes >= goalMin) await tx.dailyActivity.update({ where: { userId_activityDate: { userId, activityDate: today } }, data: { goalMet: true } });

  // Streak: học hôm qua → +1, hôm nay đã tính → giữ, gián đoạn → 1
  const last = user.lastStudyDate ? vnDateStr(user.lastStudyDate) : null;
  const todayStr = vnDateStr();
  const yesterday = addDays(today, -1).toISOString().slice(0, 10);
  const streak = last === todayStr ? user.streakCurrent : last === yesterday ? user.streakCurrent + 1 : 1;
  await tx.user.update({
    where: { id: userId },
    data: {
      xpTotal: { increment: delta.xp ?? 0 },
      streakCurrent: streak,
      streakLongest: Math.max(user.streakLongest, streak),
      lastStudyDate: today,
      lastActiveAt: new Date(),
    },
  });
}

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

/** Đọc tham số đường dẫn (types Express 5 khai báo string | string[]) */
export const pid = (req: { params: Record<string, string | string[] | undefined> }, name = 'id'): string => {
  const v = req.params[name];
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
};
