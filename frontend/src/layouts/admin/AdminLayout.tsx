import React from 'react';
import { LayoutDashboard, Users, Tags, FolderTree, FileQuestion, FileText, BarChart3, History, Sliders, Activity, Newspaper, School, LifeBuoy, BookOpen, PenTool, Library, CreditCard, Megaphone } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { StaffNav, type StaffMenu } from '@/shared/components/layout/StaffNav';
import { useAdminDashboard, useAdminSystem } from '@/shared/api/admin';

const badge = (n?: number) => (n ? String(n) : undefined);
type Badges = { degraded?: string; openTickets?: string; pendingPay?: string };

/** Menu header quản trị: người dùng → nội dung học viên dùng → vận hành → thống kê → hệ thống */
const buildMenus = ({ degraded, openTickets, pendingPay }: Badges): StaffMenu[] => [
  { to: '/admin/dashboard', label: 'Tổng quan' },
  {
    label: 'Người dùng',
    badge: openTickets,
    children: [
      { to: '/admin/users', label: 'Tài khoản', icon: Users, desc: 'Học viên, giáo viên, phân quyền, khoá tài khoản' },
      { to: '/admin/classes', label: 'Lớp học', icon: School, desc: 'Mọi lớp trên hệ thống, mã mời, giáo viên phụ trách' },
      { to: '/admin/support', label: 'Hỗ trợ học viên', icon: LifeBuoy, desc: 'Tin nhắn chat hỗ trợ, email, hotline', badge: openTickets },
    ],
  },
  {
    label: 'Nội dung',
    children: [
      { to: '/admin/courses', label: 'Khoá học', icon: FolderTree, desc: 'Cây khoá học, chặng, bài giảng', group: 'Khoá học & đề thi' },
      { to: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: FileQuestion, desc: 'Câu hỏi TOEIC, VSTEP theo Part' },
      { to: '/admin/tests', label: 'Cấu hình đề thi', icon: FileText, desc: 'Cấu trúc đề, thời gian, thang điểm' },
      { to: '/admin/skill-tags', label: 'Nhãn kỹ năng', icon: Tags, desc: 'Gắn nhãn câu hỏi để phân tích điểm yếu' },
      { to: '/admin/learning/grammar', label: 'Ngữ pháp & Từ vựng', icon: BookOpen, desc: 'Chủ điểm ngữ pháp, bộ flashcard, thẻ từ', group: 'Luyện tập', also: ['/admin/learning/vocab', '/admin/learning/words'] },
      { to: '/admin/learning/writing', label: 'Đề Viết & Nói', icon: PenTool, desc: 'Đề VSTEP Writing, Speaking cho học viên luyện', also: ['/admin/learning/speaking'] },
      { to: '/admin/learning/resources', label: 'Tài liệu & FAQ', icon: Library, desc: 'Kho tài liệu mở, câu hỏi thường gặp', group: 'Website', also: ['/admin/learning/faq'] },
      { to: '/admin/blog', label: 'Tin tức (CMS)', icon: Newspaper, desc: 'Bài viết, giới thiệu kỳ thi, kinh nghiệm' },
    ],
  },
  {
    label: 'Vận hành',
    badge: pendingPay,
    children: [
      { to: '/admin/billing', label: 'Gói VIP & thanh toán', icon: CreditCard, desc: 'Doanh thu, giao dịch, giá gói', badge: pendingPay },
      { to: '/admin/broadcasts', label: 'Gửi thông báo', icon: Megaphone, desc: 'Thông báo tới học viên, giáo viên' },
    ],
  },
  { to: '/admin/analytics', label: 'Thống kê' },
  {
    label: 'Hệ thống',
    children: [
      { to: '/admin/system', label: 'Trạng thái dịch vụ', icon: Activity, desc: 'Máy chủ, cơ sở dữ liệu, lưu trữ, email', badge: degraded },
      { to: '/admin/audit-logs', label: 'Nhật ký hệ thống', icon: History, desc: 'Đăng nhập, thay đổi quyền, thao tác dữ liệu' },
      { to: '/admin/settings', label: 'Cấu hình tham số', icon: Sliders, desc: 'Giới hạn, gói VIP, chấm điểm, bảo mật' },
    ],
  },
];

/** Ngăn kéo (điện thoại), thanh đáy và footer */
const buildGroups = ({ degraded, openTickets, pendingPay }: Badges): NavGroup[] => [
  {
    title: 'Quản trị',
    items: [
      { to: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/admin/users', label: 'Tài khoản', icon: Users },
      { to: '/admin/classes', label: 'Lớp học', icon: School },
      { to: '/admin/support', label: 'Hỗ trợ học viên', icon: LifeBuoy, badge: openTickets },
      { to: '/admin/analytics', label: 'Thống kê', icon: BarChart3 },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { to: '/admin/courses', label: 'Khoá học', icon: FolderTree },
      { to: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: FileQuestion },
      { to: '/admin/tests', label: 'Cấu hình đề thi', icon: FileText },
      { to: '/admin/learning/grammar', label: 'Ngữ pháp & Từ vựng', icon: BookOpen },
      { to: '/admin/learning/writing', label: 'Đề Viết & Nói', icon: PenTool },
      { to: '/admin/learning/resources', label: 'Tài liệu & FAQ', icon: Library },
      { to: '/admin/skill-tags', label: 'Nhãn kỹ năng', icon: Tags },
      { to: '/admin/blog', label: 'Tin tức (CMS)', icon: Newspaper },
    ],
  },
  {
    title: 'Vận hành',
    items: [
      { to: '/admin/billing', label: 'Gói VIP & thanh toán', icon: CreditCard, badge: pendingPay },
      { to: '/admin/broadcasts', label: 'Gửi thông báo', icon: Megaphone },
      { to: '/admin/system', label: 'Trạng thái dịch vụ', icon: Activity, badge: degraded },
      { to: '/admin/audit-logs', label: 'Nhật ký hệ thống', icon: History },
      { to: '/admin/settings', label: 'Cấu hình tham số', icon: Sliders },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const dash = useAdminDashboard();
  const sys = useAdminSystem();
  const b: Badges = {
    degraded: badge(sys.data?.services.filter((x) => x.status !== 'UP').length),
    openTickets: badge(dash.data?.openTickets),
    pendingPay: badge(dash.data?.pendingPayments),
  };
  const MENUS = buildMenus(b);
  const GROUPS = buildGroups(b);
  return (
  <AppShell groups={GROUPS} brandTagline="Quản trị hệ thống" headerLabel="Quản trị viên" accent="rose" settingsTo="/admin/settings" notificationsTo="/admin/notifications" workspace headerNav={<StaffNav menus={MENUS} label="Menu quản trị" />} />
  );
};
