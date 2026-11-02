import { PHOTOS, pravatar, unsplash } from '@/shared/components/media/Img';
import type { AppNotification, ApprovalRequest, ClassObservation, ClassReport, ClassRoom, ClassStudent, Complaint, DeptStudent, GradingReview, Subject, TeacherSummary } from '@/shared/types';
import { MOCK_CLASSES, MOCK_CLASS_STUDENTS, buildSessions } from './teacher';

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sj-1', name: 'TOEIC Listening & Reading', code: 'TOEIC-LR', examType: 'TOEIC', teachersCount: 6, classesCount: 11, questionsCount: 2840, lead: 'Lê Quốc Bảo' },
  { id: 'sj-2', name: 'VSTEP 4 kỹ năng', code: 'VSTEP-4S', examType: 'VSTEP', teachersCount: 4, classesCount: 7, questionsCount: 1260, lead: 'Lê Quốc Bảo' },
  { id: 'sj-3', name: 'Ngữ pháp nền tảng', code: 'GRAM-FND', examType: 'TOEIC', teachersCount: 3, classesCount: 5, questionsCount: 980, lead: 'Trần Thu Hà' },
  { id: 'sj-4', name: 'Từ vựng học thuật', code: 'VOC-ACA', examType: 'VSTEP', teachersCount: 2, classesCount: 3, questionsCount: 640, lead: 'Phạm Ngọc Linh' },
];

export const MOCK_TEACHERS: TeacherSummary[] = [
  { id: 't-1', name: 'Trần Thu Hà', initials: 'TH', avatarUrl: pravatar(41), email: 'teacher@orbi.edu.vn', subject: 'TOEIC Listening & Reading', classesCount: 4, studentsCount: 100, avgClassScore: 648, status: 'ACTIVE' },
  { id: 't-2', name: 'Phạm Ngọc Linh', initials: 'NL', avatarUrl: pravatar(42), email: 'linh.pham@orbi.edu.vn', subject: 'VSTEP 4 kỹ năng', classesCount: 2, studentsCount: 42, avgClassScore: 6.6, status: 'ACTIVE' },
  { id: 't-3', name: 'Nguyễn Văn Dũng', initials: 'VD', avatarUrl: pravatar(43), email: 'dung.nguyen@orbi.edu.vn', subject: 'TOEIC Listening & Reading', classesCount: 2, studentsCount: 48, avgClassScore: 582, status: 'ACTIVE' },
  { id: 't-4', name: 'Hoàng Thị Lan', initials: 'TL', avatarUrl: pravatar(44), email: 'lan.hoang@orbi.edu.vn', subject: 'Ngữ pháp nền tảng', classesCount: 1, studentsCount: 30, avgClassScore: 480, status: 'ACTIVE' },
  { id: 't-5', name: 'Đinh Công Minh', initials: 'CM', avatarUrl: pravatar(45), email: 'minh.dinh@orbi.edu.vn', subject: 'VSTEP 4 kỹ năng', classesCount: 0, studentsCount: 0, avgClassScore: 0, status: 'PENDING' },
  { id: 't-6', name: 'Võ Thanh Trúc', initials: 'TT', avatarUrl: pravatar(46), email: 'truc.vo@orbi.edu.vn', subject: 'Từ vựng học thuật', classesCount: 1, studentsCount: 20, avgClassScore: 7.1, status: 'LOCKED' },
];

