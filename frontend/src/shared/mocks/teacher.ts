import { PHOTOS, pravatar, unsplash } from '@/shared/components/media/Img';
import { GRAMMAR_TOPICS, MOCK_COURSES } from './courses';
import { VOCAB_TOPICS } from './student';
import { VSTEP_SPEAKING_PARTS, VSTEP_WRITING_TASKS } from './questions';
import { MOCK_TESTS, TOEIC_PARTS_INFO, VSTEP_PARTS_INFO } from './tests';
import type { Assignment, AssignmentTarget, AssignmentType, ClassRoom, ClassStudent, Material, MyAssignmentState, Submission } from '@/shared/types';

export const MOCK_CLASSES: ClassRoom[] = [
  { id: 'cl-1', coverUrl: PHOTOS.classroom, name: 'TOEIC 650+ K12', code: 'ORB-7K2P', room: 'Phòng 302', examType: 'TOEIC', teacherName: 'Trần Thu Hà', studentsCount: 28, assignmentsCount: 14, avgScore: 642, completionRate: 86, attendanceRate: 91, createdAt: '2026-08-05', schedule: 'T2 – T4 – T6 · 19:00', gradient: 'from-indigo-500 to-violet-600' },
  { id: 'cl-2', coverUrl: PHOTOS.discussion, name: 'VSTEP B2 Khoá 5', code: 'ORB-B2X9', room: 'Online · Google Meet', examType: 'VSTEP', teacherName: 'Trần Thu Hà', studentsCount: 22, assignmentsCount: 11, avgScore: 6.8, completionRate: 78, attendanceRate: 84, createdAt: '2026-09-01', schedule: 'T3 – T5 · 18:30', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'cl-3', coverUrl: PHOTOS.lecture, name: 'TOEIC Foundation Sáng', code: 'ORB-FD31', room: 'Phòng 105', examType: 'TOEIC', teacherName: 'Trần Thu Hà', studentsCount: 35, assignmentsCount: 9, avgScore: 512, completionRate: 71, attendanceRate: 76, createdAt: '2026-09-15', schedule: 'T7 – CN · 08:30', gradient: 'from-amber-400 to-orange-500' },
  { id: 'cl-4', coverUrl: PHOTOS.team, name: 'TOEIC 850 Intensive', code: 'ORB-85IN', room: 'Phòng 401', examType: 'TOEIC', teacherName: 'Trần Thu Hà', studentsCount: 15, assignmentsCount: 18, avgScore: 790, completionRate: 94, attendanceRate: 97, createdAt: '2026-07-10', schedule: 'T2 – T5 · 20:00', gradient: 'from-rose-500 to-pink-600' },
];

const st = (id: string, name: string, email: string, avgScore: number, completion: number, streak: number, lastActive: string, status: ClassStudent['status']): ClassStudent => ({
  id,
  avatarUrl: pravatar(Number(id.split('-')[1]) + 20),
  name,
  initials: name
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join(''),
  email,
  avgScore,
  completion,
  streak,
  lastActive,
  status,
});

export const MOCK_CLASS_STUDENTS: ClassStudent[] = [
  st('s-1', 'Nguyễn Minh Anh', 'minhanh@gmail.com', 715, 92, 12, '2026-10-29T07:30:00.000Z', 'GOOD'),
  st('s-2', 'Phạm Hoàng Long', 'hoanglong@gmail.com', 820, 100, 61, '2026-10-29T06:10:00.000Z', 'GOOD'),
  st('s-3', 'Đỗ Thị Mai', 'thimai@gmail.com', 690, 88, 44, '2026-10-28T21:00:00.000Z', 'GOOD'),
  st('s-4', 'Vũ Đức Thành', 'ducthanh@gmail.com', 655, 75, 3, '2026-10-27T19:00:00.000Z', 'WARNING'),
  st('s-5', 'Nguyễn Khánh Vy', 'khanhvy@gmail.com', 610, 64, 0, '2026-10-22T10:00:00.000Z', 'RISK'),
  st('s-6', 'Trần Gia Huy', 'giahuy@gmail.com', 705, 90, 33, '2026-10-29T08:00:00.000Z', 'GOOD'),
  st('s-7', 'Lý Bảo Ngọc', 'baongoc@gmail.com', 580, 58, 1, '2026-10-24T14:00:00.000Z', 'RISK'),
  st('s-8', 'Hoàng Minh Quân', 'minhquan@gmail.com', 640, 81, 18, '2026-10-28T20:30:00.000Z', 'GOOD'),
  st('s-9', 'Bùi Thanh Tùng', 'thanhtung@gmail.com', 595, 70, 9, '2026-10-28T09:00:00.000Z', 'WARNING'),
  st('s-10', 'Đặng Hải Yến', 'haiyen@gmail.com', 660, 85, 15, '2026-10-29T05:45:00.000Z', 'GOOD'),
];

