import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Database,
  FileQuestion,
  FileText,
  BarChart3,
  Newspaper,
  Sliders,
  History,
  LogOut,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard Quản trị', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Quản lý người dùng', icon: Users },
    { to: '/admin/questions', label: 'Ngân hàng câu hỏi Studio', icon: FileQuestion },
    { to: '/admin/tests', label: 'Cấu hình đề thi (Tests)', icon: FileText },
    { to: '/admin/courses', label: 'Quản lý khóa học', icon: Database },
    { to: '/admin/analytics', label: 'Thống kê & Báo cáo', icon: BarChart3 },
    { to: '/admin/blog', label: 'Quản lý tin tức (CMS)', icon: Newspaper },
    { to: '/admin/audit-logs', label: 'Nhật ký hệ thống (Audit)', icon: History },
    { to: '/admin/settings', label: 'Cấu hình tham số', icon: Sliders },
  ];

  return (
    <div className="min-h-screen flex bg-slate-900 font-sans text-slate-100">
      {/* Dark Sidebar for Admin */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 sticky top-0 h-screen z-30">
        <div className="p-5 border-b border-slate-800 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-rose-900/40">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Admin Console
            </span>
            <p className="text-[10px] text-slate-400 font-medium">OrbiLingo System Root</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-900/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/40 transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất Quản trị</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        <header className="h-16 bg-slate-950/60 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
          <span className="text-sm font-semibold text-slate-400">System Administrator</span>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
              ROOT ACCESS
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400 font-bold text-xs">
              AD
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
