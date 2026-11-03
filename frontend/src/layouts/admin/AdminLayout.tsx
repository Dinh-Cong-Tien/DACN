import React from 'react';
import { LayoutDashboard, Users, Tags, FolderTree, FileQuestion, FileText, BarChart3, History, Sliders, Activity, Newspaper, School, LifeBuoy, BookOpen, PenTool, Library, CreditCard, Megaphone, Building2, GraduationCap, UserSquare2, CalendarDays, ClipboardList, Trophy, FolderOpen, CheckSquare, Scale, MessageSquareWarning, PieChart } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { StaffNav, type StaffMenu } from '@/shared/components/layout/StaffNav';
import { useAdminDashboard, useAdminSystem } from '@/shared/api/admin';
import { useHeadDashboard } from '@/shared/api/head';

const badge = (n?: number) => (n ? String(n) : undefined);
type Badges = { degraded?: string; openTickets?: string; pendingPay?: string; pending?: string; toReview?: string; complaints?: string; quality?: string };

/** Menu header quản trị: người dùng → đào tạo (bộ môn, giáo viên, lớp, học viên) → chất lượng → nội dung → vận hành → hệ thống */
const buildMenus = ({ degraded, openTickets, pendingPay, pending, toReview, complaints, quality }: Badges): StaffMenu[] => [
  { to: '/admin/dashboard', label: 'Tổng quan' },
  {
    label: 'Người dùng',
    badge: openTickets,
    children: [
      { to: '/admin/users', label: 'Tài khoản', icon: Users, desc: 'Học viên, giáo viên, phân quyền, khoá tài khoản' },
      { to: '/admin/support', label: 'Hỗ trợ học viên', icon: LifeBuoy, desc: 'Tin nhắn chat hỗ trợ, email, hotline', badge: openTickets },
    ],
  },
  {
    label: 'Đào tạo',
    children: [
      { to: '/admin/departments', label: 'Bộ môn', icon: Building2, desc: 'Bộ môn TOEIC, VSTEP và trưởng bộ môn phụ trách', group: 'Tổ chức' },
      { to: '/admin/teachers', label: 'Giáo viên', icon: UserSquare2, desc: 'Hồ sơ giảng dạy, lớp phụ trách, dự giờ' },
      { to: '/admin/classes', label: 'Lớp học', icon: School, desc: 'Mọi lớp, mã mời, phân công giáo viên' },
      { to: '/admin/students', label: 'Học viên', icon: GraduationCap, desc: 'Kết quả, chuyên cần, học viên nguy cơ bỏ học' },
      { to: '/admin/schedule', label: 'Lịch học & điểm danh', icon: CalendarDays, desc: 'Lịch tuần mọi lớp, trùng phòng', group: 'Trong lớp' },
      { to: '/admin/assignments', label: 'Bài tập các lớp', icon: ClipboardList, desc: 'Bài đã giao, tỉ lệ nộp, bài chờ chấm' },
      { to: '/admin/class-content', label: 'Tài liệu & bảng tin lớp', icon: FolderOpen, desc: 'Tài liệu giáo viên tải lên, bài đăng bảng tin' },
      { to: '/admin/results', label: 'Kết quả thi của học viên', icon: Trophy, desc: 'Điểm thi thử, luyện Part, bài kiểm tra' },
    ],
  },
  {
    label: 'Chất lượng',
    badge: quality,
    children: [
      { to: '/admin/approvals', label: 'Phê duyệt học liệu', icon: CheckSquare, desc: 'Đề thi, câu hỏi giáo viên gửi lên', badge: pending },
      { to: '/admin/grading-review', label: 'Kiểm định chấm bài', icon: Scale, desc: 'Chấm lại bài Viết, Nói giáo viên đã chấm', badge: toReview },
      { to: '/admin/complaints', label: 'Khiếu nại & phúc khảo', icon: MessageSquareWarning, desc: 'Học viên khiếu nại đáp án, xin chấm lại', badge: complaints },
      { to: '/admin/reports', label: 'Báo cáo đào tạo', icon: PieChart, desc: 'Xếp loại lớp, chuyên cần, hoàn thành theo tháng' },
    ],
  },
  {
    label: 'Nội dung',
    children: [
      { to: '/admin/courses', label: 'Khoá học', icon: FolderTree, desc: 'Cây khoá học, chặng, bài giảng', group: 'Khoá học & đề thi' },
      { to: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: FileQuestion, desc: 'Câu hỏi TOEIC, VSTEP theo Part' },
      { to: '/admin/tests', label: 'Cấu hình đề thi', icon: FileText, desc: 'Cấu trúc đề, thời gian, thang điểm' },
      { to: '/admin/skill-tags', label: 'Nhãn kỹ năng', icon: Tags, desc: 'Gắn nhãn câu hỏi để phân tích điểm yếu' },
      { to: '/admin/learning/grammar', label: 'Ngữ pháp & Từ vựng', icon: BookOpen, desc: 'Ngữ pháp, flashcard, thẻ từ, chép chính tả', group: 'Luyện tập', also: ['/admin/learning/vocab', '/admin/learning/words'] },
      { to: '/admin/learning/writing', label: 'Đề Viết & Nói', icon: PenTool, desc: 'Đề Viết, Nói và tiêu chí chấm', also: ['/admin/learning/speaking'] },
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
      { to: '/admin/analytics', label: 'Thống kê hệ thống', icon: BarChart3, desc: 'Người dùng, doanh thu, lượt học' },
    ],
  },
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
const buildGroups = ({ degraded, openTickets, pendingPay, pending, toReview, complaints }: Badges): NavGroup[] => [
  {
    title: 'Quản trị',
    items: [
      { to: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/admin/users', label: 'Tài khoản', icon: Users },
      { to: '/admin/support', label: 'Hỗ trợ học viên', icon: LifeBuoy, badge: openTickets },
      { to: '/admin/analytics', label: 'Thống kê', icon: BarChart3 },
    ],
  },
  {
    title: 'Đào tạo',
    items: [
      { to: '/admin/departments', label: 'Bộ môn', icon: Building2 },
      { to: '/admin/teachers', label: 'Giáo viên', icon: UserSquare2 },
      { to: '/admin/classes', label: 'Lớp học', icon: School },
      { to: '/admin/students', label: 'Học viên', icon: GraduationCap },
      { to: '/admin/schedule', label: 'Lịch học & điểm danh', icon: CalendarDays },
      { to: '/admin/assignments', label: 'Bài tập các lớp', icon: ClipboardList },
      { to: '/admin/class-content', label: 'Tài liệu & bảng tin lớp', icon: FolderOpen },
      { to: '/admin/results', label: 'Kết quả thi', icon: Trophy },
    ],
  },
  {
    title: 'Chất lượng',
    items: [
      { to: '/admin/approvals', label: 'Phê duyệt học liệu', icon: CheckSquare, badge: pending },
      { to: '/admin/grading-review', label: 'Kiểm định chấm bài', icon: Scale, badge: toReview },
      { to: '/admin/complaints', label: 'Khiếu nại & phúc khảo', icon: MessageSquareWarning, badge: complaints },
      { to: '/admin/reports', label: 'Báo cáo đào tạo', icon: PieChart },
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
  const head = useHeadDashboard().data;
  const b: Badges = {
    degraded: badge(sys.data?.services.filter((x) => x.status !== 'UP').length),
    openTickets: badge(dash.data?.openTickets),
    pendingPay: badge(dash.data?.pendingPayments),
    pending: badge(head?.pendingApprovals),
    toReview: badge(head?.pendingReviews),
    complaints: badge(head?.newComplaints),
    quality: badge((head?.pendingApprovals ?? 0) + (head?.pendingReviews ?? 0) + (head?.newComplaints ?? 0)),
  };
  const MENUS = buildMenus(b);
  const GROUPS = buildGroups(b);
  return (
  <AppShell groups={GROUPS} brandTagline="Quản trị hệ thống" headerLabel="Quản trị viên" accent="rose" settingsTo="/admin/settings" notificationsTo="/admin/notifications" workspace headerNav={<StaffNav menus={MENUS} label="Menu quản trị" />} />
  );
};