const TOEIC_ALL = ['PART_1', 'PART_2', 'PART_3', 'PART_4', 'PART_5', 'PART_6', 'PART_7'];

/** Bài giao trỏ tới đúng nội dung học viên đang dùng: đề thi thử (full hoặc chọn Part + thời gian), bài giảng trong Khoá học, đề Luyện Viết / Luyện Nói */
export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'as-1', classId: 'cl-1', className: 'TOEIC 650+ K12', title: 'ETS TOEIC 2024 — Test 2', type: 'MOCK_TEST', dueDate: '2026-11-02T16:59:00.000Z', submitted: 19, total: 28, status: 'OPEN', avgScore: 668, createdAt: '2026-10-26', target: { kind: 'EXAM', testId: 'ets-2024-02', setup: { mode: 'FULL', parts: TOEIC_ALL, minutes: 120 } }, note: 'Làm trong một lần, đúng 120 phút như thi thật. Không tạm dừng giữa chừng.' },
  { id: 'as-2', classId: 'cl-1', className: 'TOEIC 650+ K12', title: 'ETS TOEIC 2024 — Test 1 · Part 5, 6', type: 'PRACTICE', dueDate: '2026-10-30T16:59:00.000Z', submitted: 25, total: 28, status: 'OPEN', avgScore: 37.5, createdAt: '2026-10-24', target: { kind: 'EXAM', testId: 'ets-2024-01', setup: { mode: 'PRACTICE', parts: ['PART_5', 'PART_6'], minutes: 20 } }, note: 'Ôn lại từ loại trước khi làm. 46 câu trong 20 phút.' },
  { id: 'as-8', classId: 'cl-1', className: 'TOEIC 650+ K12', title: 'Ngữ pháp — Bài 6, 7', type: 'LESSON', dueDate: '2026-11-04T16:59:00.000Z', submitted: 21, total: 28, status: 'OPEN', createdAt: '2026-10-29', target: { kind: 'LESSON', courseId: 'c-grammar', lessonIds: ['gp-06', 'gp-07'] }, note: 'Xem video Bài 6 rồi làm bài kiểm tra chặng 1, cần đúng từ 10/15 câu.' },
  { id: 'as-10', classId: 'cl-1', className: 'TOEIC 650+ K12', title: 'Từ vựng — Office & Administration', type: 'VOCAB', dueDate: '2026-11-06T16:59:00.000Z', submitted: 14, total: 28, status: 'OPEN', createdAt: '2026-10-30', target: { kind: 'VOCAB', topicId: 'vt-office' }, note: 'Học hết 40 thẻ, ôn lại các thẻ chọn "Khó" ít nhất 2 lần.' },
  { id: 'as-11', classId: 'cl-1', className: 'TOEIC 650+ K12', title: 'Ngữ pháp — Từ loại (Word Form)', type: 'GRAMMAR', dueDate: '2026-10-31T16:59:00.000Z', submitted: 26, total: 28, status: 'CLOSED', avgScore: 31.4, createdAt: '2026-10-21', target: { kind: 'GRAMMAR', slug: 'tu-loai-word-form' } },
  { id: 'as-3', classId: 'cl-2', className: 'VSTEP B2 Khoá 5', title: 'Writing Task 2 — Education & Career', type: 'ESSAY', dueDate: '2026-11-05T16:59:00.000Z', submitted: 12, total: 22, status: 'OPEN', createdAt: '2026-10-27', target: { kind: 'WRITING', taskId: 'vs-w-2' }, note: 'Tối thiểu 250 từ, 40 phút. Chấm theo 4 tiêu chí như trên lớp.' },
  { id: 'as-4', classId: 'cl-2', className: 'VSTEP B2 Khoá 5', title: 'Speaking Part 2 — Solution Discussion', type: 'SPEAKING', dueDate: '2026-10-29T16:59:00.000Z', submitted: 17, total: 22, status: 'OPEN', createdAt: '2026-10-22', target: { kind: 'SPEAKING', partId: 'vs-s-2' } },
  { id: 'as-9', classId: 'cl-2', className: 'VSTEP B2 Khoá 5', title: 'Viết tiếng Anh — Bài 1–3', type: 'LESSON', dueDate: '2026-11-07T16:59:00.000Z', submitted: 6, total: 22, status: 'OPEN', createdAt: '2026-10-30', target: { kind: 'LESSON', courseId: 'c-writing', lessonIds: ['wp-01', 'wp-02', 'wp-03'] } },
  { id: 'as-5', classId: 'cl-3', className: 'TOEIC Foundation Sáng', title: 'TOEIC Listening Mini Test #1 · Part 1, 2', type: 'PRACTICE', dueDate: '2026-10-25T16:59:00.000Z', submitted: 30, total: 35, status: 'CLOSED', avgScore: 21.1, createdAt: '2026-10-18', target: { kind: 'EXAM', testId: 'toeic-listening-mini-1', setup: { mode: 'PRACTICE', parts: ['PART_1', 'PART_2'], minutes: 12 } } },
  { id: 'as-6', classId: 'cl-4', className: 'TOEIC 850 Intensive', title: 'ETS TOEIC 2025 — Test 1', type: 'MOCK_TEST', dueDate: '2026-11-08T16:59:00.000Z', submitted: 4, total: 15, status: 'OPEN', avgScore: 812, createdAt: '2026-10-28', target: { kind: 'EXAM', testId: 'ets-2025-01', setup: { mode: 'FULL', parts: TOEIC_ALL, minutes: 120 } } },
  { id: 'as-7', classId: 'cl-1', className: 'TOEIC 650+ K12', title: 'ETS TOEIC 2024 — Test 3 · Part 7', type: 'PRACTICE', dueDate: '2026-11-10T16:59:00.000Z', submitted: 0, total: 28, status: 'DRAFT', createdAt: '2026-10-29', target: { kind: 'EXAM', testId: 'ets-2024-03', setup: { mode: 'PRACTICE', parts: ['PART_7'], minutes: 55 } } },
];

