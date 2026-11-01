import React from 'react';
import { LayoutDashboard, Users, ClipboardList, PenTool, FolderOpen, BarChart3, Video, FileText, GraduationCap, BookOpen, Mic } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { TeacherNav } from './TeacherNav';

/** Menu ngăn kéo (điện thoại) và thanh đáy; header máy tính dùng TeacherNav */
const GROUPS: NavGroup[] = [
  {
    title: 'Giảng dạy',
    items: [
      { to: '/teacher/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/teacher/classes', label: 'Lớp học', icon: Users },
      { to: '/teacher/assignments', label: 'Bài tập', icon: ClipboardList },
      { to: '/teacher/grading', label: 'Chấm bài', icon: PenTool, badge: '4' },
      { to: '/teacher/analytics', label: 'Thống kê', icon: BarChart3 },
    ],
  },
  {
    title: 'Học liệu',
    items: [
      { to: '/teacher/library/courses', label: 'Khoá học', icon: Video },
      { to: '/teacher/library/tests', label: 'Đề thi thử TOEIC / VSTEP', icon: FileText },
      { to: '/teacher/library/grammar', label: 'Ngữ pháp', icon: GraduationCap },
      { to: '/teacher/library/vocabulary', label: 'Từ vựng', icon: BookOpen },
      { to: '/teacher/library/writing-speaking', label: 'Đề Viết & Nói', icon: Mic },
      { to: '/teacher/materials', label: 'Tài liệu lớp', icon: FolderOpen },
    ],
  },
];

export const TeacherLayout: React.FC = () => (
  <AppShell groups={GROUPS} brandTagline="Khu vực giáo viên" headerLabel="Khu vực giáo viên" accent="emerald" settingsTo="/teacher/settings" profileTo="/teacher/settings" notificationsTo="/teacher/notifications" workspace headerNav={<TeacherNav />} />
);
