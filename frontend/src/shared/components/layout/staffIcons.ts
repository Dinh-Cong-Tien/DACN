import {
  Activity, BarChart3, Building2, CalendarDays, ClipboardCheck, ClipboardList, FolderKanban, GraduationCap, LayoutDashboard, Library, Lightbulb,
  Server, ShieldCheck, Users, type LucideIcon,
} from 'lucide-react';

/**
 * Icon lucide cho mục menu CẤP 1 của khu quản lý (giáo viên, trưởng bộ môn, admin), tra theo nhãn.
 * Mục con trong dropdown dùng icon khai báo trực tiếp ở cấu hình menu của từng vai trò.
 */
export const STAFF_TOP_ICON: Record<string, LucideIcon> = {
  'Tổng quan': LayoutDashboard,
  // giáo viên
  'Lớp học': Users,
  'Lịch dạy': CalendarDays,
  'Bài tập': ClipboardList,
  'Chấm bài': ClipboardCheck,
  'Học viên': GraduationCap,
  'Học liệu': Library,
  // trưởng bộ môn
  'Bộ môn': Building2,
  'Giảng dạy': Lightbulb,
  'Báo cáo': BarChart3,
  // admin
  'Người dùng': Users,
  'Đào tạo': GraduationCap,
  'Chất lượng': ShieldCheck,
  'Nội dung': FolderKanban,
  'Vận hành': Activity,
  'Hệ thống': Server,
};