export const ASSIGNMENT_TYPE_LABEL: Record<AssignmentType, string> = { MOCK_TEST: 'Đề thi thử', PRACTICE: 'Luyện theo Part', LESSON: 'Bài giảng', GRAMMAR: 'Ngữ pháp', VOCAB: 'Từ vựng', ESSAY: 'Bài viết', SPEAKING: 'Bài nói' };

/** Lớp học viên demo (Nguyễn Minh Anh) đã tham gia và tình trạng từng bài được giao */
export const MY_CLASS_IDS = ['cl-1', 'cl-2'];
export const MY_ASSIGNMENTS: Record<string, MyAssignmentState> = {
  'as-1': { status: 'TODO' },
  'as-2': { status: 'GRADED', submittedAt: '2026-10-29T13:20:00.000Z', score: 39, feedback: 'Part 5 tốt (27/30). Part 6 sai 4 câu chèn câu — đọc kỹ câu trước và sau chỗ trống.' },
  'as-8': { status: 'TODO' },
  'as-3': { status: 'TODO' },
  'as-4': { status: 'SUBMITTED', submittedAt: '2026-10-28T18:00:00.000Z' },
  'as-9': { status: 'TODO' },
  'as-10': { status: 'TODO' },
  'as-11': { status: 'GRADED', submittedAt: '2026-10-27T20:05:00.000Z', score: 34, feedback: 'Nắm tốt vị trí tính từ, trạng từ. Còn nhầm hậu tố -ive / -ion ở 4 câu.' },
};

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sb-1',
    avatarUrl: pravatar(31),
    assignmentId: 'as-3',
    assignmentTitle: 'Writing Task 2 — Education & Career',
    studentName: 'Đỗ Thị Mai',
    initials: 'TM',
    submittedAt: '2026-10-28T20:15:00.000Z',
    maxScore: 10,
    status: 'PENDING',
    type: 'ESSAY',
    content:
      'In recent years, there has been a heated debate about whether universities should prepare students for specific careers or provide a broad education. While vocational training equips graduates with practical skills that employers value, I believe a balanced approach benefits students most.\n\nOn the one hand, career-focused programmes allow students to enter the workforce quickly. For example, nursing and engineering courses include internships that build job-ready competence. On the other hand, a broad education develops critical thinking and adaptability, which are essential in a rapidly changing economy.\n\nIn conclusion, universities should combine specialised training with general subjects so that graduates are both employable and able to learn throughout their lives.',
  },
  { id: 'sb-2',
    avatarUrl: pravatar(32), assignmentId: 'as-3', assignmentTitle: 'Writing Task 2 — Education & Career', studentName: 'Trần Gia Huy', initials: 'GH', submittedAt: '2026-10-29T07:40:00.000Z', maxScore: 10, status: 'PENDING', type: 'ESSAY', content: 'Nowadays many people argue about the purpose of university education. Some think it should focus on jobs, others on general knowledge. In my opinion both are important...' },
  { id: 'sb-3',
    avatarUrl: pravatar(11), assignmentId: 'as-4', assignmentTitle: 'Speaking Part 2 — Solution Discussion', studentName: 'Nguyễn Minh Anh', initials: 'MA', submittedAt: '2026-10-28T18:00:00.000Z', maxScore: 10, status: 'PENDING', type: 'SPEAKING', content: 'audio-recording-01.webm · 03:42' },
  { id: 'sb-4',
    avatarUrl: pravatar(12), assignmentId: 'as-3', assignmentTitle: 'Writing Task 2 — Education & Career', studentName: 'Phạm Hoàng Long', initials: 'HL', submittedAt: '2026-10-27T22:10:00.000Z', score: 8.5, maxScore: 10, status: 'GRADED', type: 'ESSAY', feedback: 'Lập luận rõ ràng, từ vựng học thuật tốt. Cần đa dạng cấu trúc câu phức hơn ở đoạn 2.' },
  { id: 'sb-5',
    avatarUrl: pravatar(33), assignmentId: 'as-4', assignmentTitle: 'Speaking Part 2 — Solution Discussion', studentName: 'Lý Bảo Ngọc', initials: 'BN', submittedAt: '2026-10-30T01:20:00.000Z', maxScore: 10, status: 'LATE', type: 'SPEAKING', content: 'audio-recording-07.webm · 02:58' },
  { id: 'sb-6',
    avatarUrl: pravatar(13), assignmentId: 'as-1', assignmentTitle: 'ETS TOEIC 2024 — Test 2', studentName: 'Vũ Đức Thành', initials: 'ĐT', submittedAt: '2026-10-28T10:00:00.000Z', score: 655, maxScore: 990, status: 'GRADED', type: 'MOCK_TEST', feedback: 'Chấm tự động.' },
];

