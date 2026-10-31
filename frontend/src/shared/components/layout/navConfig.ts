import { LayoutDashboard, Compass, Layers, FileText, AlertTriangle, RotateCcw, BookOpen, GraduationCap, PlayCircle, Headphones, Target, TrendingUp, Bookmark, Trophy, Award, PenTool, Mic, Calculator, FolderOpen, Newspaper, Tag, Briefcase, Wrench, Database } from 'lucide-react';
import type React from 'react';
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

/** Mục con trong dropdown header: có icon + mô tả ngắn một dòng */
export interface MenuLink {
  to: string;
  label: string;
  icon?: React.ElementType;
  desc?: string;
  badge?: string;
}

export interface PublicNavItem {
  to?: string;
  label: string;
  icon: React.ElementType;
  children?: MenuLink[];
}

/** Menu công khai (khách chưa đăng nhập) */
export const PUBLIC_NAV: PublicNavItem[] = [
  { to: '/toeic', label: 'TOEIC', icon: Briefcase },
  { to: '/vstep', label: 'VSTEP', icon: GraduationCap },
  { to: '/courses', label: 'Khoá học', icon: PlayCircle },
  { to: '/mock-tests', label: 'Thi thử', icon: FileText },
  {
    label: 'Công cụ',
    icon: Wrench,
    children: [
      { to: '/score-converter', label: 'Quy đổi điểm', icon: Calculator, desc: 'TOEIC ↔ VSTEP ↔ CEFR theo bảng ETS' },
      { to: '/resources', label: 'Kho tài liệu mở', icon: FolderOpen, desc: 'Ngữ pháp, từ vựng, bài mẫu Writing' },
      { to: '/question-bank', label: 'Ngân hàng câu hỏi', icon: Database, desc: '12.614 câu theo từng Part, có giải thích' },
      { to: '/leaderboard', label: 'Bảng vinh danh', icon: Trophy, desc: 'Học viên chuyên cần nhất tuần này' },
    ],
  },
  { to: '/pricing', label: 'Bảng giá', icon: Tag },
  { to: '/blog', label: 'Kinh nghiệm', icon: Newspaper },
];
