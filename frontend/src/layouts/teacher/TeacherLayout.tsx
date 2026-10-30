import React from 'react';
import { LayoutDashboard, Users, ClipboardList, PenTool, FolderOpen, BarChart3, Video } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';

const GROUPS: NavGroup[] = [
  {
    title: 'Giảng dạy',
    items: [
      { to: '/teacher/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/teacher/classes', label: 'Lớp học', icon: Users },
      { to: '/teacher/assignments', label: 'Bài tập', icon: ClipboardList },
      { to: '/teacher/grading', label: 'Chấm bài', icon: PenTool, badge: '3' },
    ],
  },
  {
    title: 'Học liệu',
    items: [
      { to: '/teacher/courses', label: 'Khoá học & Bài giảng', icon: Video },
      { to: '/teacher/materials', label: 'Tài liệu lớp', icon: FolderOpen },
      { to: '/teacher/analytics', label: 'Thống kê lớp học', icon: BarChart3 },
    ],
  },
];

export const TeacherLayout: React.FC = () => (
  <AppShell groups={GROUPS} brandTagline="Khu vực giáo viên" headerLabel="Khu vực giáo viên" accent="emerald" settingsTo="/teacher/settings" profileTo="/teacher/settings" notificationsTo="/teacher/notifications" />
);
