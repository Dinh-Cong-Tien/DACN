import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, LogOut, Menu, Search, Settings, User, X, Flame, Sparkles } from 'lucide-react';
import { cn, ROLE_LABEL } from '@/shared/utils';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore, toast } from '@/shared/stores/uiStore';
import { Avatar, Badge, Dropdown, Logo, Tooltip, CommandPalette } from '@/shared/components/ui';
import { PageTransition } from '@/shared/components/motion';
import { RouteProgress, BackToTop } from '@/shared/components/layout/ScrollExtras';
import { MOCK_NOTIFICATIONS } from '@/shared/mocks';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  end?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export interface AppShellProps {
  groups: NavGroup[];
  brandTagline: string;
  theme?: 'light' | 'dark';
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose';
  headerLabel: string;
  settingsTo?: string;
  profileTo?: string;
  notificationsTo?: string;
  showStreak?: boolean;
  topExtra?: React.ReactNode;
}

// Sidebar navy; màu active theo role
const accentMap = {
  indigo: { active: 'bg-amber-300 text-slate-900', dot: 'bg-amber-300', badge: 'amber' as const, strip: 'bg-indigo-500' },
  emerald: { active: 'bg-emerald-400 text-slate-900', dot: 'bg-emerald-400', badge: 'emerald' as const, strip: 'bg-emerald-500' },
  amber: { active: 'bg-amber-300 text-slate-900', dot: 'bg-amber-300', badge: 'amber' as const, strip: 'bg-amber-400' },
  rose: { active: 'bg-violet-500 text-white', dot: 'bg-violet-500', badge: 'violet' as const, strip: 'bg-violet-500' },
};