export const MOCK_APPROVALS: ApprovalRequest[] = [
  { id: 'ap-1', type: 'TEST', title: 'Đề kiểm tra giữa kỳ TOEIC K12', author: 'Trần Thu Hà', submittedAt: '2026-10-28T09:00:00.000Z', status: 'PENDING', summary: '100 câu Listening & Reading, 60 phút, bám sát ETS 2024.' },
  { id: 'ap-2', type: 'QUESTION', title: '25 câu Part 5 — Chủ đề Conditional', author: 'Hoàng Thị Lan', submittedAt: '2026-10-27T14:30:00.000Z', status: 'PENDING', summary: 'Bộ câu hỏi mới cho ngân hàng ngữ pháp nền tảng, độ khó 2–4.' },
  { id: 'ap-3', type: 'LESSON', title: 'Video: VSTEP Speaking Part 3 — Mind Map', author: 'Phạm Ngọc Linh', submittedAt: '2026-10-26T11:00:00.000Z', status: 'PENDING', summary: 'Bài giảng 18 phút kèm transcript song ngữ và quiz cuối bài.' },
  { id: 'ap-4', type: 'POST', title: 'Bài viết: 7 lỗi Part 2 thí sinh hay mắc', author: 'Nguyễn Văn Dũng', submittedAt: '2026-10-25T16:20:00.000Z', status: 'APPROVED', summary: 'Bài blog kinh nghiệm cho mục Kinh nghiệm thi.' },
  { id: 'ap-5', type: 'QUESTION', title: '10 câu Part 7 — Đoạn ba Logistics', author: 'Nguyễn Văn Dũng', submittedAt: '2026-10-24T10:00:00.000Z', status: 'REJECTED', summary: 'Trùng lặp với bộ đề ETS 2023; cần biên soạn lại.' },
  { id: 'ap-6', type: 'TEST', title: 'VSTEP B2 — Đề thi cuối khoá 5', author: 'Phạm Ngọc Linh', submittedAt: '2026-10-23T08:00:00.000Z', status: 'APPROVED', summary: 'Đề 4 kỹ năng theo format Bộ GD&ĐT.' },
];

export const MOCK_COMPLAINTS: Complaint[] = [
  { id: 'cp-1', student: 'Nguyễn Minh Anh', subject: 'Nghi ngờ đáp án câu Part 5', questionRef: 'p5-03 · ETS 2024 Test 1', content: 'Em nghĩ "Although" cũng đúng vì có thể hiểu là mệnh đề rút gọn. Mong thầy cô xem lại.', status: 'NEW', createdAt: '2026-10-28T20:00:00.000Z' },
  { id: 'cp-2', student: 'Vũ Đức Thành', subject: 'Điểm Writing chưa hợp lý', questionRef: 'Writing Task 2 · VSTEP B2 K5', content: 'Bài em đủ 260 từ, đủ 4 đoạn nhưng chỉ được 5.0. Em xin phúc khảo.', status: 'IN_REVIEW', createdAt: '2026-10-27T09:30:00.000Z' },
  { id: 'cp-3', student: 'Lý Bảo Ngọc', subject: 'Audio Part 3 bị lỗi', questionRef: 'p3-02 · Mini Listening #1', content: 'File audio dừng ở giây thứ 12, không nghe được phần còn lại.', status: 'RESOLVED', createdAt: '2026-10-22T11:00:00.000Z' },
  { id: 'cp-4', student: 'Đặng Hải Yến', subject: 'Lời giải thích chưa rõ', questionRef: 'p6-02 · ETS 2023 Test 5', content: 'Giải thích câu chèn quá ngắn, em chưa hiểu vì sao loại đáp án B.', status: 'NEW', createdAt: '2026-10-29T06:00:00.000Z' },
];

export const MOCK_CLASS_REPORTS: ClassReport[] = [
  { classId: 'cl-4', className: 'TOEIC 850 Intensive', teacher: 'Trần Thu Hà', students: 15, avgScore: 790, attendance: 97, grade: 'A', trend: 4 },
  { classId: 'cl-1', className: 'TOEIC 650+ K12', teacher: 'Trần Thu Hà', students: 28, avgScore: 642, attendance: 91, grade: 'A', trend: 6 },
  { classId: 'cl-9', className: 'TOEIC 650+ K11', teacher: 'Nguyễn Văn Dũng', students: 26, avgScore: 618, attendance: 85, grade: 'B', trend: 2 },
  { classId: 'cl-2', className: 'VSTEP B2 Khoá 5', teacher: 'Phạm Ngọc Linh', students: 22, avgScore: 6.8, attendance: 84, grade: 'B', trend: 3 },
  { classId: 'cl-3', className: 'TOEIC Foundation Sáng', teacher: 'Trần Thu Hà', students: 35, avgScore: 512, attendance: 76, grade: 'C', trend: -1 },
  { classId: 'cl-7', className: 'Ngữ pháp nền tảng A1', teacher: 'Hoàng Thị Lan', students: 30, avgScore: 480, attendance: 69, grade: 'D', trend: -4 },
];

