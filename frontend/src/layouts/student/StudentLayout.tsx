import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  FileText,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Bookmark,
  Trophy,
  Award,
  Bell,
  Flame,
  User,
  Settings,
  LogOut,
  Layers,
} from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/learning-path', label: 'Lộ trình học', icon: Compass },
    { to: '/app/practice', label: 'Luyện tập kỹ năng', icon: Layers },
    { to: '/app/mock-tests', label: 'Thi thử TOEIC/VSTEP', icon: FileText },
    { to: '/app/mistakes', label: 'Sổ tay lỗi sai', icon: AlertTriangle, badge: 'AI' },
    { to: '/app/review', label: 'Lịch ôn ngắt quãng', icon: RotateCcw },
    { to: '/app/vocabulary', label: 'Kho từ vựng & Flashcard', icon: BookOpen },
    { to: '/app/grammar', label: 'Chủ điểm ngữ pháp', icon: GraduationCap },
    { to: '/app/courses', label: 'Khóa học của tôi', icon: BookOpen },
    { to: '/app/progress', label: 'Tiến độ & Phân tích', icon: TrendingUp },
    { to: '/app/bookmarks', label: 'Nội dung đã lưu', icon: Bookmark },
    { to: '/app/leaderboard', label: 'Bảng xếp hạng', icon: Trophy },
    { to: '/app/achievements', label: 'Huy hiệu thành tích', icon: Award },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/app/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                OrbiLingo
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Học thông minh • Đúng mục tiêu</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-amber-950">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Quick Profile & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition ${
                isActive ? 'text-indigo-600 font-medium' : ''
              }`
            }
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Cài đặt</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main App Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">Khu vực học viên</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shadow-sm">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span>5 Ngày Streak</span>
            </div>

            {/* Notification Bell */}
            <NavLink
              to="/app/notifications"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </NavLink>

            {/* User Profile */}
            <Link to="/app/profile" className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 font-bold text-xs">
                HV
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-800">Học viên Orbi</span>
                <span className="block text-[10px] text-slate-400">Mục tiêu: TOEIC 750</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