export const AppShell: React.FC<AppShellProps> = ({ groups, brandTagline, accent = 'indigo', headerLabel, settingsTo, profileTo, notificationsTo, showStreak, topExtra }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNav = useUiStore((s) => s.setMobileNav);
  const setPalette = useUiStore((s) => s.setPalette);
  const a = accentMap[accent];
  const bottomItems = groups.flatMap((g) => g.items).slice(0, 4);
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  useEffect(() => {
    setMobileNav(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname, setMobileNav]);

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất', 'Hẹn gặp lại bạn!');
    navigate('/auth/login');
  };

  const renderNav = (isMobile = false) => (
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 no-scrollbar">
      {groups.map((g, gi) => (
        <div key={gi} className="space-y-0.5">
          {g.title && (!collapsed || isMobile) && <p className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{g.title}</p>}
          {g.items.map((item) => {
            const Icon = item.icon;
            const link = (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl text-[13px] font-semibold transition-all duration-200 relative',
                    collapsed && !isMobile ? 'justify-center px-0 h-11' : 'px-3 py-2.5',
                    isActive ? cn(a.active, 'shadow-[2px_2px_0_rgba(0,0,0,0.5)]') : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
                  )
                }
              >
                <Icon className="w-[18px] h-[18px] shrink-0 transition-transform duration-300 group-hover:scale-110" />
                {(!collapsed || isMobile) && <span className="flex-1 truncate">{item.label}</span>}
                {(!collapsed || isMobile) && item.badge && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-md bg-violet-500 text-white text-[10px] font-extrabold flex items-center justify-center">{item.badge}</span>
                )}
                {collapsed && !isMobile && item.badge && <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-violet-500" />}
              </NavLink>
            );
            return collapsed && !isMobile ? (
              <Tooltip key={item.to} content={item.label}>
                {link}
              </Tooltip>
            ) : (
              link
            );
          })}
        </div>
      ))}
    </nav>
  );

  const sidebarInner = (isMobile = false) => (
    <>
      <div className={cn('h-16 flex items-center border-b border-white/10 px-4 shrink-0', collapsed && !isMobile ? 'justify-center' : 'justify-between')}>
        {collapsed && !isMobile ? <Logo size="sm" dark to={groups[0]?.items[0]?.to ?? '/'} /> : <Logo size="sm" dark tagline={brandTagline} to={groups[0]?.items[0]?.to ?? '/'} />}
        {isMobile && (
          <button onClick={() => setMobileNav(false)} className="p-2 rounded-xl text-slate-400 hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {renderNav(isMobile)}
      {user && (!collapsed || isMobile) && (
        <div className="mx-3 mb-3 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
      )}
      <div className="p-3 border-t border-white/10 space-y-0.5 shrink-0">
        {settingsTo && (
          <NavLink to={settingsTo} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl text-[13px] font-semibold transition', collapsed && !isMobile ? 'justify-center h-10' : 'px-3 py-2', isActive ? 'text-amber-300' : 'text-slate-300 hover:bg-white/5 hover:text-white')}>
            <Settings className="w-[18px] h-[18px]" />
            {(!collapsed || isMobile) && <span>Cài đặt</span>}
          </NavLink>
        )}
        <button onClick={handleLogout} className={cn('w-full flex items-center gap-3 rounded-xl text-[13px] font-semibold transition text-violet-300 hover:bg-violet-500/15 hover:text-violet-200', collapsed && !isMobile ? 'justify-center h-10' : 'px-3 py-2')}>
          <LogOut className="w-[18px] h-[18px]" />
          {(!collapsed || isMobile) && <span>Đăng xuất</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex font-sans bg-cream text-slate-800">
      {/* Sidebar desktop */}
      <aside className={cn('hidden lg:flex flex-col shrink-0 sticky top-0 h-screen z-30 bg-slate-900 text-white transition-[width] duration-300 ease-spring', collapsed ? 'w-[76px]' : 'w-64')}>
        <div className={cn('absolute left-0 top-0 bottom-0 w-1', a.strip)} />
        {sidebarInner(false)}
        <button onClick={toggleSidebar} className="absolute -right-3 top-20 w-6 h-6 rounded-full border-2 border-slate-900 bg-amber-300 text-slate-900 flex items-center justify-center shadow-hard-sm transition hover:scale-110" aria-label="Thu gọn menu">
          <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform duration-300', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col animate-slide-in-left shadow-2xl bg-slate-900 text-white">{sidebarInner(true)}</aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b-2 border-slate-900/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 bg-cream/85 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileNav(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-900/5">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display text-sm font-bold text-slate-900 truncate">{headerLabel}</span>
            <button onClick={() => setPalette(true)} className="hidden md:flex items-center gap-2 ml-4 px-3 h-9 rounded-xl border-2 border-slate-900/10 bg-white w-64 text-slate-400 hover:border-slate-900 hover:text-slate-700 transition-all hover:shadow-hard-sm text-left">
              <Search className="w-4 h-4" />
              <span className="text-xs">Tìm trang, đề thi, khoá học...</span>
              <kbd className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50">⌘K</kbd>
            </button>
            <button onClick={() => setPalette(true)} className="md:hidden p-2 rounded-xl hover:bg-slate-900/5" aria-label="Tìm kiếm">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {topExtra}
            {showStreak && user && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-300 border-2 border-slate-900 text-slate-900 text-xs font-extrabold shadow-hard-sm">
                <Flame className="w-4 h-4 text-violet-600 fill-violet-500 animate-bounce-soft" />
                <span>{user.streak} ngày</span>
              </div>
            )}
            {user?.plan === 'FREE' && user.role === 'STUDENT' && (
              <NavLink to="/pricing" className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500 border-2 border-slate-900 text-white text-xs font-extrabold shadow-hard-sm hover:-translate-y-0.5 transition">
                <Sparkles className="w-3.5 h-3.5" />
                Nâng cấp VIP
              </NavLink>
            )}
            {notificationsTo && (
              <NavLink to={notificationsTo} className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-900/5 transition">
                <Bell className="w-5 h-5" />
                {unread > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-cream animate-pop">{unread}</span>}
              </NavLink>
            )}
            {user && (
              <Dropdown
                align="right"
                header={
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <Badge tone={a.badge} size="xs" className="mt-1.5">
                      {ROLE_LABEL[user.role]}
                    </Badge>
                  </div>
                }
                items={[
                  ...(profileTo ? [{ label: 'Hồ sơ cá nhân', icon: <User />, onClick: () => navigate(profileTo) }] : []),
                  ...(settingsTo ? [{ label: 'Cài đặt', icon: <Settings />, onClick: () => navigate(settingsTo) }] : []),
                  { divider: true, label: '' },
                  { label: 'Đăng xuất', icon: <LogOut />, danger: true, onClick: handleLogout },
                ]}
                trigger={
                  <div className="flex items-center gap-2.5 pl-2 md:border-l-2 md:border-slate-900/10">
                    <Avatar name={user.fullName} src={user.avatarUrl} size="sm" ring status="online" />
                    <div className="hidden md:block text-left leading-tight">
                      <span className="block text-xs font-bold text-slate-900">{user.fullName}</span>
                      <span className="block text-[10px] text-slate-500">{user.target ? `Mục tiêu: ${user.target.examType} ${user.target.score}` : ROLE_LABEL[user.role]}</span>
                    </div>
                  </div>
                }
              />
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 min-w-0">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        {/* Thanh điều hướng dưới cho mobile (kiểu app) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t-2 border-slate-900 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-5 h-16">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors', isActive ? 'text-amber-300' : 'text-slate-400')}>
                  {({ isActive }) => (
                    <>
                      <span className={cn('w-9 h-6 rounded-full flex items-center justify-center transition-all', isActive && 'bg-amber-300/15')}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="truncate max-w-[64px]">{item.label.split(' ').slice(0, 2).join(' ')}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
            <button onClick={() => setMobileNav(true)} className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
              <span className="w-9 h-6 rounded-full flex items-center justify-center">
                <Menu className="w-5 h-5" />
              </span>
              Thêm
            </button>
          </div>
        </nav>
      </div>
      <RouteProgress />
      <BackToTop />
      <CommandPalette />
    </div>
  );
};
