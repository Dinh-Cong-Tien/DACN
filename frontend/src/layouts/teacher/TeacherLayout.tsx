import React from 'react';
import { LayoutDashboard, Users, ClipboardList, ClipboardCheck, CalendarDays, PenTool, FolderOpen, BarChart3, FileText, BookOpen, Sheet, UserRound, FilePen, Briefcase, GraduationCap, School, PenLine, Mic, BookMarked, Headphones, Database } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { TeacherNav, usePendingGradingCount } from './TeacherNav';

/** Menu ngăn kéo (điện thoại) và thanh đáy; header máy tính dùng TeacherNav */
const groupsOf = (toGrade: number): NavGroup[] => [
  {
    // 4 mục đầu cũng là thanh đáy trên điện thoại
    title: 'Giảng dạy',
    items: [
      { to: '/teacher/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/teacher/classes', label: 'Lớp học', icon: Users },
      { to: '/teacher/assignments', label: 'Bài tập', icon: ClipboardList },
      { to: '/teacher/grading', label: 'Chấm bài', icon: PenTool, badge: toGrade ? String(toGrade) : undefined },
      { to: '/teacher/schedule', label: 'Lịch dạy', icon: CalendarDays },
      { to: '/teacher/attendance', label: 'Điểm danh', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Khoá học & Lớp',
    items: [
      { to: '/teacher/library/courses?muc=toeic', label: 'Khoá học TOEIC', icon: Briefcase },
      { to: '/teacher/library/courses?muc=vstep', label: 'Khoá học VSTEP', icon: GraduationCap },
      { to: '/teacher/library/courses?muc=thpt', label: 'Tiếng Anh THPT', icon: School },
      { to: '/teacher/classes', label: 'Tất cả lớp', icon: Users },
    ],
  },
  {
    title: 'Thi thử & Luyện tập',
    items: [
      { to: '/teacher/library/tests?tab=TOEIC', label: 'Đề thi thử TOEIC', icon: FileText },
      { to: '/teacher/library/tests?tab=VSTEP', label: 'Đề thi thử VSTEP', icon: FileText },
      { to: '/teacher/library/tests?tab=writing', label: 'Đề Viết', icon: PenLine },
      { to: '/teacher/library/tests?tab=speaking', label: 'Đề Nói', icon: Mic },
      { to: '/teacher/library/practice?tab=grammar', label: 'Chủ điểm ngữ pháp', icon: BookMarked },
      { to: '/teacher/library/practice?tab=vocab', label: 'Từ vựng & Flashcard', icon: BookOpen },
      { to: '/teacher/library/practice?tab=dictation', label: 'Nghe chép chính tả', icon: Headphones },
    ],
  },
  {
    title: 'Học viên',
    items: [
      { to: '/teacher/students', label: 'Hồ sơ học viên', icon: UserRound },
      { to: '/teacher/gradebook', label: 'Bảng điểm', icon: Sheet },
      { to: '/teacher/analytics', label: 'Thống kê lớp', icon: BarChart3 },
    ],
  },
  {
    title: 'Soạn học liệu',
    items: [
      { to: '/teacher/authoring', label: 'Câu hỏi & đề tự soạn', icon: FilePen },
      { to: '/teacher/question-bank', label: 'Ngân hàng câu hỏi', icon: Database },
      { to: '/teacher/materials', label: 'Tài liệu lớp', icon: FolderOpen },
    ],
  },
];

export const TeacherLayout: React.FC = () => {
  const toGrade = usePendingGradingCount();
  const groups = React.useMemo(() => groupsOf(toGrade), [toGrade]);
  return (
  <AppShell groups={groups} brandTagline="Khu vực giáo viên" headerLabel="Khu vực giáo viên" accent="emerald" settingsTo="/teacher/settings" profileTo="/teacher/settings" notificationsTo="/teacher/notifications" workspace headerNav={<TeacherNav />} />
  );
};
