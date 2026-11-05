import React, { useMemo } from 'react';
import { BookMarked, BookOpen, Briefcase, CalendarDays, ClipboardList, Database, FileEdit, FileText, GraduationCap, Headphones, Mic, PenLine, PenTool, PlayCircle, Plus, School, UserRoundX, Users } from 'lucide-react';
import { useGradingQueue, useTeacherAssignments } from '@/shared/api/teacher';
import { StaffNav, type StaffMenu } from '@/shared/components/layout/StaffNav';

/**
 * Menu header giáo viên — menu chỉ giữ trang xem chung nhiều lớp; việc của một lớp làm trong trang lớp, không tách riêng:
 *  - Khoá học & Lớp: 3 mục khoá như học viên → khoá → các lớp của khoá → trang lớp (bảng tin, tiến độ khoá, học viên,
 *    buổi học & điểm danh, bài tập, tài liệu, bảng điểm, thống kê).
 *  - Lịch dạy: lịch tuần của mọi lớp (điểm danh mở từ từng buổi).
 *  - Thi thử & Luyện tập: bám đúng menu học viên (đề thi thử, Viết, Nói, ngữ pháp, từ vựng, chép chính tả) để giao cho lớp.
 *  - Bài tập: giao bài, bài đã giao, bản nháp, chấm bài của mọi lớp.
 *  - Học viên: hồ sơ học viên mọi lớp, học viên cần theo dõi.
 *  - Soạn học liệu: câu hỏi, đề tự soạn gửi duyệt; ngân hàng câu hỏi.
 */
export const buildTeacherMenus = (toGrade: number, drafts: number): StaffMenu[] => [
  { to: '/teacher/dashboard', label: 'Tổng quan' },
  {
    label: 'Khoá học & Lớp',
    icon: PlayCircle,
    to: '/teacher/courses',
    activeOn: ['/teacher/classes', '/teacher/gradebook', '/teacher/analytics', '/teacher/materials'],
    children: [
      { to: '/teacher/courses?muc=toeic', label: 'Khoá học TOEIC', icon: Briefcase, desc: 'Nền tảng, Listening Part 1–4, Reading Part 5–7' },
      { to: '/teacher/courses?muc=vstep', label: 'Khoá học VSTEP', icon: GraduationCap, desc: 'Nền tảng, Nghe, Đọc, Viết, Nói' },
      { to: '/teacher/courses?muc=thpt', label: 'Tiếng Anh THPT', icon: School, desc: 'Lớp 10, 11, 12 theo SGK Global Success' },
    ],
  },
  { to: '/teacher/schedule', label: 'Lịch dạy', icon: CalendarDays, activeOn: ['/teacher/attendance'] },
  {
    label: 'Thi thử & Luyện tập',
    icon: FileText,
    children: [
      { to: '/teacher/library/tests?tab=TOEIC', label: 'Đề thi thử TOEIC', icon: FileText, desc: 'Full đề hoặc từng Part, chấm tự động', group: 'Đề thi thử' },
      { to: '/teacher/library/tests?tab=VSTEP', label: 'Đề thi thử VSTEP', icon: FileText, desc: 'Nghe, Đọc chấm tự động', group: 'Đề thi thử' },
      { to: '/teacher/library/tests?tab=writing', label: 'Đề Viết', icon: PenLine, desc: 'Học viên nộp bài, giáo viên chấm theo tiêu chí', group: 'Viết & Nói' },
      { to: '/teacher/library/tests?tab=speaking', label: 'Đề Nói', icon: Mic, desc: 'Học viên ghi âm, giáo viên nhận xét', group: 'Viết & Nói' },
      { to: '/teacher/library/practice?tab=grammar', label: 'Chủ điểm ngữ pháp', icon: BookMarked, desc: 'Lý thuyết kèm bài tập chấm tự động', group: 'Luyện tập' },
      { to: '/teacher/library/practice?tab=vocab', label: 'Từ vựng & Flashcard', icon: BookOpen, desc: 'Bộ từ theo chủ đề TOEIC, VSTEP', group: 'Luyện tập' },
      { to: '/teacher/library/practice?tab=dictation', label: 'Nghe chép chính tả', icon: Headphones, desc: 'Chấm theo % chép đúng', group: 'Luyện tập' },
    ],
  },
  {
    label: 'Bài tập',
    to: '/teacher/assignments',
    activeOn: ['/teacher/grading'],
    badge: toGrade ? String(toGrade) : undefined,
    children: [
      { to: '/teacher/assignments?new=1', label: 'Giao bài mới', icon: Plus, desc: 'Chọn lớp, nội dung, hạn nộp' },
      { to: '/teacher/assignments', label: 'Bài đã giao', icon: ClipboardList, desc: 'Hạn nộp, số bài đã nộp, điểm trung bình' },
      { to: '/teacher/assignments?status=DRAFT', label: 'Bản nháp', icon: FileEdit, desc: 'Bài đã soạn, chưa gửi học viên', badge: drafts ? String(drafts) : undefined },
      { to: '/teacher/grading', label: 'Chấm bài', icon: PenTool, desc: 'Bài Viết, Nói học viên mọi lớp đã nộp', badge: toGrade ? String(toGrade) : undefined, also: ['/teacher/grading'] },
    ],
  },
  {
    label: 'Học viên',
    to: '/teacher/students',
    children: [
      { to: '/teacher/students', label: 'Hồ sơ học viên', icon: Users, desc: 'Học viên mọi lớp: điểm, chuyên cần, nhật ký trao đổi' },
      { to: '/teacher/students?filter=watch', label: 'Cần theo dõi', icon: UserRoundX, desc: 'Vắng nhiều, nộp bài thiếu, điểm giảm' },
    ],
  },
  {
    label: 'Soạn học liệu',
    icon: FileEdit,
    children: [
      { to: '/teacher/authoring', label: 'Câu hỏi & đề tự soạn', icon: FileEdit, desc: 'Soạn câu hỏi, đề kiểm tra · gửi duyệt' },
      { to: '/teacher/question-bank', label: 'Ngân hàng câu hỏi', icon: Database, desc: 'Tra cứu theo Part · nhập đề từ file Word' },
    ],
  },
];

/** Số bài chờ chấm (badge menu Bài tập / Chấm bài, thanh đáy) */
export const usePendingGradingCount = () => useGradingQueue('pending').data?.length ?? 0;

export const TeacherNav: React.FC = () => {
  const toGrade = usePendingGradingCount();
  const drafts = useTeacherAssignments({ status: 'DRAFT' }).data?.length ?? 0;
  const menus = useMemo(() => buildTeacherMenus(toGrade, drafts), [toGrade, drafts]);
  return <StaffNav menus={menus} label="Menu giáo viên" />;
};
