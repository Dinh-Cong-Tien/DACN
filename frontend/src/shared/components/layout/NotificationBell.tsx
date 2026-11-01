import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCheck, ClipboardList, GraduationCap, Info, Trophy, Users, X } from 'lucide-react';
import { ADMIN_NOTIFICATIONS, HEAD_NOTIFICATIONS, MOCK_NOTIFICATIONS, TEACHER_NOTIFICATIONS } from '@/shared/mocks';
import { useAuthStore } from '@/shared/stores/authStore';
import type { AppNotification, AppRole } from '@/shared/types';
import { cn, timeAgo } from '@/shared/utils';

/** Danh sách thông báo theo vai trò */
export const notificationsFor = (role?: AppRole): AppNotification[] => (role === 'TEACHER' ? TEACHER_NOTIFICATIONS : role === 'HEAD_TEACHER' ? HEAD_NOTIFICATIONS : role === 'ADMIN' ? ADMIN_NOTIFICATIONS : MOCK_NOTIFICATIONS);

const TYPE_ICON: Record<AppNotification['type'], [React.ElementType, string]> = {
  ASSIGNMENT: [ClipboardList, 'bg-violet-500/10 text-violet-600'],
  CLASS: [Users, 'bg-sky-500/10 text-sky-600'],
  SYSTEM: [Info, 'bg-amber-500/15 text-amber-600'],
  REVIEW: [GraduationCap, 'bg-emerald-500/10 text-emerald-600'],
  ACHIEVEMENT: [Trophy, 'bg-rose-500/10 text-rose-600'],
};

/** Chuông thông báo dạng popup: bấm chuông mở khung thông báo ngay dưới header, không chuyển trang */
export const NotificationBell: React.FC<{ allTo: string }> = ({ allTo }) => {
  const role = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>(() => notificationsFor(role));
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.isRead).length;
  const list = tab === 'unread' ? items.filter((n) => !n.isRead) : items;

  useEffect(() => setItems(notificationsFor(role)), [role]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openItem = (n: AppNotification) => {
    setItems((all) => all.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Thông báo" aria-expanded={open} className={cn('relative rounded-xl p-2 text-slate-700 transition hover:bg-slate-900/5', open && 'bg-slate-900/[0.06]')}>
        <Bell className={cn('h-5 w-5', unread > 0 && !open && 'animate-ring-bell')} />
        {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white">{unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[380px] max-w-[calc(100vw-24px)] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgba(16,24,40,0.4)] animate-scale-in max-sm:fixed max-sm:inset-x-3 max-sm:top-16 max-sm:w-auto" role="dialog" aria-label="Thông báo">
          <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3.5">
            <div>
              <p className="font-display text-[16px] font-bold text-slate-900">Thông báo</p>
              <p className="text-[12px] text-slate-500">{unread ? `${unread} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo'}</p>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button type="button" onClick={() => setItems((all) => all.map((x) => ({ ...x, isRead: true })))} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[12px] font-semibold text-indigo-600 hover:bg-indigo-500/10">
                  <CheckCheck className="h-4 w-4" /> Đọc hết
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-1 px-4 pb-2">
            {(
              [
                ['all', 'Tất cả', items.length],
                ['unread', 'Chưa đọc', unread],
              ] as const
            ).map(([k, l, c]) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={cn('h-8 rounded-lg px-3 text-[13px] font-semibold transition-colors', tab === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>
                {l} <span className={cn('ml-0.5 tabular-nums', tab === k ? 'text-white/70' : 'text-slate-400')}>{c}</span>
              </button>
            ))}
          </div>
          <ul className="max-h-[60vh] overflow-y-auto border-t border-slate-100 sm:max-h-[420px]">
            {list.length === 0 && (
              <li className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-slate-500">
                <BellOff className="h-6 w-6 text-slate-300" /> Không có thông báo chưa đọc
              </li>
            )}
            {list.map((n) => {
              const [Icon, tone] = TYPE_ICON[n.type];
              return (
                <li key={n.id}>
                  <button type="button" onClick={() => openItem(n)} className={cn('flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50', !n.isRead && 'bg-indigo-500/[0.04]')}>
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', tone)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-[13px] leading-snug', n.isRead ? 'text-slate-700' : 'font-semibold text-slate-900')}>{n.title}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">{n.message}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                    </span>
                    {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-label="Chưa đọc" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <Link to={allTo} onClick={() => setOpen(false)} className="block border-t border-slate-100 bg-slate-50/70 py-2.5 text-center text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
};