export const HEAD_NOTIFICATIONS: AppNotification[] = [
  { id: 'hn-1', title: '3 học liệu chờ phê duyệt', message: 'Trần Thu Hà gửi 2 tài liệu, Lê Quốc Bảo gửi 1 đề luyện Part 7.', type: 'SYSTEM', isRead: false, createdAt: '2026-11-01T09:30:00.000Z', link: '/head/approvals' },
  { id: 'hn-2', title: 'Khiếu nại mới về điểm Writing', message: 'Học viên lớp VSTEP B2 Khoá 5 đề nghị chấm lại bài Task 2.', type: 'CLASS', isRead: false, createdAt: '2026-10-31T15:10:00.000Z', link: '/head/complaints' },
  { id: 'hn-3', title: 'Lớp TOEIC Foundation Sáng chuyên cần thấp', message: 'Chuyên cần 76%, thấp nhất bộ môn trong tháng 10.', type: 'CLASS', isRead: false, createdAt: '2026-10-30T08:00:00.000Z', link: '/head/classes' },
  { id: 'hn-4', title: 'Báo cáo tháng 10 đã sẵn sàng', message: 'Tổng hợp điểm thi thử, tỷ lệ hoàn thành của 4 lớp.', type: 'SYSTEM', isRead: true, createdAt: '2026-10-31T23:00:00.000Z', link: '/head/reports' },
];

/** Chuyên cần và hoàn thành bài tập trung bình bộ môn theo tháng (%) */
export const HEAD_MONTHLY = {
  labels: ['Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10'],
  attendance: [82, 84, 79, 86, 85, 84],
  completion: [68, 71, 66, 74, 78, 81],
};

// ---------- Phạm vi bộ môn: lớp, buổi học, học viên, kiểm định chấm, dự giờ ----------

/** Toàn bộ lớp thuộc bộ môn: 4 lớp của giáo viên đang đăng nhập (MOCK_CLASSES) + lớp của giáo viên khác */
export const DEPT_CLASSES: ClassRoom[] = [
  ...MOCK_CLASSES,
  { id: 'cl-5', coverUrl: PHOTOS.studying, name: 'VSTEP B1 Cấp tốc', code: 'ORB-B1CT', room: 'Phòng 204', examType: 'VSTEP', teacherName: 'Phạm Ngọc Linh', studentsCount: 24, assignmentsCount: 8, avgScore: 5.9, completionRate: 74, attendanceRate: 82, createdAt: '2026-09-10', schedule: 'T2 – T4 · 18:00', gradient: 'from-sky-500 to-cyan-600' },
  { id: 'cl-6', coverUrl: PHOTOS.library, name: 'VSTEP C1 Học thuật', code: 'ORB-C1HT', room: 'Online · Zoom', examType: 'VSTEP', teacherName: 'Phạm Ngọc Linh', studentsCount: 18, assignmentsCount: 12, avgScore: 7.4, completionRate: 88, attendanceRate: 90, createdAt: '2026-08-20', schedule: 'T6 – CN · 19:30', gradient: 'from-violet-500 to-fuchsia-600' },
  { id: 'cl-7', coverUrl: PHOTOS.notes, name: 'Ngữ pháp nền tảng A1', code: 'ORB-GA1X', room: 'Phòng 106', examType: 'TOEIC', teacherName: 'Hoàng Thị Lan', studentsCount: 30, assignmentsCount: 6, avgScore: 480, completionRate: 58, attendanceRate: 69, createdAt: '2026-09-20', schedule: 'T3 – T5 · 17:30', gradient: 'from-amber-400 to-orange-500' },
  { id: 'cl-8', coverUrl: PHOTOS.meeting, name: 'TOEIC 500+ Tối', code: 'ORB-5T0I', room: 'Phòng 302', examType: 'TOEIC', teacherName: 'Nguyễn Văn Dũng', studentsCount: 22, assignmentsCount: 7, avgScore: 545, completionRate: 69, attendanceRate: 80, createdAt: '2026-10-05', schedule: 'T2 – T4 · 19:00', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'cl-9', coverUrl: PHOTOS.laptop, name: 'TOEIC 650+ K11', code: 'ORB-K11Z', room: 'Phòng 303', examType: 'TOEIC', teacherName: 'Nguyễn Văn Dũng', studentsCount: 26, assignmentsCount: 13, avgScore: 618, completionRate: 80, attendanceRate: 85, createdAt: '2026-07-01', schedule: 'T3 – T5 – T7 · 19:00', gradient: 'from-indigo-500 to-violet-600' },
  { id: 'cl-10', coverUrl: PHOTOS.books, name: 'Từ vựng học thuật B2', code: 'ORB-VB2A', room: 'Online · Google Meet', examType: 'VSTEP', teacherName: 'Võ Thanh Trúc', studentsCount: 20, assignmentsCount: 4, avgScore: 7.1, completionRate: 62, attendanceRate: 78, createdAt: '2026-09-01', schedule: 'T7 · 14:00', gradient: 'from-rose-500 to-pink-600' },
];

