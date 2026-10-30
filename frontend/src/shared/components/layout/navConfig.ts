import { LayoutDashboard, Compass, Layers, FileText, AlertTriangle, RotateCcw, BookOpen, GraduationCap, PlayCircle, Headphones, Target, TrendingUp, Bookmark, Trophy, Award, PenTool, Mic, Calculator, FolderOpen, Newspaper, Tag } from 'lucide-react';
import type { NavGroup } from './AppShell';

/** Menu của học viên khi đã đăng nhập (hiển thị ngay trên header chung của website) */
export const STUDENT_NAV: NavGroup[] = [
  {
    title: 'Học tập',
    items: [
      { to: '/app/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/app/learning-path', label: 'Lộ trình', icon: Compass },
      { to: '/app/courses', label: 'Khoá học', icon: PlayCircle },
      { to: '/app/practice', label: 'Luyện tập', icon: Layers },
      { to: '/app/mock-tests', label: 'Thi thử', icon: FileText },
    ],
  },
  {
    title: 'Ôn luyện',
    items: [
      { to: '/app/mistakes', label: 'Sổ tay lỗi sai', icon: AlertTriangle, badge: '5' },
      { to: '/app/review', label: 'Lịch ôn ngắt quãng', icon: RotateCcw },
      { to: '/app/drills', label: 'Luyện điểm yếu', icon: Target },
      { to: '/app/dictation', label: 'Nghe chép chính tả', icon: Headphones },
      { to: '/app/vocabulary', label: 'Từ vựng & Flashcard', icon: BookOpen },
      { to: '/app/grammar', label: 'Chủ điểm ngữ pháp', icon: GraduationCap },
      { to: '/app/writing', label: 'Luyện Viết', icon: PenTool },
      { to: '/app/speaking', label: 'Luyện Nói', icon: Mic },
    ],
  },
  {
    title: 'Thành tích',
    items: [
      { to: '/app/progress', label: 'Tiến độ & Phân tích', icon: TrendingUp },
      { to: '/app/achievements', label: 'Huy hiệu', icon: Award },
      { to: '/app/leaderboard', label: 'Bảng vinh danh', icon: Trophy },
      { to: '/app/bookmarks', label: 'Đã lưu', icon: Bookmark },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      { to: '/score-converter', label: 'Quy đổi điểm', icon: Calculator },
      { to: '/resources', label: 'Kho tài liệu mở', icon: FolderOpen },
      { to: '/blog', label: 'Kinh nghiệm thi', icon: Newspaper },
      { to: '/pricing', label: 'Bảng giá', icon: Tag },
    ],
  },
];

/** Menu công khai (khách chưa đăng nhập) */
export const PUBLIC_NAV: { to?: string; label: string; children?: { to: string; label: string }[] }[] = [
  { to: '/toeic', label: 'TOEIC' },
  { to: '/vstep', label: 'VSTEP' },
  { to: '/courses', label: 'Khoá học' },
  { to: '/mock-tests', label: 'Thi thử' },
  {
    label: 'Công cụ',
    children: [
      { to: '/score-converter', label: 'Quy đổi điểm TOEIC ↔ VSTEP ↔ CEFR' },
      { to: '/resources', label: 'Kho tài liệu mở' },
      { to: '/question-bank', label: 'Ngân hàng câu hỏi' },
      { to: '/leaderboard', label: 'Bảng vinh danh' },
    ],
  },
  { to: '/pricing', label: 'Bảng giá' },
  { to: '/blog', label: 'Kinh nghiệm' },
];
