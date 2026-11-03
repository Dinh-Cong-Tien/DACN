/**
 * Hằng số giao diện khu vực giáo viên (nhãn, định dạng phần thi) và hàm mô tả nội dung bài giao.
 * Không chứa dữ liệu nghiệp vụ — dữ liệu lấy từ API (`shared/api/teacher.ts`).
 */
import type { AssignmentTarget, AssignmentType, AttendanceMark } from '@/shared/types';
import type { TeacherLibrary } from '@/shared/api/teacher';

export const ASSIGNMENT_TYPE_LABEL: Record<AssignmentType, string> = { MOCK_TEST: 'Đề thi thử', PRACTICE: 'Luyện theo Part', LESSON: 'Bài giảng', GRAMMAR: 'Ngữ pháp', VOCAB: 'Từ vựng', ESSAY: 'Bài viết', SPEAKING: 'Bài nói', DICTATION: 'Chép chính tả' };

export const ATTENDANCE_LABEL: Record<AttendanceMark, string> = { PRESENT: 'Có mặt', LATE: 'Đi muộn', ABSENT: 'Vắng', EXCUSED: 'Vắng có phép' };

export const MISTAKE_CAUSE_TEXT: Record<string, string> = {
  GRAMMAR: 'Ngữ pháp',
  VOCABULARY: 'Từ vựng',
  LISTENING: 'Nghe nhầm',
  READING: 'Đọc hiểu',
  TIME_PRESSURE: 'Áp lực thời gian',
  CARELESS: 'Bất cẩn',
  UNCLASSIFIED: 'Chưa phân loại',
};

/** Định dạng chuẩn từng phần thi (tên, thời gian gợi ý khi giao luyện riêng phần đó) */
export const PART_FORMAT: Record<string, { name: string; nameVi: string; minutes: number }> = {
  PART_1: { name: 'Part 1', nameVi: 'Mô tả tranh', minutes: 4 },
  PART_2: { name: 'Part 2', nameVi: 'Hỏi – Đáp', minutes: 8 },
  PART_3: { name: 'Part 3', nameVi: 'Hội thoại ngắn', minutes: 17 },
  PART_4: { name: 'Part 4', nameVi: 'Bài nói ngắn', minutes: 16 },
  PART_5: { name: 'Part 5', nameVi: 'Hoàn thành câu', minutes: 10 },
  PART_6: { name: 'Part 6', nameVi: 'Hoàn thành đoạn văn', minutes: 8 },
  PART_7: { name: 'Part 7', nameVi: 'Đọc hiểu', minutes: 55 },
  VSTEP_LISTENING: { name: 'Listening', nameVi: 'Kỹ năng Nghe', minutes: 40 },
  VSTEP_READING: { name: 'Reading', nameVi: 'Kỹ năng Đọc', minutes: 60 },
  VSTEP_WRITING: { name: 'Writing', nameVi: 'Kỹ năng Viết', minutes: 60 },
  VSTEP_SPEAKING: { name: 'Speaking', nameVi: 'Kỹ năng Nói', minutes: 12 },
};
export const partName = (id: string) => PART_FORMAT[id]?.name ?? id;
export const partLabel = (id: string) => (PART_FORMAT[id] ? `${PART_FORMAT[id].name} · ${PART_FORMAT[id].nameVi}` : id);

/** Viết / Nói không làm trong phòng thi trắc nghiệm, giao riêng bằng đề Viết / đề Nói */
export const OUTSIDE_PARTS = ['VSTEP_WRITING', 'VSTEP_SPEAKING'];

/** Tên ngắn của đề Viết / Nói: tiêu đề đề VSTEP, hoặc "TEST 01 · Câu 3 · Mô tả tranh" với đề TOEIC Speaking */
export const promptName = (p: { examType: string; part: string; taskConfig?: { title?: string; label?: string; test?: string; questionNo?: number } }, kind: 'WRITING' | 'SPEAKING') => {
  const c = p.taskConfig ?? {};
  if (c.label) return [c.test?.replace('TOEIC Speaking ', ''), c.questionNo ? `Câu ${c.questionNo}` : '', c.label].filter(Boolean).join(' · ');
  if (c.title) return c.title;
  const m = /VSTEP_(W|S)(\d)/.exec(p.part);
  if (m) return m[1] === 'W' ? `Task ${m[2]}` : `Part ${m[2]}`;
  return kind === 'WRITING' ? 'TOEIC Writing' : 'TOEIC Speaking';
};

/** Mô tả nội dung bài giao theo dữ liệu thư viện */
export function describeTarget(t: AssignmentTarget, lib: Pick<TeacherLibrary, 'tests' | 'courses' | 'grammar' | 'vocab' | 'writing' | 'speaking'>): string {
  switch (t.kind) {
    case 'EXAM': {
      const test = lib.tests.find((x) => x.id === t.testId || x.slug === t.testId);
      if (t.setup.mode === 'FULL') return `Full test · ${test?.totalQuestions ?? ''} câu · ${t.setup.minutes ?? test?.durationMin ?? ''} phút`;
      const count = t.setup.parts.reduce((a, p) => a + (test?.parts.find((x) => x.id === p)?.questions ?? 0), 0);
      return `${t.setup.parts.map(partName).join(', ')} · ${count} câu · ${t.setup.minutes ? `${t.setup.minutes} phút` : 'không giới hạn thời gian'}`;
    }
    case 'LESSON': {
      const course = lib.courses.find((c) => c.id === t.courseId || c.slug === t.courseId);
      const all = course?.sections.flatMap((s) => s.lessons) ?? [];
      const nums = t.lessonIds.map((id) => all.findIndex((l) => l.id === id) + 1).filter((n) => n > 0);
      return `${course?.title ?? 'Khoá học'}${nums.length ? ` · Bài ${nums.join(', ')}` : ''}`;
    }
    case 'GRAMMAR': {
      const g = lib.grammar.find((x) => x.slug === t.slug || x.id === t.slug);
      return g ? `Chủ điểm ngữ pháp · ${g.title}${g.questionsCount ? ` · ${g.questionsCount} câu` : ''}` : 'Chủ điểm ngữ pháp';
    }
    case 'VOCAB': {
      const v = lib.vocab.find((x) => x.id === t.topicId || x.slug === t.topicId);
      return v ? `Flashcard · ${v.name} · ${v.wordsCount} từ` : 'Flashcard từ vựng';
    }
    case 'WRITING': {
      const w = lib.writing.find((x) => x.id === t.taskId);
      return w ? `Luyện Viết · ${promptName(w, 'WRITING')}${w.taskConfig?.minWords ? ` · tối thiểu ${w.taskConfig.minWords} từ` : ''}` : 'Luyện Viết';
    }
    case 'SPEAKING': {
      const s = lib.speaking.find((x) => x.id === t.partId);
      return s ? `Luyện Nói · ${promptName(s, 'SPEAKING')}` : 'Luyện Nói';
    }
    case 'DICTATION':
      return 'Chép chính tả · nghe và chép từng câu, chấm theo % chép đúng';
  }
}

/** Ngày YYYY-MM-DD theo giờ máy */
export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