export const MOCK_MATERIALS: Material[] = [
  { id: 'mt-1', classId: 'cl-1', title: 'Part 7 Double Passage Strategy.pdf', type: 'PDF', size: '2.4 MB', uploadedAt: '2026-10-24', downloads: 21 },
  { id: 'mt-2', classId: 'cl-1', title: 'Bài giảng Part 3 — Paraphrase.mp4', type: 'VIDEO', size: '186 MB', uploadedAt: '2026-10-20', downloads: 26 },
  { id: 'mt-3', classId: 'cl-1', title: '600 từ vựng Business — Bộ 1.docx', type: 'DOC', size: '540 KB', uploadedAt: '2026-10-12', downloads: 28 },
  { id: 'mt-4', classId: 'cl-2', title: 'VSTEP Writing — Bài mẫu Task 1.pdf', type: 'PDF', size: '1.1 MB', uploadedAt: '2026-10-22', downloads: 18 },
  { id: 'mt-5', classId: 'cl-2', title: 'Listening Part 3 — Lecture Sample.mp3', type: 'AUDIO', size: '12 MB', uploadedAt: '2026-10-18', downloads: 15 },
];

export const CLASS_WEEKLY_PROGRESS = [
  { label: 'T1', value: 58 },
  { label: 'T2', value: 63 },
  { label: 'T3', value: 61 },
  { label: 'T4', value: 70 },
  { label: 'T5', value: 74 },
  { label: 'T6', value: 79 },
  { label: 'T7', value: 86 },
];

