import React from 'react';
import { LayoutDashboard, Compass, Layers, FileText, AlertTriangle, RotateCcw, BookOpen, GraduationCap, PlayCircle, Headphones, Target, TrendingUp, Bookmark, Trophy, Award, PenTool, Mic } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';

const GROUPS: NavGroup[] = [
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
];

export const StudentLayout: React.FC = () => (
  <AppShell groups={GROUPS} brandTagline="Khu vực học viên" headerLabel="Khu vực học viên" accent="indigo" settingsTo="/app/settings" profileTo="/app/profile" notificationsTo="/app/notifications" showStreak />
);
