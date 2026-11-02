import React from 'react';
import { LayoutDashboard, Users, ClipboardList, ClipboardCheck, CalendarDays, PenTool, FolderOpen, BarChart3, Video, FileText, BookOpen, Sheet, UserRound } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { TeacherNav, usePendingGradingCount } from './TeacherNav';

/** Menu ngăn kéo (điện thoại) và thanh đáy; header máy tính dùng TeacherNav */
const groupsOf = (toGrade: number): NavGroup[] => [
  {
    title: 'Giảng dạy',
    items: [
      { to: '/teacher/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/teacher/classes', label: 'Lớp học', icon: Users },
      { to: '/teacher/schedule', label: 'Lịch dạy', icon: CalendarDays },
      { to: '/teacher/grading', label: 'Chấm bài', icon: PenTool, badge: toGrade ? String(toGrade) : undefined },
      { to: '/teacher/assignments', label: 'Bài tập', icon: ClipboardList },
      { to: '/teacher/attendance', label: 'Điểm danh', icon: ClipboardCheck },
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
    title: 'Học liệu',
    items: [
      { to: '/teacher/library/courses', label: 'Khoá học & bài giảng', icon: Video },
      { to: '/teacher/library/tests', label: 'Ngân hàng đề', icon: FileText },
      { to: '/teacher/library/practice', label: 'Ngữ pháp & Từ vựng', icon: BookOpen },
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
