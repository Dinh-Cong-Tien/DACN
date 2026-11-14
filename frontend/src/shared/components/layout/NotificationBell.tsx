import { useT } from '@/shared/i18n';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCheck, ClipboardList, GraduationCap, Info, Trophy, Users, X } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/authStore';
import type { AppNotification } from '@/shared/types';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/shared/api/learner';
import { cn, timeAgo } from '@/shared/utils';

/** Biểu tượng + nhãn theo loại thông báo (dùng chung chuông, popup và trang Thông báo) */
export const NOTIFICATION_META: Record<AppNotification['type'], { icon: React.ElementType; tone: string; label: string }> = {
  ASSIGNMENT: { icon: ClipboardList, tone: 'bg-violet-500/10 text-violet-600', label: 'Bài tập' },
  CLASS: { icon: Users, tone: 'bg-sky-500/10 text-sky-600', label: 'Lớp học' },
  SYSTEM: { icon: Info, tone: 'bg-amber-500/15 text-amber-600', label: 'Hệ thống' },
  REVIEW: { icon: GraduationCap, tone: 'bg-emerald-500/10 text-emerald-600', label: 'Ôn tập' },
  ACHIEVEMENT: { icon: Trophy, tone: 'bg-rose-500/10 text-rose-600', label: 'Thành tích' },
};

const POPUP_MS = 8000;

