import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Award, Bookmark, ChevronDown, LayoutDashboard, LogOut, Settings, User } from 'lucide-react';
import { Avatar, Badge } from '@/shared/components/ui';
import { cn, ROLE_HOME, ROLE_LABEL } from '@/shared/utils';
import type { AppUser } from '@/shared/types';
import { STUDENT_NAV, type MenuLink } from './navConfig';

const ALL = STUDENT_NAV.flatMap((g) => g.items);
const pick = (to: string, label?: string): MenuLink => {
  const it = ALL.find((i) => i.to === to);
  if (!it) throw new Error(`UserMenu: thiếu mục ${to} trong STUDENT_NAV`);
  return { ...it, label: label ?? it.label };
};

/** Học tập: đi theo trình tự học (xem tổng quan → lộ trình → ôn câu sai → ôn đến hạn → xem tiến bộ) */
const STUDY = [pick('/app/dashboard'), pick('/app/learning-path', 'Lộ trình học'), pick('/app/mistakes'), pick('/app/review'), pick('/app/progress')];
/** Luyện kỹ năng: lưới 3×2, nhãn ngắn */
const SKILLS = [
  pick('/app/vocabulary', 'Từ vựng'),
  pick('/app/grammar', 'Ngữ pháp'),
  pick('/app/dictation', 'Nghe chép'),
  pick('/app/drills', 'Điểm yếu'),
  pick('/app/writing', 'Viết'),
  pick('/app/speaking', 'Nói'),
];
/** Khoá học / Thi thử / Bảng vinh danh đã có trên menu chính nên không lặp lại ở đây */
const PERSONAL = [
  { to: '/app/achievements', label: 'Huy hiệu', icon: Award },
  { to: '/app/bookmarks', label: 'Đã lưu', icon: Bookmark },
  { to: '/app/profile', label: 'Hồ sơ', icon: User },
  { to: '/app/settings', label: 'Cài đặt', icon: Settings },
];

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{children}</p>;

/**
 * Menu tài khoản trên header (một cột, 4 khối):
 * thông tin + chỉ số → Học tập → Luyện kỹ năng → Cá nhân, Đăng xuất tách riêng ở cuối.
 * Giáo viên / Trưởng bộ môn / Admin: thông tin + link khu quản lý + Đăng xuất.
 */
export const UserMenu: React.FC<{ user: AppUser; onLogout: () => void; onDark?: boolean }> = ({ user, onLogout, onDark }) => {
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
        aria-label="Tài khoản"
        className={cn('flex items-center gap-1.5 rounded-xl py-1 pl-1 pr-2 transition', onDark ? 'hover:bg-white/10' : 'hover:bg-slate-900/5')}
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="sm" ring status="online" />
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180', onDark ? 'text-slate-300' : 'text-slate-500')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100vh-88px)] w-[320px] overflow-y-auto no-scrollbar rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgba(16,24,40,0.35)] animate-scale-in origin-top-right"
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
              <dl className="mt-3.5 grid grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-900/[0.03] py-2.5 text-center ring-1 ring-inset ring-slate-200">
                <div>
                  <dt className="text-[11px] text-slate-500">Chuỗi học</dt>
                  <dd className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{user.streak} ngày</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">Mục tiêu</dt>
                  <dd className="mt-0.5 text-sm font-bold text-slate-900">{user.target ? `${user.target.examType} ${user.target.score}` : '—'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">{user.plan === 'FREE' ? 'Gói Free' : 'Gói'}</dt>
                  <dd className="mt-0.5 text-sm font-bold">
                    {user.plan === 'FREE' ? (
                      <Link to="/pricing" className="text-violet-600 hover:underline underline-offset-2">
                        Nâng cấp
                      </Link>
                    ) : (
                      <span className="text-slate-900">{user.plan}</span>
                    )}
                  </dd>
                </div>
              </dl>
            ) : (
              <Badge tone="indigo" size="xs" className="mt-3">
                {ROLE_LABEL[user.role]}
              </Badge>
            )}
          </div>

          {isStudent ? (
            <>
              {/* 2. Học tập */}
              <div className="px-2 pt-4">
                <SectionLabel>Học tập</SectionLabel>
                {STUDY.map((it) => (
                  <NavLink key={it.to} to={it.to} role="menuitem" className={rowCls}>
                    {it.img && <img src={it.img} alt="" className="h-6 w-6 shrink-0" />}
                    <span className="flex-1">{it.label}</span>
                    {it.badge && (
                      <Badge tone="violet" solid size="xs">
                        {it.badge}
                      </Badge>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* 3. Luyện kỹ năng */}
              <div className="px-2 pt-3">
                <SectionLabel>Luyện kỹ năng</SectionLabel>
                <div className="grid grid-cols-3 gap-1.5 px-1">
                  {SKILLS.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      role="menuitem"
                      className={({ isActive }) => cn('group/skill flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-[12px] font-medium ring-1 ring-inset transition-colors', isActive ? 'bg-slate-900/[0.06] text-indigo-700 ring-indigo-600/30' : 'text-slate-700 ring-slate-200 hover:bg-slate-900/[0.04] hover:ring-slate-300')}
                    >
                      {it.img && <img src={it.img} alt="" className="h-7 w-7 transition-transform duration-200 group-hover/skill:scale-110" />}
                      {it.label}
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* 4. Cá nhân */}
              <div className="px-2 pt-3">
                <SectionLabel>Cá nhân</SectionLabel>
                <div className="grid grid-cols-2 gap-x-1">
                  {PERSONAL.map((a) => (
                    <NavLink key={a.to} to={a.to} role="menuitem" className={rowCls}>
                      <a.icon className="h-4 w-4 shrink-0 text-slate-400" />
                      {a.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="px-2 pt-3">
              <NavLink to={ROLE_HOME[user.role]} role="menuitem" className={rowCls}>
                <LayoutDashboard className="h-4 w-4 shrink-0 text-slate-400" />
                Khu {ROLE_LABEL[user.role].toLowerCase()}
              </NavLink>
            </div>
          )}

          {/* Đăng xuất */}
          <div className="mt-3 border-t border-slate-200 p-2">
            <button type="button" role="menuitem" onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-500/10">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
