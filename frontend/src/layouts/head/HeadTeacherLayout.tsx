import React from 'react';
import { LayoutDashboard, Library, Database, Users, School, CheckSquare, BarChart3, MessageSquareWarning } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';

const GROUPS: NavGroup[] = [
  {
    title: 'Bộ môn',
    items: [
      { to: '/head/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/head/subjects', label: 'Môn học', icon: Library },
      { to: '/head/question-bank', label: 'Câu hỏi', icon: Database },
      { to: '/head/teachers', label: 'Giáo viên', icon: Users },
      { to: '/head/classes', label: 'Lớp học', icon: School },
    ],
  },
  {
    title: 'Chuyên môn',
    items: [
      { to: '/head/approvals', label: 'Phê duyệt học liệu', icon: CheckSquare, badge: '3' },
      { to: '/head/reports', label: 'Báo cáo tổng kết', icon: BarChart3 },
      { to: '/head/complaints', label: 'Khiếu nại & Phản hồi', icon: MessageSquareWarning, badge: '2' },
    ],
  },
];

export const HeadTeacherLayout: React.FC = () => (
  <AppShell groups={GROUPS} brandTagline="Trưởng bộ môn" headerLabel="Khu vực Trưởng bộ môn" accent="amber" settingsTo="/head/settings" profileTo="/head/settings" notificationsTo="/head/notifications" />
);
