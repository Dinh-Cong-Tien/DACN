import React from 'react';
import {
  LayoutDashboard, Users, Tags, FileQuestion, FileText, BarChart3, History, Sliders, Activity, Newspaper, School, LifeBuoy, BookOpen, Library, CreditCard, Megaphone, Building2,
  GraduationCap, UserSquare2, CalendarDays, ClipboardList, Trophy, FolderOpen, CheckSquare, Scale, MessageSquareWarning, PieChart, Briefcase, PlayCircle, PenLine, Mic, BookMarked, Headphones,
} from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { StaffNav, type StaffMenu } from '@/shared/components/layout/StaffNav';
import { useAdminDashboard, useAdminSystem } from '@/shared/api/admin';
import { useHeadDashboard } from '@/shared/api/head';

const badge = (n?: number) => (n ? String(n) : undefined);
type Badges = { degraded?: string; openTickets?: string; pendingPay?: string; pending?: string; toReview?: string; complaints?: string; quality?: string; ops?: string };

/** Khoá học: 3 mục giống hệt menu học viên — mở cây khoá học đã chọn sẵn mục */
const COURSE_LINKS = [
  { to: '/admin/courses?muc=toeic', label: 'Khoá học TOEIC', icon: Briefcase, desc: 'Nền tảng, Listening Part 1–4, Reading Part 5–7' },
  { to: '/admin/courses?muc=vstep', label: 'Khoá học VSTEP', icon: GraduationCap, desc: 'Nền tảng, Nghe, Đọc, Viết, Nói' },
  { to: '/admin/courses?muc=thpt', label: 'Tiếng Anh THPT', icon: School, desc: 'Lớp 10, 11, 12 theo SGK Global Success' },
];
/** Thi thử & Luyện tập: nội dung đúng các mục học viên đang luyện */
const PRACTICE_LINKS = [
  { to: '/admin/tests', label: 'Đề thi thử', icon: FileText, desc: 'Đề TOEIC, VSTEP: cấu trúc, thời gian, câu hỏi', group: 'Đề thi thử' },
  { to: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: FileQuestion, desc: 'Câu hỏi TOEIC, VSTEP theo Part', group: 'Đề thi thử' },
  { to: '/admin/skill-tags', label: 'Nhãn kỹ năng', icon: Tags, desc: 'Gắn nhãn câu hỏi để phân tích điểm yếu', group: 'Đề thi thử' },
  { to: '/admin/learning/writing', label: 'Đề Viết', icon: PenLine, desc: 'Đề Viết học viên nộp cho giáo viên chấm', group: 'Viết & Nói' },
  { to: '/admin/learning/speaking', label: 'Đề Nói', icon: Mic, desc: 'Đề Nói học viên ghi âm nộp bài', group: 'Viết & Nói' },
  { to: '/admin/learning/rubrics', label: 'Tiêu chí chấm', icon: Scale, desc: 'Thang chấm Viết, Nói cho giáo viên', group: 'Viết & Nói' },
  { to: '/admin/learning/grammar', label: 'Chủ điểm ngữ pháp', icon: BookMarked, desc: 'Lý thuyết kèm bài tập chấm tự động', group: 'Luyện tập' },
  { to: '/admin/learning/vocab', label: 'Từ vựng & Flashcard', icon: BookOpen, desc: 'Bộ từ theo chủ đề, thẻ từ', group: 'Luyện tập', also: ['/admin/learning/words'] },
  { to: '/admin/learning/dictation', label: 'Nghe chép chính tả', icon: Headphones, desc: 'Bài nghe chép từng câu', group: 'Luyện tập' },
];

/** Menu header quản trị: người dùng → đào tạo → chất lượng → khoá học / thi thử & luyện tập (bám menu học viên) → vận hành (website, hệ thống) */
const buildMenus = ({ degraded, openTickets, pendingPay, pending, toReview, complaints, quality, ops }: Badges): StaffMenu[] => [
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
    label: 'Khoá học',
    icon: PlayCircle,
    to: '/admin/courses',
    children: COURSE_LINKS,
  },
  { label: 'Thi thử & Luyện tập', icon: FileText, children: PRACTICE_LINKS },
  {
    label: 'Vận hành',
    badge: ops,
    children: [
      { to: '/admin/billing', label: 'Gói VIP & thanh toán', icon: CreditCard, desc: 'Doanh thu, giao dịch, giá gói', badge: pendingPay },
      { to: '/admin/broadcasts', label: 'Gửi thông báo', icon: Megaphone, desc: 'Thông báo tới học viên, giáo viên' },
      { to: '/admin/analytics', label: 'Thống kê hệ thống', icon: BarChart3, desc: 'Người dùng, doanh thu, lượt học' },
      { to: '/admin/learning/resources', label: 'Tài liệu mở & FAQ', icon: Library, desc: 'Kho tài liệu mở, câu hỏi thường gặp', group: 'Website', also: ['/admin/learning/faq'] },
      { to: '/admin/blog', label: 'Tin tức (CMS)', icon: Newspaper, desc: 'Bài viết, giới thiệu kỳ thi, kinh nghiệm', group: 'Website' },
      { to: '/admin/system', label: 'Trạng thái dịch vụ', icon: Activity, desc: 'Máy chủ, cơ sở dữ liệu, lưu trữ, email', badge: degraded, group: 'Hệ thống' },
      { to: '/admin/audit-logs', label: 'Nhật ký hệ thống', icon: History, desc: 'Đăng nhập, thay đổi quyền, thao tác dữ liệu', group: 'Hệ thống' },
      { to: '/admin/settings', label: 'Cấu hình tham số', icon: Sliders, desc: 'Giới hạn, gói VIP, tài khoản nhận tiền, bảo mật', group: 'Hệ thống' },
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
  { title: 'Khoá học', items: COURSE_LINKS.map(({ to, label, icon }) => ({ to, label, icon })) },
  { title: 'Thi thử & Luyện tập', items: PRACTICE_LINKS.map(({ to, label, icon }) => ({ to, label, icon })) },
  {
    title: 'Vận hành',
    items: [
      { to: '/admin/billing', label: 'Gói VIP & thanh toán', icon: CreditCard, badge: pendingPay },
      { to: '/admin/broadcasts', label: 'Gửi thông báo', icon: Megaphone },
      { to: '/admin/learning/resources', label: 'Tài liệu mở & FAQ', icon: Library },
      { to: '/admin/blog', label: 'Tin tức (CMS)', icon: Newspaper },
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
    ops: badge((dash.data?.pendingPayments ?? 0) + (sys.data?.services.filter((x) => x.status !== 'UP').length ?? 0)),
  };
  const MENUS = buildMenus(b);
  const GROUPS = buildGroups(b);
  return (
  <AppShell groups={GROUPS} brandTagline="Quản trị hệ thống" headerLabel="Quản trị viên" accent="rose" settingsTo="/admin/settings" notificationsTo="/admin/notifications" workspace headerNav={<StaffNav menus={MENUS} label="Menu quản trị" />} />
  );
};
