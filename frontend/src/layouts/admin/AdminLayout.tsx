import React from 'react';
import { LayoutDashboard, Users, Tags, FolderTree, FileQuestion, FileText, BarChart3, History, Sliders, Activity, Newspaper } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';

const GROUPS: NavGroup[] = [
  {
    title: 'Quản trị',
    items: [
      { to: '/admin/dashboard', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
      { to: '/admin/users', label: 'Người dùng & Phân quyền', icon: Users },
      { to: '/admin/skill-tags', label: 'Danh mục kỹ năng', icon: Tags },
      { to: '/admin/courses', label: 'Cây thư mục khoá học', icon: FolderTree },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { to: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: FileQuestion },
      { to: '/admin/tests', label: 'Cấu hình đề thi', icon: FileText },
      { to: '/admin/blog', label: 'Tin tức (CMS)', icon: Newspaper },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { to: '/admin/analytics', label: 'Thống kê truy cập', icon: BarChart3 },
      { to: '/admin/system', label: 'Trạng thái dịch vụ', icon: Activity, badge: '1' },
      { to: '/admin/audit-logs', label: 'Nhật ký hệ thống', icon: History },
      { to: '/admin/settings', label: 'Cấu hình tham số', icon: Sliders },
    ],
  },
];

export const AdminLayout: React.FC = () => (
  <AppShell groups={GROUPS} brandTagline="Admin Console" headerLabel="System Administrator" accent="rose" settingsTo="/admin/settings" notificationsTo="/admin/audit-logs" />
);
