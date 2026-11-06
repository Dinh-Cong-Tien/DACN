import React, { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Search, Settings, User, X, Flame, Crown } from 'lucide-react';
import { cn, ROLE_LABEL } from '@/shared/utils';
import { useScrolled } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore, toast, openUpgrade } from '@/shared/stores/uiStore';
import { Avatar, Badge, Dropdown, Logo } from '@/shared/components/ui';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useT } from '@/shared/i18n';
import { NotificationBell } from './NotificationBell';
import type { AppShellProps, NavGroup } from './AppShell';

const accentBadge = { indigo: 'indigo', emerald: 'emerald', amber: 'amber', rose: 'violet' } as const;

/**
 * Header khu quản lý (giáo viên, trưởng bộ môn, admin): logo · menu của vai trò · tìm kiếm, thông báo, tài khoản.
 * Dưới md: ngăn kéo menu + thanh điều hướng đáy.
 */
export const StaffHeader: React.FC<Omit<AppShellProps, 'theme'>> = ({ groups, brandTagline, accent = 'indigo', headerLabel, settingsTo, profileTo, notificationsTo, showStreak, topExtra, workspace, headerNav, accountLinks, wideNav }) => {
  const navigate = useNavigate();
  const t = useT();
  const location = useLocation();
  const scrolled = useScrolled(12);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNav = useUiStore((s) => s.setMobileNav);
  const setPalette = useUiStore((s) => s.setPalette);
  const [primary, ...rest] = groups;
  const bottomItems = groups.flatMap((g) => g.items).slice(0, 4);
  const home = primary?.items[0]?.to ?? '/';

  useEffect(() => {
    setMobileNav(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname, setMobileNav]);

  const handleLogout = () => {
    logout();
    toast.info(t('Đã đăng xuất'), t('Hẹn gặp lại bạn!'));
    navigate('/auth/login');
  };

  // Link menu giống trang chủ: chữ đậm, active = pill tối
  const linkCls = ({ isActive }: { isActive: boolean }) => cn('px-3 py-2 text-sm whitespace-nowrap shrink-0 transition-all duration-200 inline-flex items-center gap-1.5', workspace ? 'rounded-md font-medium' : 'rounded-xl font-bold', isActive ? 'bg-slate-900/[0.06] text-indigo-700' : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900');

  const isGroupActive = (g: NavGroup) => g.items.some((it) => location.pathname.startsWith(it.to));

  return (
    <>
      {/* ===== Header một hàng (giống GuestLayout) ===== */}
      <header className={cn('sticky top-0 z-40 transition-all duration-300', workspace ? cn('border-b', scrolled ? 'bg-cream/85 backdrop-blur-xl border-slate-900/10' : 'bg-transparent border-transparent') : cn('border-b-2', scrolled ? 'bg-cream/80 backdrop-blur-xl border-slate-900/10' : 'bg-transparent border-transparent'))}>
        <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4', workspace ? 'h-16' : 'h-[72px]')}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className={cn(wideNav ? 'xl:hidden' : 'md:hidden', 'p-2 rounded-xl border-2 border-slate-900 bg-white')} aria-label={t('Menu')}>
              <Menu className="w-5 h-5" />
            </button>
            <Logo size="md" to={home} />
          </div>

          {headerNav ?? (
          <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {primary?.items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkCls}>
                {t(item.label)}
                {item.badge && <span className="min-w-[18px] h-[18px] px-1 rounded-md bg-violet-500 text-white text-[10px] font-extrabold flex items-center justify-center">{item.badge}</span>}
              </NavLink>
            ))}
            {rest.map((g, gi) => {
              const active = isGroupActive(g);
              const hasBadge = g.items.some((it) => it.badge);
              return (
                <div key={gi} className="relative group/menu">
                  <button className={cn('px-3 py-2 text-sm flex items-center gap-1 transition whitespace-nowrap shrink-0', workspace ? 'rounded-md font-medium' : 'rounded-xl font-bold', active ? 'bg-slate-900/[0.06] text-indigo-700' : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900')}>
                    {t(g.title ?? '')}
                    {hasBadge && !active && <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/menu:rotate-180" />
                  </button>
                  <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-200 z-50">
                    <div className={cn('w-72 bg-white p-2', workspace ? 'rounded-lg border border-slate-200 shadow-[0_10px_28px_-10px_rgba(16,24,40,0.2)]' : 'rounded-2xl border-2 border-slate-900 shadow-hard')}>
                      {g.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition', workspace ? (isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900') : isActive ? 'bg-amber-100 text-slate-900' : 'text-slate-700 hover:bg-amber-100 hover:text-slate-900')}>
                            <Icon className="w-4 h-4 text-slate-500" />
                            <span className="flex-1">{t(item.label)}</span>
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
            })}
          </nav>
          )}

          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            {topExtra}
            {showStreak && user && (
              <div className="hidden xl:inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-amber-300 text-slate-900 text-xs font-extrabold">
                <Flame className="w-4 h-4 text-violet-600 fill-violet-500 animate-bounce-soft" />
                {user.streak} {t('ngày')}
              </div>
            )}
            {workspace ? (
              <span className="flex items-center max-[400px]:hidden">
                <LanguageSwitcher />
                <ThemeToggle />
              </span>
            ) : (
              <span className="flex items-center">
                <LanguageSwitcher />
                <ThemeToggle />
              </span>
            )}
            <button onClick={() => setPalette(true)} className="p-2 rounded-xl text-slate-700 hover:bg-slate-900/5 transition" aria-label={t('Tìm kiếm (⌘K)')} title={t('Tìm kiếm (⌘K)')}>
              <Search className="w-5 h-5" />
            </button>
            {notificationsTo && <NotificationBell allTo={notificationsTo} />}
            {user && (
              <Dropdown
                align="right"
                header={
                  <div className="flex items-center gap-3">
                    <Avatar name={user.fullName} src={user.avatarUrl} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <Badge tone={accentBadge[accent]} size="xs" className="mt-1">
                        {t(`Vai trò ${ROLE_LABEL[user.role]}`).replace(/^Vai trò /, '')}
                      </Badge>
                    </div>
                  </div>
                }
                items={[
                  ...(accountLinks ?? []).map((a) => ({ label: t(a.label), icon: <a.icon />, onClick: () => navigate(a.to) })),
                  ...(profileTo ? [{ label: t('Hồ sơ cá nhân'), icon: <User />, onClick: () => navigate(profileTo) }] : []),
                  ...(settingsTo ? [{ label: t('Cài đặt'), icon: <Settings />, onClick: () => navigate(settingsTo) }] : []),
                  ...(user.plan === 'FREE' && user.role === 'STUDENT' ? [{ label: t('Nâng cấp VIP'), icon: <Crown />, onClick: () => openUpgrade() }] : []),
                  { divider: true, label: '' },
                  { label: t('Đăng xuất'), icon: <LogOut />, danger: true, onClick: handleLogout },
                ]}
                trigger={
                  <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-900/5 transition" aria-label={t('Tài khoản')}>
                    <Avatar name={user.fullName} src={user.avatarUrl} size="sm" ring status="online" />
                    <ChevronDown className={cn('w-3.5 h-3.5 text-slate-500', workspace && 'max-sm:hidden')} />
                  </button>
                }
              />
            )}
          </div>
        </div>
      </header>

      {/* ===== Drawer (dưới lg) ===== */}
      {mobileOpen && (
        <div className={cn(wideNav ? 'xl:hidden' : 'md:hidden', 'fixed inset-0 z-50 animate-fade-in')}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] flex flex-col animate-slide-in-left shadow-2xl bg-white">
            <div className="h-[72px] flex items-center justify-between px-4 border-b-2 border-slate-900/10">
              <Logo size="sm" tagline={t(brandTagline)} to={home} />
              <button onClick={() => setMobileNav(false)} className="p-2 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-5">
              {groups.map((g, gi) => (
                <div key={gi} className="space-y-0.5">
                  {g.title && <p className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{t(g.title)}</p>}
                  {g.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition', isActive ? 'bg-slate-900/[0.06] text-indigo-700' : 'text-slate-700 hover:bg-slate-100')}>
                        <Icon className="w-[18px] h-[18px]" />
                        <span className="flex-1">{t(item.label)}</span>
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
                    <p className="text-[10px] text-slate-500">{t(headerLabel)}</p>
                  </div>
                </div>
              )}
              {/* Màn hình hẹp: header ẩn nút ngôn ngữ / chế độ màu → đặt trong ngăn kéo */}
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-xs font-semibold text-slate-500">{t('Ngôn ngữ')} · {t('Chế độ màu')}</span>
                <span className="flex items-center">
                  <LanguageSwitcher placement="up" />
                  <ThemeToggle placement="up" />
                </span>
              </div>
              {settingsTo && (
                <NavLink to={settingsTo} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  <Settings className="w-[18px] h-[18px]" /> {t('Cài đặt')}
                </NavLink>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-violet-600 hover:bg-violet-50">
                <LogOut className="w-[18px] h-[18px]" /> {t('Đăng xuất')}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ===== Thanh điều hướng dưới (mobile) ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 px-2 pb-[env(safe-area-inset-bottom)]">
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
                    <span className="truncate max-w-[64px]">{t(item.label).split(' ').slice(0, 2).join(' ')}</span>
                  </>
                )}
              </NavLink>
            );
          })}
          <button onClick={() => setMobileNav(true)} className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
            <span className="w-9 h-6 rounded-full flex items-center justify-center">
              <Menu className="w-5 h-5" />
            </span>
            {t('Thêm')}
          </button>
        </div>
      </nav>
    </>
  );
};
