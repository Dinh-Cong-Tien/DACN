import React, { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, ArrowRight, ChevronDown, Facebook, Youtube, Mail, MapPin, Phone, Instagram, Search, Bell } from 'lucide-react';
import { cn, ROLE_HOME, ROLE_LABEL } from '@/shared/utils';
import { useScrolled } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore, toast } from '@/shared/stores/uiStore';
import { Logo, Button, CommandPalette, Badge } from '@/shared/components/ui';
import { PageTransition } from '@/shared/components/motion';
import { ScrollProgress, BackToTop, RouteProgress } from '@/shared/components/layout/ScrollExtras';
import { ChatWidget } from '@/shared/components/support';
import { PUBLIC_NAV, STUDENT_NAV, STUDENT_TOOLS, type MenuLink } from '@/shared/components/layout/navConfig';
import { ThemeToggle } from '@/shared/components/layout/ThemeToggle';
import { UserMenu } from '@/shared/components/layout/UserMenu';
import { PageBackdrop } from '@/shared/components/layout/PageBackdrop';
import { useResolvedTheme } from '@/shared/stores/themeStore';
import { MOCK_NOTIFICATIONS } from '@/shared/mocks';

interface GuestLayoutProps {
  /** Bọc nội dung trong container (dùng cho các trang học viên /app/*) */
  contained?: boolean;
}

/**
 * Layout chung của toàn website: khách và học viên dùng cùng một header.
 * - Mọi người dùng chung menu chính (TOEIC, VSTEP, Khoá học, Thi thử, Công cụ, Bảng giá, Kinh nghiệm) như Study4/Prep.
 * - Chưa đăng nhập: Đăng nhập / Học thử miễn phí.
 * - Học viên: Khoá học / Thi thử / Bảng vinh danh mở trang của học viên (appTo); tìm kiếm, chuông, avatar mở "Góc học tập"
 *   (toàn bộ mục học tập), nút "Vào học". Mobile có thêm thanh điều hướng đáy.
 * - Giáo viên / Trưởng bộ môn / Admin: avatar + nút vào trang quản lý.
 */