export const DEPT_SESSIONS = buildSessions(DEPT_CLASSES);

/** Giáo viên theo tên (lớp lưu tên giáo viên) */
export const teacherByName = (name: string) => MOCK_TEACHERS.find((t) => t.name === name);

const NAMES = ['Nguyễn Thảo Vy', 'Lê Hoàng Nam', 'Trịnh Mỹ Linh', 'Phan Đức Anh', 'Cao Thị Hồng', 'Mai Quốc Việt', 'Tạ Ngọc Hân', 'Đoàn Minh Khôi', 'Lương Gia Bảo', 'Hà Phương Thảo', 'Kiều Anh Tuấn', 'Châu Bảo Trâm', 'Dương Thế Vinh', 'Quách Ngọc Mai', 'Ông Văn Lộc', 'Lâm Tường Vi', 'Triệu Hải Đăng', 'Vương Khánh Linh', 'Tôn Nữ Minh Châu', 'Âu Đức Trọng', 'Giang Thu Trang', 'Hồ Nhật Minh', 'Lại Thị Bích', 'Mạc Gia Khang', 'Nghiêm Thu Hà', 'Phùng Đức Mạnh', 'Bạch Ngọc Ánh', 'Khúc Minh Tâm', 'Lưu Thanh Hằng', 'Thái Quốc Huy', 'Văn Khánh Ngân', 'Diệp Gia Hưng', 'Ninh Thảo My', 'Đàm Anh Khoa', 'Sầm Bảo Ngọc', 'Yên Thế Sơn'];
const slugMail = (n: string) =>
  n
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .split(' ')
    .slice(-2)
    .join('') + '@gmail.com';

/** Học viên toàn bộ môn: lớp K12 dùng danh sách của giáo viên, các lớp khác sinh 4 học viên mẫu */
export const DEPT_STUDENTS: DeptStudent[] = [
  ...MOCK_CLASS_STUDENTS.map((st, i) => ({ ...st, classId: 'cl-1', attendance: st.status === 'RISK' ? 62 + i : st.status === 'WARNING' ? 78 + i : 90 + (i % 8) })),
  ...DEPT_CLASSES.slice(1).flatMap((c, ci) =>
    [0, 1, 2, 3].map((k): DeptStudent => {
      const name = NAMES[(ci * 4 + k) % NAMES.length];
      const status: ClassStudent['status'] = k === 3 && ci % 2 === 0 ? 'RISK' : k === 2 && ci % 3 === 0 ? 'WARNING' : 'GOOD';
      const delta = status === 'RISK' ? -0.14 : status === 'WARNING' ? -0.06 : 0.04 * (k + 1);
      const avg = c.examType === 'TOEIC' ? Math.round((c.avgScore * (1 + delta)) / 5) * 5 : Math.round(c.avgScore * (1 + delta) * 10) / 10;
      return {
        id: `ds-${c.id}-${k}`,
        name,
        initials: name
          .split(' ')
          .slice(-2)
          .map((w) => w[0])
          .join(''),
        avatarUrl: pravatar(30 + ci * 4 + k),
        email: slugMail(name),
        avgScore: avg,
        completion: status === 'RISK' ? 48 + k : status === 'WARNING' ? 66 + k : 80 + k * 4,
        streak: status === 'RISK' ? 0 : 4 + ci + k * 3,
        lastActive: `2026-10-${status === 'RISK' ? 20 + k : 28 + (k % 2)}T19:00:00.000Z`,
        status,
        classId: c.id,
        attendance: status === 'RISK' ? 58 + ci : status === 'WARNING' ? 74 + k : 86 + ((ci + k) % 12),
      };
    })
  ),
];