/** Thẻ báo thông báo mới ở góc phải dưới header: tự ẩn sau 8 giây, rê chuột vào thì giữ lại */
const NewNotificationPopup: React.FC<{ n: AppNotification; onOpen: () => void; onRead: () => void; onClose: () => void }> = ({ n, onOpen, onRead, onClose }) => {
  const [hover, setHover] = useState(false);
  const t = useT();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (hover) return;
    const id = setTimeout(() => closeRef.current(), POPUP_MS);
    return () => clearTimeout(id);
  }, [hover]);
  const m = NOTIFICATION_META[n.type];
  const Icon = m.icon;
  return (
    <div
      role="status"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="theme-native pointer-events-auto w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_48px_-16px_rgba(16,24,40,0.35)] animate-slide-in-right"
    >
      <div className="flex gap-3 p-3.5">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', m.tone)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-slate-500">
            {t('Thông báo mới')} · {t(m.label)}
          </p>
          <p className="mt-0.5 text-[13px] font-semibold leading-snug text-slate-900">{n.title}</p>
          {n.message && <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-slate-500">{n.message}</p>}
          <div className="mt-2 flex items-center gap-3 text-[12px] font-semibold">
            {n.link && (
              <button type="button" onClick={onOpen} className="text-slate-900 hover:underline">
                {t('Xem chi tiết')}
              </button>
            )}
            <button type="button" onClick={onRead} className="text-slate-500 hover:text-slate-900">
              {t('Đánh dấu đã đọc')}
            </button>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t('Đóng')} className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/** Chuông thông báo dạng popup: bấm chuông mở khung thông báo ngay dưới header, không chuyển trang.
 *  Có thông báo mới trong lúc đang dùng (làm mới 60 giây/lần) → hiện thẻ báo ở góc phải. */
export const NotificationBell: React.FC<{ allTo: string; onDark?: boolean }> = ({ allTo, onDark }) => {
  const loggedIn = useAuthStore((s) => !!s.user);
  const navigate = useNavigate();
  const t = useT();
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items: AppNotification[] = loggedIn ? (data?.items ?? []) : [];
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [popups, setPopups] = useState<AppNotification[]>([]);
  const seen = useRef<Set<string> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const unread = loggedIn ? (data?.unread ?? items.filter((n) => !n.isRead).length) : 0;
  const list = tab === 'unread' ? items.filter((n) => !n.isRead) : items;

  // Lần tải đầu chỉ ghi nhận; các lần làm mới sau, thông báo chưa đọc mới xuất hiện → thẻ báo
  useEffect(() => {
    if (!data) return;
    if (!seen.current) {
      seen.current = new Set(data.items.map((n) => n.id));
      return;
    }
    const fresh = data.items.filter((n) => !seen.current!.has(n.id) && !n.isRead);
    data.items.forEach((n) => seen.current!.add(n.id));
    if (fresh.length) setPopups((p) => [...fresh, ...p].slice(0, 3));
  }, [data]);

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

  const dismiss = (id: string) => setPopups((p) => p.filter((x) => x.id !== id));
  const openItem = (n: AppNotification) => {
    if (!n.isRead) markRead.mutate(n.id);
    setOpen(false);
    dismiss(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread ? `${t('Thông báo')} (${unread})` : t('Thông báo')}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn('relative rounded-xl p-2 transition', onDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-900/5', open && (onDark ? 'bg-white/10' : 'bg-slate-900/[0.06]'))}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className={cn('absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold tabular-nums text-white ring-2', onDark ? 'ring-slate-900' : 'ring-white')}>{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="theme-native absolute right-0 top-full z-50 mt-2 w-[380px] max-w-[calc(100vw-24px)] origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgba(16,24,40,0.4)] animate-scale-in max-sm:fixed max-sm:inset-x-3 max-sm:top-16 max-sm:w-auto" role="dialog" aria-label={t('Thông báo')}>
          <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3.5">
            <div>
              <p className="text-[15px] font-semibold text-slate-900">{t('Thông báo')}</p>
              <p className="text-[12px] text-slate-500">{unread ? t('{n} thông báo chưa đọc', { n: unread }) : t('Bạn đã đọc hết thông báo')}</p>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button type="button" onClick={() => markAll.mutate()} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  <CheckCheck className="h-4 w-4" /> {t('Đọc hết')}
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label={t('Đóng')} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
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
              <button key={k} type="button" onClick={() => setTab(k)} className={cn('h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors', tab === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>
                {t(l)} <span className={cn('ml-0.5 tabular-nums', tab === k ? 'text-white/70' : 'text-slate-400')}>{c}</span>
              </button>
            ))}
          </div>
          <ul className="max-h-[60vh] overflow-y-auto border-t border-slate-100 sm:max-h-[420px]">
            {list.length === 0 && (
              <li className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-slate-500">
                <BellOff className="h-6 w-6 text-slate-300" /> {t(tab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào')}
              </li>
            )}
            {list.slice(0, 20).map((n) => {
              const m = NOTIFICATION_META[n.type];
              const Icon = m.icon;
              return (
                <li key={n.id} className="border-b border-slate-100 last:border-0">
                  <button type="button" onClick={() => openItem(n)} className={cn('flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50', !n.isRead && 'bg-slate-50/60')}>
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', m.tone)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-[13px] leading-snug', n.isRead ? 'text-slate-700' : 'font-semibold text-slate-900')}>{n.title}</span>
                      <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-slate-500">{n.message}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        {t(m.label)} · {timeAgo(n.createdAt)}
                      </span>
                    </span>
                    {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-label={t('Chưa đọc')} />}
                  </button>
                </li>
              );
            })}
          </ul>
          <Link to={allTo} onClick={() => setOpen(false)} className="block border-t border-slate-100 bg-slate-50 py-2.5 text-center text-[13px] font-semibold text-slate-700 hover:text-slate-900">
            {t('Xem tất cả thông báo')}
          </Link>
        </div>
      )}

      {popups.length > 0 &&
        createPortal(
          <div className="pointer-events-none fixed right-4 top-[76px] z-[190] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
            {popups.map((n) => (
              <NewNotificationPopup
                key={n.id}
                n={n}
                onOpen={() => openItem(n)}
                onRead={() => {
                  markRead.mutate(n.id);
                  dismiss(n.id);
                }}
                onClose={() => dismiss(n.id)}
              />
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};
