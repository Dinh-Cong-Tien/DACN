import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User, X, Flame, Sparkles } from 'lucide-react';
import { cn, ROLE_LABEL } from '@/shared/utils';
import { useScrolled } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore, toast } from '@/shared/stores/uiStore';
import { Avatar, Badge, Dropdown, Logo, CommandPalette } from '@/shared/components/ui';
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

const accentMap = {
  indigo: { active: 'bg-slate-900 text-amber-300', badge: 'indigo' as const, strip: 'bg-indigo-600' },
  emerald: { active: 'bg-slate-900 text-emerald-300', badge: 'emerald' as const, strip: 'bg-emerald-500' },
  amber: { active: 'bg-slate-900 text-amber-300', badge: 'amber' as const, strip: 'bg-amber-400' },
  rose: { active: 'bg-slate-900 text-violet-300', badge: 'violet' as const, strip: 'bg-violet-500' },
};

/**
 * Khung portal với thanh điều hướng NGANG (giống trang chủ):
 * nhóm đầu tiên hiển thị thẳng hàng, các nhóm còn lại gom thành menu thả xuống.
 */
export const AppShell: React.FC<AppShellProps> = ({ groups, brandTagline, accent = 'indigo', headerLabel, settingsTo, profileTo, notificationsTo, showStreak, topExtra }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrolled = useScrolled(8);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNav = useUiStore((s) => s.setMobileNav);
  const setPalette = useUiStore((s) => s.setPalette);
  const a = accentMap[accent];
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
  const [primary, ...rest] = groups;
  const bottomItems = groups.flatMap((g) => g.items).slice(0, 4);

  useEffect(() => {
    setMobileNav(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname, setMobileNav]);

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất', 'Hẹn gặp lại bạn!');
    navigate('/auth/login');
  };

  const isGroupActive = (g: NavGroup) => g.items.some((it) => location.pathname.startsWith(it.to));

  const topLink = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn('relative flex items-center gap-1.5 px-3 h-9 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all duration-200 shrink-0', isActive ? cn(a.active, 'shadow-hard-sm') : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900')
        }
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{item.label}</span>
        {item.badge && <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-md bg-violet-500 text-white text-[10px] font-extrabold flex items-center justify-center">{item.badge}</span>}
      </NavLink>
    );
  };

  const groupMenu = (g: NavGroup, gi: number) => {
    const active = isGroupActive(g);
    const badgeCount = g.items.filter((it) => it.badge).length;
    return (
      <div key={gi} className="relative group/menu">
        <button className={cn('flex items-center gap-1 px-3 h-9 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all duration-200 shrink-0', active ? cn(a.active, 'shadow-hard-sm') : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900')}>
          {g.title}
          {badgeCount > 0 && !active && <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/menu:rotate-180" />
        </button>
        <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-200 z-50">
          <div className="min-w-[260px] bg-white rounded-2xl border-2 border-slate-900 shadow-hard p-2 grid gap-0.5">
            {g.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition', isActive ? 'bg-amber-200 text-slate-900' : 'text-slate-700 hover:bg-slate-100')}>
                  <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge tone="violet" solid size="xs">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-cream text-slate-800">
      {/* ===== Header ngang ===== */}
      <header className={cn('sticky top-0 z-40 border-b-2 transition-all duration-300 bg-cream/90 backdrop-blur-xl', scrolled ? 'border-slate-900/10 shadow-soft' : 'border-slate-900/10')}>
        <div className={cn('h-1', a.strip)} />
        {/* Hàng 1: logo + tiện ích */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileNav(true)} className="md:hidden p-2 rounded-xl border-2 border-slate-900 bg-white shadow-hard-sm" aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>
            <Logo size="sm" tagline={brandTagline} to={primary?.items[0]?.to ?? '/'} />
            <span className="hidden lg:inline-flex ml-2 px-2.5 py-1 rounded-lg bg-slate-900/5 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">{headerLabel}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
            {topExtra}
            <button onClick={() => setPalette(true)} className="hidden lg:flex items-center gap-2 px-3 h-10 rounded-xl border-2 border-slate-900/10 bg-white w-48 text-slate-400 hover:border-slate-900 hover:text-slate-700 transition-all hover:shadow-hard-sm text-left">
              <Search className="w-4 h-4" />
              <span className="text-xs truncate">Tìm kiếm...</span>
              <kbd className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50">⌘K</kbd>
            </button>
            <button onClick={() => setPalette(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-900/5" aria-label="Tìm kiếm">
              <Search className="w-5 h-5" />
            </button>
            {showStreak && user && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-xl bg-amber-300 border-2 border-slate-900 text-slate-900 text-xs font-extrabold shadow-hard-sm">
                <Flame className="w-4 h-4 text-violet-600 fill-violet-500 animate-bounce-soft" />
                <span>{user.streak} ngày</span>
              </div>
            )}
            {user?.plan === 'FREE' && user.role === 'STUDENT' && (
              <NavLink to="/pricing" className="hidden md:inline-flex items-center gap-1.5 px-3 h-10 rounded-xl bg-violet-500 border-2 border-slate-900 text-white text-xs font-extrabold shadow-hard-sm hover:-translate-y-0.5 transition">
                <Sparkles className="w-3.5 h-3.5" />
                Nâng cấp VIP
              </NavLink>
            )}
            {notificationsTo && (
              <NavLink to={notificationsTo} className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-900/5 transition">
                <Bell className={cn('w-5 h-5', unread > 0 && 'animate-ring-bell')} />
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
                  <div className="flex items-center gap-2.5 pl-1 md:pl-2 md:border-l-2 md:border-slate-900/10">
                    <Avatar name={user.fullName} src={user.avatarUrl} size="sm" ring status="online" />
                    <div className="hidden lg:block text-left leading-tight">
                      <span className="block text-xs font-bold text-slate-900 max-w-[140px] truncate">{user.fullName}</span>
                      <span className="block text-[10px] text-slate-500">{user.target ? `Mục tiêu: ${user.target.examType} ${user.target.score}` : headerLabel}</span>
                    </div>
                    <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400" />
                  </div>
                }
              />
            )}
          </div>
        </div>

        {/* Hàng 2: dải điều hướng ngang */}
        <div className="hidden md:block border-t border-slate-900/10 bg-white/60">
          <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {primary?.items.map(topLink)}
            {rest.length > 0 && <span className="w-px h-6 bg-slate-900/10 mx-1 shrink-0" />}
            {rest.map(groupMenu)}
          </nav>
        </div>
      </header>

      {/* ===== Drawer mobile ===== */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] flex flex-col animate-slide-in-left shadow-2xl bg-white">
            <div className="h-16 flex items-center justify-between px-4 border-b-2 border-slate-900/10">
              <Logo size="sm" tagline={brandTagline} to={primary?.items[0]?.to ?? '/'} />
              <button onClick={() => setMobileNav(false)} className="p-2 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-5">
              {groups.map((g, gi) => (
                <div key={gi} className="space-y-0.5">
                  {g.title && <p className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{g.title}</p>}
                  {g.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition', isActive ? cn(a.active, 'shadow-hard-sm') : 'text-slate-700 hover:bg-slate-100')}>
                        <Icon className="w-[18px] h-[18px]" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge tone="violet" solid size="xs">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="p-3 border-t-2 border-slate-900/10 space-y-0.5">
              {user && (
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-[10px] text-slate-500">{ROLE_LABEL[user.role]}</p>
                  </div>
                </div>
              )}
              {settingsTo && (
                <NavLink to={settingsTo} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  <Settings className="w-[18px] h-[18px]" /> Cài đặt
                </NavLink>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-violet-600 hover:bg-violet-50">
                <LogOut className="w-[18px] h-[18px]" /> Đăng xuất
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ===== Nội dung ===== */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 lg:pb-10 min-w-0">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* ===== Thanh điều hướng dưới (mobile) ===== */}
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

      <RouteProgress />
      <BackToTop />
      <CommandPalette />
    </div>
  );
};