/** Bài Viết/Nói giáo viên đã chấm, trưởng bộ môn chấm kiểm định (điểm tiêu chí thang 10) */
export const MOCK_GRADING_REVIEWS: GradingReview[] = [
  {
    id: 'gr-1',
    classId: 'cl-2',
    className: 'VSTEP B2 Khoá 5',
    teacher: 'Trần Thu Hà',
    studentName: 'Vũ Đức Thành',
    avatarUrl: pravatar(24),
    type: 'ESSAY',
    taskId: 'vs-w-2',
    gradedAt: '2026-10-27T08:00:00.000Z',
    status: 'PENDING',
    content:
      'In recent years, there has been a debate about whether universities should prepare students for particular jobs or give them a broad education. In my opinion, both approaches have merits, but a balanced approach is the best.\n\nOn the one hand, career-focused programs help graduates find jobs quickly. Employers want staff who can work immediately without long training. For example, nursing or accounting students learn practical skills that they use from the first day at work.\n\nOn the other hand, a general education develops critical thinking and communication, which are useful in every job. The labour market changes very fast, so people who can learn new things will adapt more easily than those who only have narrow skills.\n\nIn conclusion, universities should combine specific training with general knowledge so that graduates are both employable and flexible.',
    teacherCriteria: { task: 5, coherence: 5, lexical: 5, grammar: 5 },
    teacherFeedback: 'Bài đủ ý nhưng lập luận còn chung chung, ví dụ chưa cụ thể.',
  },
  {
    id: 'gr-2',
    classId: 'cl-2',
    className: 'VSTEP B2 Khoá 5',
    teacher: 'Trần Thu Hà',
    studentName: 'Đỗ Thị Mai',
    avatarUrl: pravatar(23),
    type: 'ESSAY',
    taskId: 'vs-w-1',
    gradedAt: '2026-10-29T10:00:00.000Z',
    status: 'PENDING',
    content:
      'Dear Sir or Madam,\n\nI am writing to complain about my recent stay at your hotel from 12 to 15 October. Unfortunately, several problems spoiled my business trip.\n\nFirstly, the air conditioner in my room did not work, so I could not sleep well before important meetings. Secondly, the Wi-Fi was extremely slow, which made it impossible to prepare my presentation.\n\nI would be grateful if you could refund part of the room rate and make sure these problems are fixed for future guests.\n\nYours faithfully,\nMai Do',
    teacherCriteria: { task: 8, coherence: 7, lexical: 7, grammar: 8 },
    teacherFeedback: 'Thư đúng format, đủ 3 ý. Cần thêm từ vựng trang trọng hơn.',
  },
  {
    id: 'gr-3',
    classId: 'cl-5',
    className: 'VSTEP B1 Cấp tốc',
    teacher: 'Phạm Ngọc Linh',
    studentName: 'Ông Văn Lộc',
    avatarUrl: pravatar(44),
    type: 'SPEAKING',
    taskId: 'vs-s-2',
    gradedAt: '2026-10-30T14:00:00.000Z',
    status: 'PENDING',
    content: 'Bản ghi âm 3 phút 42 giây. Học viên chọn phương án giờ làm linh hoạt, đưa 2 lý do (giảm thời gian đi lại, chủ động chăm sóc gia đình), có so sánh ngắn với 2 phương án còn lại. Ngập ngừng ở phút thứ 2, phát âm đuôi -ed chưa rõ.',
    teacherCriteria: { fluency: 6, pronunciation: 5, lexical: 6, grammar: 6 },
    teacherFeedback: 'Ý rõ, cần luyện phát âm đuôi -ed và giảm ngập ngừng.',
  },
  {
    id: 'gr-4',
    classId: 'cl-6',
    className: 'VSTEP C1 Học thuật',
    teacher: 'Phạm Ngọc Linh',
    studentName: 'Vương Khánh Linh',
    avatarUrl: pravatar(47),
    type: 'ESSAY',
    taskId: 'vs-w-2',
    gradedAt: '2026-10-25T09:00:00.000Z',
    status: 'AGREED',
    content: 'Whether higher education should be vocational or general is a long-standing question. While job-oriented degrees offer a direct path to employment, I would argue that a broad curriculum better equips graduates for a labour market that is constantly reshaped by technology...',
    teacherCriteria: { task: 8, coherence: 8, lexical: 9, grammar: 8 },
    teacherFeedback: 'Bài tốt, lập luận chặt.',
    headCriteria: { task: 8, coherence: 8, lexical: 9, grammar: 8 },
  },
  {
    id: 'gr-5',
    classId: 'cl-10',
    className: 'Từ vựng học thuật B2',
    teacher: 'Võ Thanh Trúc',
    studentName: 'Đàm Anh Khoa',
    avatarUrl: pravatar(63),
    type: 'ESSAY',
    taskId: 'vs-w-2',
    gradedAt: '2026-10-24T09:00:00.000Z',
    status: 'ADJUSTED',
    content: 'Universities nowadays face pressure to train students for jobs. Many people think this is good because students need money after graduation. However, I think universities also need to teach other subjects...',
    teacherCriteria: { task: 9, coherence: 8, lexical: 9, grammar: 9 },
    teacherFeedback: 'Rất tốt.',
    headCriteria: { task: 7, coherence: 7, lexical: 7, grammar: 7 },
    headNote: 'Chấm cao hơn thực tế khoảng 1,75 điểm; bài chưa nêu rõ quan điểm cá nhân, từ vựng còn lặp.',
  },
  {
    id: 'gr-6',
    classId: 'cl-5',
    className: 'VSTEP B1 Cấp tốc',
    teacher: 'Phạm Ngọc Linh',
    studentName: 'Quách Ngọc Mai',
    avatarUrl: pravatar(43),
    type: 'SPEAKING',
    taskId: 'vs-s-1',
    gradedAt: '2026-10-31T16:00:00.000Z',
    status: 'PENDING',
    content: 'Bản ghi âm 2 phút 50 giây. Trả lời đủ 3 câu về quê hương, câu trả lời ngắn, ít mở rộng. Phát âm khá rõ.',
    teacherCriteria: { fluency: 7, pronunciation: 7, lexical: 6, grammar: 6 },
    teacherFeedback: 'Cần mở rộng câu trả lời bằng ví dụ.',
  },
];

