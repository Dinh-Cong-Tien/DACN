import React, { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, ArrowRight, ChevronDown, Facebook, Youtube, Mail, MapPin, Phone, Instagram } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useScrolled } from '@/shared/hooks';
import { Logo, Button, CommandPalette } from '@/shared/components/ui';
import { PageTransition } from '@/shared/components/motion';
import { ScrollProgress, BackToTop, RouteProgress } from '@/shared/components/layout/ScrollExtras';

const NAV = [
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

export const GuestLayout: React.FC = () => {
  const scrolled = useScrolled(12);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn('px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200', isActive ? 'bg-slate-900 text-amber-300' : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900');

  return (
    <div className="min-h-screen flex flex-col bg-cream font-sans text-slate-800">
      {/* Thanh thông báo trên cùng */}
      <div className="bg-slate-900 text-white text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-center gap-2 text-center">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
          Kho đề ETS 2025 mới cập nhật · Thi thử miễn phí mỗi tuần
          <Link to="/mock-tests" className="underline underline-offset-2 text-amber-300 hover:text-amber-200 ml-1">
            Làm đề ngay →
          </Link>
        </div>
      </div>

      <header className={cn('sticky top-0 z-40 transition-all duration-300 border-b-2', scrolled ? 'bg-cream/90 backdrop-blur-xl border-slate-900/10' : 'bg-cream border-transparent')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <Logo size="md" />

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.label} className="relative group">
                  <button className="px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-900/5 hover:text-slate-900 flex items-center gap-1 transition">
                    {item.label}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                    <div className="w-72 bg-white rounded-2xl border-2 border-slate-900 shadow-hard p-2">
                      {item.children.map((c) => (
                        <Link key={c.to} to={c.to} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-amber-100 hover:text-slate-900 transition">
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink key={item.to} to={item.to!} className={linkCls}>
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Button to="/auth/login" variant="ghost" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
              Đăng nhập
            </Button>
            <Button to="/auth/register" variant="gradient" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Học thử miễn phí
            </Button>
          </div>

          <button onClick={() => setOpen((o) => !o)} className="lg:hidden p-2 rounded-xl border-2 border-slate-900 bg-white shadow-hard-sm" aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t-2 border-slate-900/10 bg-cream animate-fade-down">
            <div className="px-4 py-4 space-y-1">
              {NAV.flatMap((item) => (item.children ? item.children : [item])).map((c) => (
                <NavLink key={c.to} to={c.to!} className={({ isActive }) => cn('block px-3 py-2.5 rounded-xl text-sm font-bold', isActive ? 'bg-slate-900 text-amber-300' : 'text-slate-700 hover:bg-slate-900/5')}>
                  {c.label}
                </NavLink>
              ))}
              <div className="pt-3 flex gap-2">
                <Button to="/auth/login" variant="outline" fullWidth>
                  Đăng nhập
                </Button>
                <Button to="/auth/register" variant="gradient" fullWidth>
                  Đăng ký
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <ScrollProgress />
      <RouteProgress />
      <BackToTop />
      <CommandPalette />

      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <footer className="relative bg-slate-900 text-slate-300 overflow-hidden border-t-4 border-amber-300">
        <div aria-hidden className="absolute inset-0 bg-dots opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" dark />
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">Nền tảng luyện thi TOEIC và VSTEP theo lộ trình cá nhân: thi thử chuẩn, sổ tay lỗi sai, ôn tập ngắt quãng và lớp học với giáo viên.</p>
            <div className="flex items-center gap-2">
              {[Facebook, Youtube, Instagram, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border-2 border-white/10 flex items-center justify-center hover:bg-amber-300 hover:text-slate-900 hover:border-amber-300 transition-all hover:-translate-y-0.5">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="sticker !bg-slate-800 !text-slate-200 !border-slate-600 !shadow-none !text-[10px]">Chuẩn ETS 2024–2025</span>
              <span className="sticker tilt-2 !bg-slate-800 !text-slate-200 !border-slate-600 !shadow-none !text-[10px]">Format Bộ GD&ĐT</span>
            </div>
          </div>
          <div>
            <h4 className="font-display text-white font-bold text-sm mb-4">Chương trình</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['/toeic', 'Luyện thi TOEIC 450–990'],
                ['/vstep', 'Luyện thi VSTEP B1–C1'],
                ['/courses', 'Khoá học kỹ năng'],
                ['/mock-tests', 'Đề thi thử chuẩn format'],
              ].map(([to, l]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-amber-300 transition inline-block hover:translate-x-0.5">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-white font-bold text-sm mb-4">Tài nguyên</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['/score-converter', 'Quy đổi điểm'],
                ['/resources', 'Kho tài liệu mở'],
                ['/blog', 'Mẹo thi & Cẩm nang'],
                ['/leaderboard', 'Bảng vinh danh'],
                ['/faq', 'Câu hỏi thường gặp'],
                ['/help', 'Trung tâm trợ giúp'],
              ].map(([to, l]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-amber-300 transition inline-block hover:translate-x-0.5">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-white font-bold text-sm mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-amber-300 shrink-0" /> 54 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-300" /> 0236 555 0199
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-300" /> hello@orbilingo.vn
              </li>
            </ul>
            <div className="mt-4 flex gap-3 text-xs text-slate-400">
              <Link to="/about" className="hover:text-white">
                Giới thiệu
              </Link>
              <Link to="/contact" className="hover:text-white">
                Liên hệ
              </Link>
              <Link to="/pricing" className="hover:text-white">
                Bảng giá
              </Link>
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>© 2026 OrbiLingo · Đồ án chuyên ngành, Khoa CNTT. Bảo lưu mọi quyền.</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Hệ thống hoạt động ổn định
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
