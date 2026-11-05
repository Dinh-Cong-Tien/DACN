import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Award, ChevronDown, LayoutDashboard, LogOut, Crown, Settings, User, Users } from 'lucide-react';
import { VipBadge } from '@/shared/components/vip/VipBadge';
import { openUpgrade } from '@/shared/stores/uiStore';
import { Avatar, Badge } from '@/shared/components/ui';
import { useT } from '@/shared/i18n';
import { cn, ROLE_HOME, ROLE_LABEL } from '@/shared/utils';
import type { AppUser } from '@/shared/types';

/** Mục cá nhân (các mục học tập đã nằm trong menu chính) */
const PERSONAL = [
  { to: '/app/classes', label: 'Lớp của tôi', icon: Users },
  { to: '/app/achievements', label: 'Huy hiệu', icon: Award },
  { to: '/app/profile', label: 'Hồ sơ', icon: User },
  { to: '/app/settings', label: 'Cài đặt', icon: Settings },
];

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{children}</p>;

/**
 * Menu tài khoản trên header (một cột dọc): thông tin + gói → Cá nhân, Đăng xuất tách riêng ở cuối.
 * Luyện kỹ năng nằm trong menu TOEIC / VSTEP, học tập cá nhân trong menu Công cụ, Tổng quan ở trang chủ.
 * Giáo viên / Trưởng bộ môn / Admin: thông tin + link khu quản lý + Đăng xuất.
 */
export const UserMenu: React.FC<{ user: AppUser; onLogout: () => void; onDark?: boolean }> = ({ user, onLogout, onDark }) => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const isStudent = user.role === 'STUDENT';

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const rowCls = ({ isActive }: { isActive: boolean }) =>
    cn('flex items-center gap-3 rounded-lg px-2 py-[7px] text-sm transition-colors', isActive ? 'bg-slate-900/[0.06] font-semibold text-indigo-700' : 'text-slate-700 hover:bg-slate-900/[0.04] hover:text-slate-900');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('Tài khoản')}
        className={cn('flex items-center gap-1.5 rounded-xl py-1 pl-1 pr-2 transition', onDark ? 'hover:bg-white/10' : 'hover:bg-slate-900/5')}
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="sm" ring status="online" />
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180', onDark ? 'text-slate-300' : 'text-slate-500')} />
      </button>

      {open && (
        <div
          role="menu"
          className="theme-native absolute right-0 top-full z-50 mt-2 max-h-[calc(100vh-88px)] w-[320px] overflow-y-auto no-scrollbar rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgba(16,24,40,0.35)] animate-scale-in origin-top-right"
        >
          {/* 1. Thông tin */}
          <div className="px-4 pt-4">
            <div className="flex items-center gap-3">
              <Avatar name={user.fullName} src={user.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-slate-900">{user.fullName}</p>
                <p className="truncate text-[12px] text-slate-500">{user.email}</p>
              </div>
            </div>
            {isStudent ? (
              <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-900/[0.03] px-3 py-2.5 ring-1 ring-inset ring-slate-200">
                <span className="text-[13px] text-slate-600">
                  {t('Gói hiện tại')}: {user.plan === 'VIP' ? <VipBadge className="ml-1 align-middle" /> : <span className="font-semibold text-slate-900">Free</span>}
                </span>
                {user.plan !== 'VIP' && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openUpgrade();
                    }}
                    className="inline-flex items-center gap-1 text-[13px] font-bold text-amber-700 hover:underline underline-offset-2"
                  >
                    <Crown className="h-3.5 w-3.5" /> {t('Nâng cấp VIP')}
                  </button>
                )}
              </div>
            ) : (
              <Badge tone="indigo" size="xs" className="mt-3">
                {t(`Vai trò ${ROLE_LABEL[user.role]}`).replace(/^Vai trò /, '')}
              </Badge>
            )}
          </div>

          {isStudent ? (
            <>
              {/* 2. Cá nhân */}
              <div className="px-2 pt-4">
                <SectionLabel>{t('Cá nhân')}</SectionLabel>
                <div className="flex flex-col">
                  {PERSONAL.map((a) => (
                    <NavLink key={a.to} to={a.to} role="menuitem" className={rowCls}>
                      <a.icon className="h-4 w-4 shrink-0 text-slate-400" />
                      {t(a.label)}
                    </NavLink>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="px-2 pt-3">
              <NavLink to={ROLE_HOME[user.role]} role="menuitem" className={rowCls}>
                <LayoutDashboard className="h-4 w-4 shrink-0 text-slate-400" />
                {t(`Khu ${ROLE_LABEL[user.role].toLowerCase()}`)}
              </NavLink>
            </div>
          )}

          {/* Đăng xuất */}
          <div className="mt-3 border-t border-slate-200 p-2">
            <button type="button" role="menuitem" onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-500/10">
              <LogOut className="h-4 w-4" />
              {t('Đăng xuất')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