/** Lịch dự giờ của trưởng bộ môn */
export const MOCK_OBSERVATIONS: ClassObservation[] = [
  { id: 'ob-1', classId: 'cl-7', teacher: 'Hoàng Thị Lan', date: '2026-10-22', start: '17:30', topic: 'Thì quá khứ đơn', status: 'DONE', rating: 3, strengths: 'Giải thích ngữ pháp rõ, có ví dụ gần gũi.', improvements: 'Ít hoạt động cho học viên luyện tập; nhiều học viên mất tập trung cuối buổi.' },
  { id: 'ob-2', classId: 'cl-1', teacher: 'Trần Thu Hà', date: '2026-10-26', start: '19:00', topic: 'Part 5: từ loại và vị trí trong câu', status: 'DONE', rating: 5, strengths: 'Giờ học sôi nổi, chữa lỗi theo nhóm nguyên nhân rất hiệu quả.', improvements: 'Có thể giao thêm bài về nhà dạng flashcard.' },
  { id: 'ob-3', classId: 'cl-5', teacher: 'Phạm Ngọc Linh', date: '2026-10-28', start: '18:00', topic: 'Writing Task 1: thư phàn nàn', status: 'DONE', rating: 4, strengths: 'Bám sát tiêu chí chấm VSTEP.', improvements: 'Thời gian luyện viết tại lớp còn ít.' },
  { id: 'ob-4', classId: 'cl-8', teacher: 'Nguyễn Văn Dũng', date: '2026-11-04', start: '19:00', topic: 'Part 2: câu hỏi Yes/No và câu hỏi đuôi', status: 'PLANNED' },
  { id: 'ob-5', classId: 'cl-10', teacher: 'Võ Thanh Trúc', date: '2026-11-07', start: '14:00', topic: 'Từ vựng chủ đề môi trường', status: 'PLANNED' },
];
