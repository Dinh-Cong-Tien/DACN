import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, LogOut, Menu, Search, Settings, User, X, Flame, Sparkles } from 'lucide-react';
import { cn, ROLE_LABEL } from '@/shared/utils';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore, toast } from '@/shared/stores/uiStore';
import { Avatar, Badge, Dropdown, Logo, Tooltip } from '@/shared/components/ui';
import { PageTransition } from '@/shared/components/motion';
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
  indigo: { active: 'bg-indigo-600 text-white shadow-md shadow-indigo-200/60', activeDark: 'bg-indigo-500 text-white shadow-md shadow-indigo-900/40', dot: 'bg-indigo-500' },
  emerald: { active: 'bg-emerald-600 text-white shadow-md shadow-emerald-200/60', activeDark: 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40', dot: 'bg-emerald-500' },
  amber: { active: 'bg-amber-500 text-amber-950 shadow-md shadow-amber-200/60', activeDark: 'bg-amber-500 text-amber-950 shadow-md shadow-amber-900/40', dot: 'bg-amber-500' },
  rose: { active: 'bg-rose-600 text-white shadow-md shadow-rose-200/60', activeDark: 'bg-rose-500 text-white shadow-md shadow-rose-900/40', dot: 'bg-rose-500' },
};

export const AppShell: React.FC<AppShellProps> = ({ groups, brandTagline, theme = 'light', accent = 'indigo', headerLabel, settingsTo, profileTo, notificationsTo, showStreak, topExtra }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNav = useUiStore((s) => s.setMobileNav);
  const dark = theme === 'dark';
  const a = accentMap[accent];
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
        <div key={gi} className="space-y-1">
          {g.title && (!collapsed || isMobile) && <p className={cn('px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider', dark ? 'text-slate-500' : 'text-slate-400')}>{g.title}</p>}
          {g.items.map((item) => {
            const Icon = item.icon;
            const link = (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-300 ease-spring relative',
                    collapsed && !isMobile ? 'justify-center px-0 h-11' : 'px-3 py-2.5',
                    isActive
                      ? dark
                        ? a.activeDark
                        : a.active
                      : dark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-0.5'
                  )
                }
              >
                <Icon className="w-[18px] h-[18px] shrink-0 transition-transform duration-300 group-hover:scale-110" />
                {(!collapsed || isMobile) && <span className="flex-1 truncate">{item.label}</span>}
                {(!collapsed || isMobile) && item.badge && (
                  <Badge tone="amber" solid size="xs">
                    {item.badge}
                  </Badge>
                )}
                {collapsed && !isMobile && item.badge && <span className={cn('absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full', a.dot)} />}
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
      <div className={cn('h-16 flex items-center border-b px-4 shrink-0', dark ? 'border-white/10' : 'border-slate-100', collapsed && !isMobile ? 'justify-center' : 'justify-between')}>
        {collapsed && !isMobile ? (
          <Logo size="sm" dark={dark} to={groups[0]?.items[0]?.to ?? '/'} />
        ) : (
          <Logo size="sm" dark={dark} tagline={brandTagline} to={groups[0]?.items[0]?.to ?? '/'} />
        )}
        {isMobile && (
          <button onClick={() => setMobileNav(false)} className={cn('p-2 rounded-xl', dark ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100')}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {renderNav(isMobile)}
      <div className={cn('p-3 border-t space-y-1 shrink-0', dark ? 'border-white/10' : 'border-slate-100')}>
        {settingsTo && (
          <NavLink
            to={settingsTo}
            className={({ isActive }) =>
              cn('flex items-center gap-3 rounded-xl text-sm transition', collapsed && !isMobile ? 'justify-center h-10' : 'px-3 py-2', isActive ? 'text-indigo-600 font-semibold' : dark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100')
            }
          >
            <Settings className="w-[18px] h-[18px]" />
            {(!collapsed || isMobile) && <span>Cài đặt</span>}
          </NavLink>
        )}
        <button
          onClick={handleLogout}
          className={cn('w-full flex items-center gap-3 rounded-xl text-sm font-medium transition', collapsed && !isMobile ? 'justify-center h-10' : 'px-3 py-2', dark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50')}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {(!collapsed || isMobile) && <span>Đăng xuất</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className={cn('min-h-screen flex font-sans', dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800')}>
      {/* Sidebar desktop */}
      <aside
        className={cn(
          'hidden lg:flex flex-col shrink-0 sticky top-0 h-screen z-30 border-r transition-[width] duration-300 ease-spring',
          dark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200',
          collapsed ? 'w-[76px]' : 'w-64'
        )}
      >
        {sidebarInner(false)}
        <button
          onClick={toggleSidebar}
          className={cn(
            'absolute -right-3 top-20 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm transition hover:scale-110',
            dark ? 'bg-slate-800 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-500'
          )}
          aria-label="Thu gọn menu"
        >
          <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform duration-300', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
          <aside className={cn('absolute left-0 top-0 bottom-0 w-72 flex flex-col animate-slide-in-left shadow-2xl', dark ? 'bg-slate-900' : 'bg-white')}>{sidebarInner(true)}</aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={cn('h-16 border-b px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl', dark ? 'bg-slate-950/70 border-white/10' : 'bg-white/80 border-slate-200')}>
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileNav(true)} className={cn('lg:hidden p-2 rounded-xl', dark ? 'hover:bg-white/10' : 'hover:bg-slate-100')}>
              <Menu className="w-5 h-5" />
            </button>
            <span className={cn('text-sm font-bold truncate', dark ? 'text-slate-300' : 'text-slate-500')}>{headerLabel}</span>
            <div className={cn('hidden md:flex items-center gap-2 ml-4 px-3 h-9 rounded-xl border w-64', dark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400')}>
              <Search className="w-4 h-4" />
              <span className="text-xs">Tìm kiếm nhanh...</span>
              <kbd className={cn('ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border', dark ? 'border-white/10' : 'border-slate-200 bg-white')}>⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {topExtra}
            {showStreak && user && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce-soft" />
                <span>{user.streak} ngày</span>
              </div>
            )}
            {user?.plan === 'FREE' && user.role === 'STUDENT' && (
              <NavLink to="/pricing" className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md shadow-indigo-200 hover:shadow-lift transition shine">
                <Sparkles className="w-3.5 h-3.5" />
                Nâng cấp VIP
              </NavLink>
            )}
            {notificationsTo && (
              <NavLink to={notificationsTo} className={cn('relative p-2 rounded-xl transition', dark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800')}>
                <Bell className="w-5 h-5" />
                {unread > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white animate-pop">{unread}</span>}
              </NavLink>
            )}
            {user && (
              <Dropdown
                align="right"
                header={
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <Badge tone={accent === 'rose' ? 'rose' : accent === 'emerald' ? 'emerald' : accent === 'amber' ? 'amber' : 'indigo'} size="xs" className="mt-1.5">
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
                  <div className={cn('flex items-center gap-2.5 pl-2 md:border-l', dark ? 'border-white/10' : 'border-slate-200')}>
                    <Avatar name={user.fullName} size="sm" ring status="online" />
                    <div className="hidden md:block text-left leading-tight">
                      <span className={cn('block text-xs font-bold', dark ? 'text-white' : 'text-slate-800')}>{user.fullName}</span>
                      <span className={cn('block text-[10px]', dark ? 'text-slate-400' : 'text-slate-400')}>{user.target ? `Mục tiêu: ${user.target.examType} ${user.target.score}` : ROLE_LABEL[user.role]}</span>
                    </div>
                  </div>
                }
              />
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 min-w-0">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};
