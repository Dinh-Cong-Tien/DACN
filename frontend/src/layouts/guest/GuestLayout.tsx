import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { BookOpen, Award, CheckCircle2, User, LogIn } from 'lucide-react';

export const GuestLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                OrbiLingo
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                TOEIC • VSTEP
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <NavLink
              to="/toeic"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'}`
              }
            >
              Luyện TOEIC
            </NavLink>
            <NavLink
              to="/vstep"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'}`
              }
            >
              Luyện VSTEP
            </NavLink>
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'}`
              }
            >
              Khóa học
            </NavLink>
            <NavLink
              to="/practice"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'}`
              }
            >
              Luyện tập
            </NavLink>
            <NavLink
              to="/mock-tests"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'}`
              }
            >
              Thi thử
            </NavLink>
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'}`
              }
            >
              Bảng giá
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'}`
              }
            >
              Kinh nghiệm
            </NavLink>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 transition flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </Link>
            <Link
              to="/auth/register"
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              Bắt đầu học
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>OrbiLingo</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Nền tảng luyện thi tiếng Anh TOEIC–VSTEP thích ứng theo năng lực, tích hợp phân tích lỗi và lộ trình cá nhân hóa.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Chương trình</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/toeic" className="hover:text-white transition">Luyện thi TOEIC 450–990</Link></li>
              <li><Link to="/vstep" className="hover:text-white transition">Luyện thi VSTEP B1–B2–C1</Link></li>
              <li><Link to="/courses" className="hover:text-white transition">Khoá học kỹ năng</Link></li>
              <li><Link to="/mock-tests" className="hover:text-white transition">Đề thi thử chuẩn format</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Tài nguyên</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/blog" className="hover:text-white transition">Mẹo thi & Cẩm nang</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white transition">Bảng vàng xếp hạng</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">Câu hỏi thường gặp</Link></li>
              <li><Link to="/help" className="hover:text-white transition">Trung tâm trợ giúp</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition">Giới thiệu OrbiLingo</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Liên hệ & Hỗ trợ</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition">Bảng giá gói thành viên</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2026 OrbiLingo Platform. Đồ án chuyên ngành / Đồ án tốt nghiệp. Bảo lưu mọi quyền.
        </div>
      </footer>
    </div>
  );
};
