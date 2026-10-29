import type { Assignment, ClassRoom, ClassStudent, Material, Submission } from '@/shared/types';

export const MOCK_CLASSES: ClassRoom[] = [
  { id: 'cl-1', name: 'TOEIC 650+ K12', code: 'ORB-7K2P', examType: 'TOEIC', teacherName: 'Trần Thu Hà', studentsCount: 28, assignmentsCount: 14, avgScore: 642, completionRate: 86, attendanceRate: 91, createdAt: '2026-08-05', schedule: 'T2 – T4 – T6 · 19:00', gradient: 'from-indigo-500 to-violet-600' },
  { id: 'cl-2', name: 'VSTEP B2 Khoá 5', code: 'ORB-B2X9', examType: 'VSTEP', teacherName: 'Trần Thu Hà', studentsCount: 22, assignmentsCount: 11, avgScore: 6.8, completionRate: 78, attendanceRate: 84, createdAt: '2026-09-01', schedule: 'T3 – T5 · 18:30', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'cl-3', name: 'TOEIC Foundation Sáng', code: 'ORB-FD31', examType: 'TOEIC', teacherName: 'Trần Thu Hà', studentsCount: 35, assignmentsCount: 9, avgScore: 512, completionRate: 71, attendanceRate: 76, createdAt: '2026-09-15', schedule: 'T7 – CN · 08:30', gradient: 'from-amber-400 to-orange-500' },
  { id: 'cl-4', name: 'TOEIC 850 Intensive', code: 'ORB-85IN', examType: 'TOEIC', teacherName: 'Trần Thu Hà', studentsCount: 15, assignmentsCount: 18, avgScore: 790, completionRate: 94, attendanceRate: 97, createdAt: '2026-07-10', schedule: 'T2 – T5 · 20:00', gradient: 'from-rose-500 to-pink-600' },
];

const st = (id: string, name: string, email: string, avgScore: number, completion: number, streak: number, lastActive: string, status: ClassStudent['status']): ClassStudent => ({
  id,
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

export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'as-1', classId: 'cl-1', className: 'TOEIC 650+ K12', title: 'ETS 2024 — Test 2 (Full Test)', type: 'MOCK_TEST', dueDate: '2026-11-02T23:59:00.000Z', submitted: 19, total: 28, status: 'OPEN', avgScore: 668, createdAt: '2026-10-26' },
  { id: 'as-2', classId: 'cl-1', className: 'TOEIC 650+ K12', title: 'Part 5 — 30 câu Word Form', type: 'PRACTICE', dueDate: '2026-10-30T23:59:00.000Z', submitted: 25, total: 28, status: 'OPEN', avgScore: 24.3, createdAt: '2026-10-24' },
  { id: 'as-3', classId: 'cl-2', className: 'VSTEP B2 Khoá 5', title: 'Writing Task 2 — Education & Career', type: 'ESSAY', dueDate: '2026-11-05T23:59:00.000Z', submitted: 12, total: 22, status: 'OPEN', createdAt: '2026-10-27' },
  { id: 'as-4', classId: 'cl-2', className: 'VSTEP B2 Khoá 5', title: 'Speaking Part 2 — Solution Discussion', type: 'SPEAKING', dueDate: '2026-10-29T23:59:00.000Z', submitted: 17, total: 22, status: 'OPEN', createdAt: '2026-10-22' },
  { id: 'as-5', classId: 'cl-3', className: 'TOEIC Foundation Sáng', title: 'Listening Part 1–2 Mini', type: 'PRACTICE', dueDate: '2026-10-25T23:59:00.000Z', submitted: 30, total: 35, status: 'CLOSED', avgScore: 21.1, createdAt: '2026-10-18' },
  { id: 'as-6', classId: 'cl-4', className: 'TOEIC 850 Intensive', title: 'ETS 2025 — Test 1 (Full Test)', type: 'MOCK_TEST', dueDate: '2026-11-08T23:59:00.000Z', submitted: 4, total: 15, status: 'OPEN', avgScore: 812, createdAt: '2026-10-28' },
  { id: 'as-7', classId: 'cl-1', className: 'TOEIC 650+ K12', title: 'Part 7 — Đoạn kép (Draft)', type: 'PRACTICE', dueDate: '2026-11-10T23:59:00.000Z', submitted: 0, total: 28, status: 'DRAFT', createdAt: '2026-10-29' },
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sb-1',
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
  { id: 'sb-2', assignmentId: 'as-3', assignmentTitle: 'Writing Task 2 — Education & Career', studentName: 'Trần Gia Huy', initials: 'GH', submittedAt: '2026-10-29T07:40:00.000Z', maxScore: 10, status: 'PENDING', type: 'ESSAY', content: 'Nowadays many people argue about the purpose of university education. Some think it should focus on jobs, others on general knowledge. In my opinion both are important...' },
  { id: 'sb-3', assignmentId: 'as-4', assignmentTitle: 'Speaking Part 2 — Solution Discussion', studentName: 'Nguyễn Minh Anh', initials: 'MA', submittedAt: '2026-10-28T18:00:00.000Z', maxScore: 10, status: 'PENDING', type: 'SPEAKING', content: 'audio-recording-01.webm · 03:42' },
  { id: 'sb-4', assignmentId: 'as-3', assignmentTitle: 'Writing Task 2 — Education & Career', studentName: 'Phạm Hoàng Long', initials: 'HL', submittedAt: '2026-10-27T22:10:00.000Z', score: 8.5, maxScore: 10, status: 'GRADED', type: 'ESSAY', feedback: 'Lập luận rõ ràng, từ vựng học thuật tốt. Cần đa dạng cấu trúc câu phức hơn ở đoạn 2.' },
  { id: 'sb-5', assignmentId: 'as-4', assignmentTitle: 'Speaking Part 2 — Solution Discussion', studentName: 'Lý Bảo Ngọc', initials: 'BN', submittedAt: '2026-10-30T01:20:00.000Z', maxScore: 10, status: 'LATE', type: 'SPEAKING', content: 'audio-recording-07.webm · 02:58' },
  { id: 'sb-6', assignmentId: 'as-1', assignmentTitle: 'ETS 2024 — Test 2 (Full Test)', studentName: 'Vũ Đức Thành', initials: 'ĐT', submittedAt: '2026-10-28T10:00:00.000Z', score: 655, maxScore: 990, status: 'GRADED', type: 'MOCK_TEST', feedback: 'Chấm tự động.' },
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
