import { PHOTOS, pravatar, unsplash } from '@/shared/components/media/Img';
import type { AppNotification, ApprovalRequest, ClassReport, Complaint, Subject, TeacherSummary } from '@/shared/types';

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sj-1', name: 'TOEIC Listening & Reading', code: 'TOEIC-LR', examType: 'TOEIC', teachersCount: 6, classesCount: 11, questionsCount: 2840, lead: 'Lê Quốc Bảo' },
  { id: 'sj-2', name: 'VSTEP 4 kỹ năng', code: 'VSTEP-4S', examType: 'VSTEP', teachersCount: 4, classesCount: 7, questionsCount: 1260, lead: 'Lê Quốc Bảo' },
  { id: 'sj-3', name: 'Ngữ pháp nền tảng', code: 'GRAM-FND', examType: 'TOEIC', teachersCount: 3, classesCount: 5, questionsCount: 980, lead: 'Trần Thu Hà' },
  { id: 'sj-4', name: 'Từ vựng học thuật', code: 'VOC-ACA', examType: 'VSTEP', teachersCount: 2, classesCount: 3, questionsCount: 640, lead: 'Phạm Ngọc Linh' },
];

export const MOCK_TEACHERS: TeacherSummary[] = [
  { id: 't-1', name: 'Trần Thu Hà', initials: 'TH', avatarUrl: pravatar(41), email: 'teacher@orbi.edu.vn', subject: 'TOEIC Listening & Reading', classesCount: 4, studentsCount: 100, avgClassScore: 648, status: 'ACTIVE' },
  { id: 't-2', name: 'Phạm Ngọc Linh', initials: 'NL', avatarUrl: pravatar(42), email: 'linh.pham@orbi.edu.vn', subject: 'VSTEP 4 kỹ năng', classesCount: 3, studentsCount: 64, avgClassScore: 6.9, status: 'ACTIVE' },
  { id: 't-3', name: 'Nguyễn Văn Dũng', initials: 'VD', avatarUrl: pravatar(43), email: 'dung.nguyen@orbi.edu.vn', subject: 'TOEIC Listening & Reading', classesCount: 3, studentsCount: 78, avgClassScore: 601, status: 'ACTIVE' },
  { id: 't-4', name: 'Hoàng Thị Lan', initials: 'TL', avatarUrl: pravatar(44), email: 'lan.hoang@orbi.edu.vn', subject: 'Ngữ pháp nền tảng', classesCount: 2, studentsCount: 55, avgClassScore: 540, status: 'ACTIVE' },
  { id: 't-5', name: 'Đinh Công Minh', initials: 'CM', avatarUrl: pravatar(45), email: 'minh.dinh@orbi.edu.vn', subject: 'VSTEP 4 kỹ năng', classesCount: 2, studentsCount: 40, avgClassScore: 6.2, status: 'PENDING' },
  { id: 't-6', name: 'Võ Thanh Trúc', initials: 'TT', avatarUrl: pravatar(46), email: 'truc.vo@orbi.edu.vn', subject: 'Từ vựng học thuật', classesCount: 1, studentsCount: 30, avgClassScore: 7.1, status: 'LOCKED' },
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