export const GuestLayout: React.FC<GuestLayoutProps> = ({ contained }) => {
  const scrolled = useScrolled(12);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const logout = useAuthStore((s) => s.logout);
  const setPalette = useUiStore((s) => s.setPalette);
  const isStudent = isAuth && user?.role === 'STUDENT';
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất', 'Hẹn gặp lại bạn!');
    navigate('/');
  };

  // Trang chủ: header nằm đè lên hero (trong suốt khi chưa cuộn, kính mờ khi cuộn).
  // Chế độ tối → chữ sáng + giữ bảng màu gốc; chế độ sáng → header sáng như các trang khác.
  const isDark = useResolvedTheme() === 'dark';
  const overHero = location.pathname === '/';
  const onDarkHero = overHero && isDark;
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      'shrink-0 px-2 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 inline-flex items-center gap-1',
      isActive ? (onDarkHero ? 'bg-white/10 text-amber-300' : 'bg-slate-900/[0.06] text-indigo-700') : onDarkHero ? 'text-slate-200 hover:bg-white/10 hover:text-white' : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900'
    );

  // Mục con đang mở: khớp đúng đường dẫn, link có query thì khớp cả query (tránh /courses?exam=TOEIC sáng khi ở /courses/ngu-phap)
  const isHere = (to: string) => {
    const [path, query] = to.split('?');
    return location.pathname === path && (!query || location.search === `?${query}`);
  };

  const dropdown = (label: string, img: string | undefined, items: MenuLink[], active = false, className?: string) => (
    <div key={label} className={cn('relative shrink-0 group/menu', className)}>
      <button className={cn('px-2 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition whitespace-nowrap', active ? (onDarkHero ? 'bg-white/10 text-amber-300' : 'bg-slate-900/[0.06] text-indigo-700') : onDarkHero ? 'text-slate-200 hover:bg-white/10 hover:text-white' : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900')}>
        {img && <img src={img} alt="" className="w-5 h-5 hidden min-[1440px]:block" />}
        {label}
        {items.some((i) => i.badge) && !active && <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
        <ChevronDown className="hidden xl:block w-3.5 h-3.5 transition-transform group-hover/menu:rotate-180" />
      </button>
      <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-200 z-50">
        <div className={cn('bg-white rounded-xl border border-slate-200 shadow-[0_12px_32px_-8px_rgba(16,24,40,0.18)] p-1.5', items.some((i) => i.desc) ? 'w-[340px]' : 'w-64')}>
          {items.map((c, ci) => (
            <React.Fragment key={c.to}>
            {c.group && c.group !== items[ci - 1]?.group && (
              <p className={cn('px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400', ci > 0 ? 'mt-1.5 border-t border-slate-200 pt-2.5' : 'pt-1')}>{c.group}</p>
            )}
            <NavLink to={c.to} end className={() => cn('group/item flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors', isHere(c.to) ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900')}>
              {c.img && <img src={c.img} alt="" className={cn('shrink-0 transition-transform duration-200 group-hover/item:scale-110', c.desc ? 'h-9 w-9' : 'h-7 w-7')} />}
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{c.label}</span>
                {c.desc && <span className="block truncate text-[12px] text-slate-500">{c.desc}</span>}
              </span>
              {c.badge && (
                <Badge tone="violet" solid size="xs">
                  {c.badge}
                </Badge>
              )}
            </NavLink>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  // ===== Menu desktop: menu chính cho mọi người; học viên đi theo appTo (trang của học viên) =====
  const [studentPrimary] = STUDENT_NAV;
  const hrefOf = (i: { to?: string; appTo?: string }) => (isStudent && i.appTo) || i.to!;
  const here = location.pathname + location.search;
  const mainNav = PUBLIC_NAV.map((i) => {
    const children = i.children?.filter((c) => isStudent || !c.studentOnly).map((c) => ({ ...c, to: hrefOf(c) }));
    // Học viên: Lộ trình / Sổ tay lỗi sai / Lịch ôn / Tiến độ nằm đầu menu Công cụ
    return { ...i, to: hrefOf(i), children: isStudent && i.withStudentTools && children ? [...STUDENT_TOOLS, ...children.map((c) => ({ ...c, group: i.label }))] : children };
  });
  const desktopNav = mainNav.map((item) =>
    item.children ? (
      dropdown(item.label, item.img, item.children, location.pathname === item.to || item.children.some((c) => here === c.to || (!c.to.includes('?') && location.pathname.startsWith(c.to))))
    ) : (
      <NavLink key={item.label} to={item.to} className={linkCls}>
        <img src={item.img} alt="" className="w-5 h-5 hidden min-[1440px]:block" />
        {item.label}
      </NavLink>
    )
  );

  // ===== Menu mobile (phẳng theo nhóm) =====
  const mobileGroups: { title?: string; items: MenuLink[] }[] = [
    { items: mainNav.filter((i) => !i.children).map((i) => ({ to: i.to, label: i.label, img: i.img })) },
    ...mainNav.filter((i) => i.children).map((i) => ({ title: i.label, items: i.children! })),
    // Học viên: thêm các nhóm học tập còn lại (bỏ mục đã có ở trên)
    ...(isStudent
      ? STUDENT_NAV.filter((g) => g.title !== 'Công cụ')
          .map((g) => ({ title: g.title, items: g.items.filter((it) => !mainNav.some((m) => m.to === it.to || m.children?.some((c) => c.to === it.to))) }))
          .filter((g) => g.items.length)
      : []),
  ];

  const bottomItems = isStudent ? studentPrimary.items.slice(0, 4) : [];

  return (
    <div className={cn('relative min-h-screen flex flex-col font-sans text-slate-800', contained && 'portal')}>
      {/* Nền giống trang chủ (trang chủ tự vẽ nền đêm riêng) */}
      {!overHero && <PageBackdrop />}

      <header
        className={cn(
          'top-0 z-40 transition-all duration-300 border-b',
          onDarkHero && 'keep-palette',
          overHero
            ? scrolled
              ? cn('fixed inset-x-0 backdrop-blur-xl', isDark ? 'bg-slate-950/75 border-white/10' : 'bg-cream/90 border-slate-900/10')
              : 'absolute inset-x-0 bg-transparent border-transparent'
            : scrolled
              ? 'sticky bg-cream/80 backdrop-blur-xl border-slate-900/10'
              : 'sticky bg-transparent border-transparent'
        )}
      >
        <div className="max-w-7xl min-[1440px]:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen((o) => !o)} className={cn('lg:hidden p-2 rounded-xl border-2', onDarkHero ? 'border-white/30 bg-white/10 text-white' : 'border-slate-900 bg-white')} aria-label="Menu">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Logo size="md" dark={onDarkHero} to="/" />
          </div>

          <nav className="hidden lg:flex items-center gap-0.5">{desktopNav}</nav>

          <div className="flex items-center gap-1.5 md:gap-2">
            <ThemeToggle onDark={onDarkHero} className={cn(isAuth && 'hidden sm:block')} />
            {isAuth && user ? (
              <>
                <button onClick={() => setPalette(true)} className={cn('hidden sm:inline-flex p-2 rounded-xl transition', onDarkHero ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-900/5')} aria-label="Tìm kiếm (⌘K)" title="Tìm kiếm (⌘K)">
                  <Search className="w-5 h-5" />
                </button>
                {isStudent && (
                  <NavLink to="/app/notifications" className={cn('relative p-2 rounded-xl transition', onDarkHero ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-900/5')} aria-label="Thông báo">
                    <Bell className={cn('w-5 h-5', unread > 0 && 'animate-ring-bell')} />
                    {unread > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-cream">{unread}</span>}
                  </NavLink>
                )}
                <UserMenu user={user} onLogout={handleLogout} onDark={onDarkHero} />
                {/* Cùng vị trí nút cam "Học thử miễn phí" của khách */}
                <Button to={isStudent ? '/#goc-hoc-tap' : ROLE_HOME[user.role]} variant="gradient" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} className="hidden xl:inline-flex">
                  {isStudent ? 'Vào học' : 'Trang quản lý'}
                </Button>
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Button to="/auth/login" variant="ghost" size="sm" leftIcon={<LogIn className="w-4 h-4" />} className={cn(onDarkHero && '!text-slate-200 hover:!bg-white/10 hover:!text-white')}>
                  <span className="sr-only xl:not-sr-only xl:whitespace-nowrap">Đăng nhập</span>
                </Button>
                <Button to="/try" variant="gradient" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Học thử<span className="hidden xl:inline"> miễn phí</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t-2 border-slate-900/10 bg-cream animate-fade-down max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-4">
              {mobileGroups.map((g, gi) => (
                <div key={gi} className="space-y-1">
                  {g.title && <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{g.title}</p>}
                  {g.items.map((c) => (
                    <NavLink key={c.to} to={c.to} end={c.to === '/'} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold', isActive ? 'bg-slate-900/[0.06] text-indigo-700' : 'text-slate-700 hover:bg-slate-900/5')}>
                      {c.img && <img src={c.img} alt="" className="w-6 h-6 shrink-0" />}
                      <span className="flex-1">{c.label}</span>
                      {c.badge && (
                        <Badge tone="violet" solid size="xs">
                          {c.badge}
                        </Badge>
                      )}
                    </NavLink>
                  ))}
                </div>
              ))}
              {isAuth && (
                <div className="flex items-center justify-between border-t border-slate-900/10 px-3 pt-3 sm:hidden">
                  <button type="button" onClick={() => setPalette(true)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Search className="w-4 h-4" /> Tìm kiếm
                  </button>
                  <ThemeToggle />
                </div>
              )}
              {!isAuth && (
                <div className="pt-3 flex gap-2">
                  <Button to="/auth/login" variant="outline" fullWidth>
                    Đăng nhập
                  </Button>
                  <Button to="/try" variant="gradient" fullWidth>
                    Học thử miễn phí
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <ScrollProgress />
      <RouteProgress />
      {/* học viên có thanh điều hướng đáy dưới lg → đẩy 2 nút nổi lên trên */}
      <BackToTop className={isStudent ? 'bottom-[10.25rem] lg:bottom-[5.75rem]' : undefined} />
      <ChatWidget raised={isStudent ? 'lg' : undefined} preferChat={isStudent} />
      <CommandPalette />

      <main className={cn('flex-1', contained && 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-24 lg:pb-12')}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Thanh điều hướng dưới cho học viên trên mobile */}
      {isStudent && bottomItems.length > 0 && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-5 h-16">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors', isActive ? 'text-amber-300' : 'text-slate-400')}>
                  <Icon className="w-5 h-5" />
                  <span className="truncate max-w-[64px]">{item.label}</span>
                </NavLink>
              );
            })}
            <button onClick={() => setOpen(true)} className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
              <Menu className="w-5 h-5" />
              Thêm
            </button>
          </div>
        </nav>
      )}

      <footer className="relative text-slate-300 overflow-hidden bg-slate-950 border-t border-white/10">
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
