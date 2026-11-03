/**
 * Hằng số thuần giao diện của khu vực học viên (nhãn, màu, thứ tự hiển thị).
 * Dữ liệu nghiệp vụ lấy từ API (`shared/api/learner.ts`), không đặt ở đây.
 */
import type { AssignmentTarget, AssignmentType, RubricCriterion } from '@/shared/types';

type Tone = 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' | 'teal' | 'orange' | 'fuchsia';

/** Nhãn + màu nguyên nhân lỗi sai (enum mistake_cause) */
export const MISTAKE_CAUSE_LABEL: Record<string, { label: string; tone: Tone }> = {
  GRAMMAR: { label: 'Ngữ pháp', tone: 'violet' },
  VOCABULARY: { label: 'Từ vựng', tone: 'rose' },
  LISTENING: { label: 'Nghe nhầm', tone: 'sky' },
  READING: { label: 'Đọc hiểu', tone: 'amber' },
  TIME_PRESSURE: { label: 'Áp lực thời gian', tone: 'orange' },
  CARELESS: { label: 'Bất cẩn', tone: 'slate' },
  UNCLASSIFIED: { label: 'Chưa phân loại', tone: 'slate' },
};

export const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const ASSIGNMENT_TYPE_LABEL: Record<AssignmentType, string> = {
  MOCK_TEST: 'Đề thi thử',
  PRACTICE: 'Luyện theo Part',
  LESSON: 'Bài giảng',
  GRAMMAR: 'Ngữ pháp',
  VOCAB: 'Từ vựng',
  ESSAY: 'Bài viết',
  SPEAKING: 'Bài nói',
  DICTATION: 'Chép chính tả',
};

const PART_LABEL: Record<string, string> = {
  PART_1: 'Part 1',
  PART_2: 'Part 2',
  PART_3: 'Part 3',
  PART_4: 'Part 4',
  PART_5: 'Part 5',
  PART_6: 'Part 6',
  PART_7: 'Part 7',
  VSTEP_LISTENING: 'VSTEP Nghe',
  VSTEP_READING: 'VSTEP Đọc',
};

/** Mô tả ngắn yêu cầu của bài được giao (không cần tải thêm dữ liệu) */
export function describeTarget(t: AssignmentTarget): string {
  switch (t.kind) {
    case 'EXAM':
      if (t.setup.mode === 'FULL') return `Full test${t.setup.minutes ? ` · ${t.setup.minutes} phút` : ''}`;
      return `${t.setup.parts.map((p) => PART_LABEL[p] ?? p).join(', ')} · ${t.setup.minutes ? `${t.setup.minutes} phút` : 'không giới hạn thời gian'}`;
    case 'LESSON':
      return `${t.lessonIds.length} bài giảng`;
    case 'GRAMMAR':
      return 'Chủ điểm ngữ pháp';
    case 'VOCAB':
      return 'Bộ từ vựng';
    case 'WRITING':
      return 'Bài viết nộp cho giáo viên chấm';
    case 'SPEAKING':
      return 'Bài nói nộp cho giáo viên chấm';
    default:
      return '';
  }
}

/** 4 tiêu chí chấm Viết (dùng khi đề chưa gắn rubric) */
export const WRITING_CRITERIA: RubricCriterion[] = [
  { key: 'task', label: 'Task Fulfilment', desc: 'Trả lời đủ các ý của đề, đúng số từ' },
  { key: 'coherence', label: 'Coherence & Cohesion', desc: 'Bố cục rõ, dùng từ nối hợp lý' },
  { key: 'lexical', label: 'Lexical Resource', desc: 'Từ vựng đa dạng, đúng ngữ cảnh' },
  { key: 'grammar', label: 'Grammatical Range', desc: 'Đa dạng cấu trúc, ít lỗi' },
];
