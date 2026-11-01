import React from 'react';
import { LayoutDashboard, Users, Tags, FolderTree, FileQuestion, FileText, BarChart3, History, Sliders, Activity, Newspaper } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { StaffNav, type StaffMenu } from '@/shared/components/layout/StaffNav';
import { MOCK_SERVICES } from '@/shared/mocks';

const degraded = MOCK_SERVICES.filter((s) => s.status !== 'UP').length;

/** Menu header quản trị: người dùng → nội dung học tập → thống kê → vận hành hệ thống */
const MENUS: StaffMenu[] = [
  { to: '/admin/dashboard', label: 'Tổng quan' },
  { to: '/admin/users', label: 'Người dùng' },
  {
    label: 'Nội dung',
    children: [
      { to: '/admin/courses', label: 'Khoá học', icon: FolderTree, desc: 'Cây khoá học, chặng, bài giảng' },
      { to: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: FileQuestion, desc: 'Câu hỏi TOEIC, VSTEP theo Part' },
      { to: '/admin/tests', label: 'Cấu hình đề thi', icon: FileText, desc: 'Cấu trúc đề, thời gian, thang điểm' },
      { to: '/admin/skill-tags', label: 'Nhãn kỹ năng', icon: Tags, desc: 'Gắn nhãn câu hỏi để phân tích điểm yếu' },
      { to: '/admin/blog', label: 'Tin tức (CMS)', icon: Newspaper, desc: 'Bài viết, giới thiệu kỳ thi, kinh nghiệm', group: 'Website' },
    ],
  },
  { to: '/admin/analytics', label: 'Thống kê' },
  {
    label: 'Hệ thống',
    children: [
      { to: '/admin/system', label: 'Trạng thái dịch vụ', icon: Activity, desc: 'Máy chủ, cơ sở dữ liệu, lưu trữ, email', badge: degraded ? String(degraded) : undefined },
      { to: '/admin/audit-logs', label: 'Nhật ký hệ thống', icon: History, desc: 'Đăng nhập, thay đổi quyền, thao tác dữ liệu' },
      { to: '/admin/settings', label: 'Cấu hình tham số', icon: Sliders, desc: 'Giới hạn, gói VIP, chấm điểm, bảo mật' },
    ],
  },
];

const GROUPS: NavGroup[] = [
  {
    title: 'Quản trị',
    items: [
      { to: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/admin/users', label: 'Người dùng', icon: Users },
      { to: '/admin/analytics', label: 'Thống kê', icon: BarChart3 },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { to: '/admin/courses', label: 'Khoá học', icon: FolderTree },
      { to: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: FileQuestion },
      { to: '/admin/tests', label: 'Cấu hình đề thi', icon: FileText },
      { to: '/admin/skill-tags', label: 'Nhãn kỹ năng', icon: Tags },
      { to: '/admin/blog', label: 'Tin tức (CMS)', icon: Newspaper },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { to: '/admin/system', label: 'Trạng thái dịch vụ', icon: Activity, badge: degraded ? String(degraded) : undefined },
      { to: '/admin/audit-logs', label: 'Nhật ký hệ thống', icon: History },
      { to: '/admin/settings', label: 'Cấu hình tham số', icon: Sliders },
    ],
  },
];

export const AdminLayout: React.FC = () => (
  <AppShell groups={GROUPS} brandTagline="Quản trị hệ thống" headerLabel="Quản trị viên" accent="rose" settingsTo="/admin/settings" notificationsTo="/admin/notifications" workspace headerNav={<StaffNav menus={MENUS} label="Menu quản trị" />} />
);
