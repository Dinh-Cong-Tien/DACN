import React from 'react';
import { Plus, LayoutDashboard, Users, ClipboardList, CalendarDays, PenTool, FileText, FilePen, Briefcase, GraduationCap, School, PenLine, BookMarked, Headphones, Database } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { TeacherNav, usePendingGradingCount } from './TeacherNav';

/** Menu ngăn kéo (điện thoại) và thanh đáy; header máy tính dùng TeacherNav */
const groupsOf = (toGrade: number): NavGroup[] => [
  {
    // 4 mục đầu cũng là thanh đáy trên điện thoại
    title: 'Giảng dạy',
    items: [
      { to: '/teacher/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/teacher/courses', label: 'Khoá học & Lớp', icon: Users },
      { to: '/teacher/assignments', label: 'Bài tập', icon: ClipboardList },
      { to: '/teacher/grading', label: 'Chấm bài', icon: PenTool, badge: toGrade ? String(toGrade) : undefined },
      { to: '/teacher/schedule', label: 'Lịch dạy', icon: CalendarDays },
    ],
  },
  {
    title: 'Khoá học & Lớp',
    items: [
      { to: '/teacher/courses?muc=toeic', label: 'Khoá học TOEIC', icon: Briefcase },
      { to: '/teacher/courses?muc=vstep', label: 'Khoá học VSTEP', icon: GraduationCap },
      { to: '/teacher/courses?muc=thpt', label: 'Tiếng Anh THPT', icon: School },
      { to: '/teacher/classes', label: 'Tất cả lớp', icon: Users },
    ],
  },
  {
    title: 'Luyện tập',
    items: [
      { to: '/teacher/library/tests?tab=TOEIC', label: 'Đề thi thử', icon: FileText },
      { to: '/teacher/library/tests?tab=writing', label: 'Đề Viết & Nói', icon: PenLine },
      { to: '/teacher/library/practice?tab=grammar', label: 'Ngữ pháp & Từ vựng', icon: BookMarked },
      { to: '/teacher/library/practice?tab=dictation', label: 'Nghe chép chính tả', icon: Headphones },
    ],
  },
  {
    // Bài đã giao, Chấm bài đã có ở nhóm Giảng dạy (thanh đáy)
    title: 'Bài tập',
    items: [
      { to: '/teacher/assignments?new=1', label: 'Giao bài mới', icon: Plus },
      { to: '/teacher/authoring', label: 'Soạn câu hỏi & đề', icon: FilePen },
      { to: '/teacher/question-bank', label: 'Ngân hàng câu hỏi', icon: Database },
    ],
  },
];

/** Lịch dạy nằm trong menu tài khoản (avatar) trên header */
const ACCOUNT_LINKS = [{ to: '/teacher/schedule', label: 'Lịch dạy', icon: CalendarDays }];

export const TeacherLayout: React.FC = () => {
  const toGrade = usePendingGradingCount();
  const groups = React.useMemo(() => groupsOf(toGrade), [toGrade]);
  return (
  <AppShell groups={groups} brandTagline="Khu vực giáo viên" headerLabel="Khu vực giáo viên" accent="emerald" settingsTo="/teacher/settings" profileTo="/teacher/settings" accountLinks={ACCOUNT_LINKS} notificationsTo="/teacher/notifications" workspace headerNav={<TeacherNav />} />
  );
};
