/** Hằng số & tiện ích giao diện dùng chung cho khu vực Trưởng bộ môn / Quản trị (không chứa dữ liệu). */
import type { ExamType, IQuestion, SkillType } from '@/shared/types';
import type { QuestionRow } from '@/shared/api/head';

/** Mã Part trong DB (TOEIC_P5, VSTEP_R1…) → nhãn ngắn */
export const partLabel = (part: string) => {
  const m = /^TOEIC_P(\d)$/.exec(part);
  if (m) return `Part ${m[1]}`;
  const v = /^VSTEP_([LRWS])(\d)$/.exec(part);
  if (v) return `${{ L: 'Listening', R: 'Reading', W: 'Writing', S: 'Speaking' }[v[1] as 'L' | 'R' | 'W' | 'S']} ${v[2]}`;
  return part;
};
/** Nhãn rất ngắn cho trục biểu đồ: P5, V-R1 */
export const partShort = (part: string) => part.replace('TOEIC_P', 'P').replace('VSTEP_', 'V-');

/** Mã Part DB → mã Part frontend cũ (PART_5, VSTEP_READING…) dùng bởi QuestionRenderer */
export const partToFe = (part: string) => {
  const m = /^TOEIC_P(\d)$/.exec(part);
  if (m) return `PART_${m[1]}`;
  const v = /^VSTEP_([LRWS])\d$/.exec(part);
  if (v) return `VSTEP_${{ L: 'LISTENING', R: 'READING', W: 'WRITING', S: 'SPEAKING' }[v[1] as 'L' | 'R' | 'W' | 'S']}`;
  return part;
};

export const EXAM_PARTS: { value: string; label: string; exam: ExamType }[] = [
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: `TOEIC_P${n}`, label: `TOEIC Part ${n}`, exam: 'TOEIC' as const })),
  ...['L1', 'L2', 'L3', 'R1', 'R2', 'R3', 'R4', 'W1', 'W2', 'S1', 'S2', 'S3'].map((p) => ({ value: `VSTEP_${p}`, label: `VSTEP ${partLabel(`VSTEP_${p}`)}`, exam: 'VSTEP' as const })),
];

/** Độ khó IRT b (−4…4) → 1–5 sao */
export const stars = (irtB: number) => Math.min(5, Math.max(1, Math.round(irtB + 3)));

/** QuestionRow (API) → IQuestion (QuestionRenderer) */
export const toIQuestion = (q: QuestionRow, passage?: { id: string; title?: string | null; contentMd?: string | null; transcript?: string | null; audioUrl?: string | null; imageUrl?: string | null } | null): IQuestion => ({
  id: q.id,
  examType: q.examType,
  type: q.type as IQuestion['type'],
  skillType: q.skill as SkillType,
  partOrSkill: partToFe(q.part),
  level: q.level ?? '',
  stem: q.stem,
  options: q.options ?? [],
  correctAnswer: q.correctAnswer ? { key: q.correctAnswer } : '',
  explanation: q.explanation || null,
  difficulty: stars(q.difficulty),
  tags: [],
  passageId: q.passageId ?? null,
  passage: passage
    ? { id: passage.id, examType: q.examType, partOrSkill: partToFe(q.part), title: passage.title ?? null, content: passage.contentMd ?? passage.transcript ?? '', audioUrl: passage.audioUrl ?? q.audioUrl ?? null, imageUrl: passage.imageUrl ?? q.imageUrl ?? null }
    : q.audioUrl || q.imageUrl
      ? { id: `q:${q.id}`, examType: q.examType, partOrSkill: partToFe(q.part), title: null, content: '', audioUrl: q.audioUrl ?? null, imageUrl: q.imageUrl ?? null }
      : null,
});

export const SKILL_VI: Record<SkillType, string> = { LISTENING: 'Nghe', READING: 'Đọc', WRITING: 'Viết', SPEAKING: 'Nói', VOCABULARY: 'Từ vựng', GRAMMAR: 'Ngữ pháp' };

/** Loại bài giao */
export const ASSIGNMENT_TYPE_LABEL: Record<string, string> = { MOCK_TEST: 'Đề thi thử', PRACTICE: 'Luyện Part', LESSON: 'Bài giảng', GRAMMAR: 'Ngữ pháp', VOCAB: 'Từ vựng', ESSAY: 'Bài viết', SPEAKING: 'Bài nói' };

/** Ngày thứ trong tuần từ ISO date (T2…CN) */
export const weekdayCode = (isoDate: string) => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(`${isoDate}T00:00:00`).getDay()];

/** Thứ Hai của tuần chứa ngày d (YYYY-MM-DD, giờ địa phương) */
export const mondayOf = (d = new Date()) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
export const ymdLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDaysLocal = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/**
 * Học kỳ theo lịch năm học Việt Nam, tính từ ngày hiện tại (không viết cứng):
 * HK I: tháng 9 → tháng 1 · HK II: tháng 2 → tháng 6 · Học kỳ hè: tháng 7 → tháng 8.
 */
export function academicTerm(d = new Date()) {
  const m = d.getMonth() + 1;
  const startYear = m >= 9 ? d.getFullYear() : d.getFullYear() - 1;
  const year = `${startYear}–${startYear + 1}`;
  const term = m >= 9 || m === 1 ? 'Học kỳ I' : m <= 6 ? 'Học kỳ II' : 'Học kỳ hè';
  return { term, year, label: `${term}, năm học ${year}`, short: `${term} · ${year}` };
}

/** Chuyên cần gộp nhiều lớp = tổng lượt có mặt / tổng lượt điểm danh (không lấy TB các %) */
export const pooledAttendance = (classes: { attendanceRate: number; attendanceMarks?: number }[]) => {
  const marks = classes.reduce((a, c) => a + (c.attendanceMarks ?? 0), 0);
  return marks ? Math.round(classes.reduce((a, c) => a + (c.attendanceRate / 100) * (c.attendanceMarks ?? 0), 0) / marks * 100) : 0;
};

/** Số học viên KHÁC NHAU trong nhiều lớp (học viên học 2 lớp chỉ tính 1); thiếu studentIds thì cộng sĩ số */
export const distinctStudents = (classes: { studentsCount: number; studentIds?: string[] }[]) =>
  classes.every((c) => c.studentIds) ? new Set(classes.flatMap((c) => c.studentIds!)).size : classes.reduce((a, c) => a + c.studentsCount, 0);