/** Mô tả ngắn nội dung bài giao — giáo viên và học viên thấy cùng một dòng */
export function describeTarget(t: AssignmentTarget): string {
  switch (t.kind) {
    case 'EXAM': {
      const test = MOCK_TESTS.find((x) => x.id === t.testId);
      if (t.setup.mode === 'FULL') return `Full test · ${test?.totalQuestions ?? ''} câu · ${t.setup.minutes} phút`;
      const info = [...TOEIC_PARTS_INFO, ...VSTEP_PARTS_INFO];
      const names = t.setup.parts.map((p) => info.find((x) => x.id === p)?.name ?? p);
      const count = t.setup.parts.reduce((a, p) => a + (info.find((x) => x.id === p)?.questions ?? 0), 0);
      return `${names.join(', ')} · ${count} câu · ${t.setup.minutes ? `${t.setup.minutes} phút` : 'không giới hạn thời gian'}`;
    }
    case 'LESSON': {
      const course = MOCK_COURSES.find((c) => c.id === t.courseId);
      const all = course?.sections.flatMap((s) => s.lessons) ?? [];
      const nums = t.lessonIds.map((id) => all.findIndex((l) => l.id === id) + 1).filter((n) => n > 0);
      return `${course?.title ?? ''} · Bài ${nums.join(', ')}`;
    }
    case 'GRAMMAR': {
      const g = GRAMMAR_TOPICS.find((x) => x.slug === t.slug);
      return g ? `Chủ điểm ngữ pháp · ${g.title} · ${g.questionsCount} câu` : 'Chủ điểm ngữ pháp';
    }
    case 'VOCAB': {
      const v = VOCAB_TOPICS.find((x) => x.id === t.topicId);
      return v ? `Flashcard · ${v.name} · ${v.total} từ` : 'Flashcard từ vựng';
    }
    case 'WRITING': {
      const task = VSTEP_WRITING_TASKS.find((x) => x.id === t.taskId);
      return task ? `Luyện Viết · ${task.task} · tối thiểu ${task.minWords} từ` : 'Luyện Viết';
    }
    case 'SPEAKING': {
      const part = VSTEP_SPEAKING_PARTS.find((x) => x.id === t.partId);
      return part ? `Luyện Nói · ${part.part} · ${part.minutes} phút` : 'Luyện Nói';
    }
  }
}

/** Thống kê lớp: tỷ lệ đúng trung bình theo phần thi ở bài thi thử gần nhất (cùng cách tính với trang Tiến độ của học viên) */
export const CLASS_PART_ACCURACY: Record<string, { partId: string; value: number }[]> = {
  TOEIC: [
    { partId: 'PART_1', value: 84 },
    { partId: 'PART_2', value: 71 },
    { partId: 'PART_3', value: 66 },
    { partId: 'PART_4', value: 60 },
    { partId: 'PART_5', value: 78 },
    { partId: 'PART_6', value: 69 },
    { partId: 'PART_7', value: 52 },
  ],
  VSTEP: [
    { partId: 'VSTEP_LISTENING', value: 64 },
    { partId: 'VSTEP_READING', value: 61 },
    { partId: 'VSTEP_WRITING', value: 58 },
    { partId: 'VSTEP_SPEAKING', value: 66 },
  ],
};

/** Phân bố điểm bài thi thử gần nhất của lớp */
export const CLASS_SCORE_DIST: Record<string, { label: string; value: number }[]> = {
  TOEIC: [
    { label: 'Dưới 450', value: 2 },
    { label: '450–549', value: 4 },
    { label: '550–649', value: 7 },
    { label: '650–749', value: 9 },
    { label: '750–849', value: 4 },
    { label: 'Từ 850', value: 2 },
  ],
  VSTEP: [
    { label: 'Dưới 4,0 (chưa đạt)', value: 2 },
    { label: '4,0–5,5 (B1)', value: 8 },
    { label: '6,0–8,0 (B2)', value: 11 },
    { label: '8,5–10 (C1)', value: 1 },
  ],
};

/** Câu sai trong Sổ tay lỗi sai của học viên trong lớp, gom theo nguyên nhân học viên tự gắn */
export const CLASS_MISTAKE_CAUSES: { cause: string; count: number }[] = [
  { cause: 'VOCABULARY', count: 146 },
  { cause: 'GRAMMAR', count: 118 },
  { cause: 'READING', count: 97 },
  { cause: 'LISTENING', count: 84 },
  { cause: 'TIME_PRESSURE', count: 52 },
  { cause: 'CARELESS', count: 31 },
];
