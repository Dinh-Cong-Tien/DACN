import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BellOff, Check, CheckCheck, Settings2, Trash2 } from 'lucide-react';
import { api, errorMessage } from '@/shared/api/client';
import { useDeleteNotification, useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/shared/api/learner';
import type { AppNotification } from '@/shared/types';
import { cn, formatDateTime, timeAgo } from '@/shared/utils';
import { Button, ConfirmDialog, PageHeader, Skeleton } from '@/shared/components/ui';
import { NOTIFICATION_META } from '@/shared/components/layout/NotificationBell';
import { toast } from '@/shared/stores/uiStore';
import { useAuthStore } from '@/shared/stores/authStore';
import { useDocumentTitle } from '@/shared/hooks';

const PAGE = 20;
const TYPE_ORDER: AppNotification['type'][] = ['ASSIGNMENT', 'CLASS', 'REVIEW', 'ACHIEVEMENT', 'SYSTEM'];

/** Nhóm theo ngày: Hôm nay / Hôm qua / 7 ngày qua / Cũ hơn */
function dayGroup(iso: string): string {
  const d = new Date(iso);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const diff = (start.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86_400_000;
  if (diff <= 0) return 'Hôm nay';
  if (diff === 1) return 'Hôm qua';
  if (diff < 7) return '7 ngày qua';
  return 'Cũ hơn';
}

export const NotificationsPage: React.FC = () => {
  useDocumentTitle('Thông báo');
  // Thông báo của người đang đăng nhập (mọi vai trò) — bảng notifications
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isStudent = useAuthStore((s) => s.user?.role === 'STUDENT');
  const { data, isLoading } = useNotifications();
  const items: AppNotification[] = data?.items ?? [];
  const markOne = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const del = useDeleteNotification();
  const [filter, setFilter] = useState<'all' | 'unread' | AppNotification['type']>('all');
  const [limit, setLimit] = useState(PAGE);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const unread = items.filter((n) => !n.isRead).length;
  const readCount = items.length - unread;
  const types = TYPE_ORDER.filter((t) => items.some((n) => n.type === t));
  const list = items.filter((n) => (filter === 'all' ? true : filter === 'unread' ? !n.isRead : n.type === filter));
  const shown = list.slice(0, limit);
  const groups = useMemo(() => {
    const m = new Map<string, AppNotification[]>();
    for (const n of shown) {
      const g = dayGroup(n.createdAt);
      m.set(g, [...(m.get(g) ?? []), n]);
    }
    return Array.from(m.entries());
  }, [shown]);

  const markAll = () =>
    markAllRead.mutate(undefined, {
      onSuccess: () => toast.success('Đã đánh dấu tất cả là đã đọc'),
      onError: (e) => toast.error('Chưa cập nhật được', errorMessage(e)),
    });
  const open = (n: AppNotification) => {
    if (!n.isRead) markOne.mutate(n.id);
    if (n.link) navigate(n.link);
  };
  const remove = (n: AppNotification) =>
    del.mutate(n.id, {
      onError: (e) => toast.error('Chưa xoá được', errorMessage(e)),
    });
  // Xoá các thông báo đã đọc (giữ lại thông báo chưa đọc)
  const clearRead = async () => {
    setClearing(true);
    try {
      await Promise.all(items.filter((n) => n.isRead).map((n) => api.delete(`/learner/notifications/${n.id}`)));
      await qc.invalidateQueries({ queryKey: ['learner', 'notifications'] });
      toast.success('Đã xoá thông báo đã đọc');
      setConfirmClear(false);
    } catch (e) {
      toast.error('Chưa xoá được', errorMessage(e));
    } finally {
      setClearing(false);
    }
  };

  const filters: { key: typeof filter; label: string; count?: number }[] = [
    { key: 'all', label: 'Tất cả', count: items.length },
    { key: 'unread', label: 'Chưa đọc', count: unread },
    ...types.map((t) => ({ key: t, label: NOTIFICATION_META[t].label })),
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        crumbs={isStudent ? [{ label: 'Trang chủ', to: '/' }, { label: 'Thông báo' }] : undefined}
        title="Thông báo"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<CheckCheck className="h-4 w-4" />} onClick={markAll} disabled={!unread} loading={markAllRead.isPending}>
              Đánh dấu đã đọc
            </Button>
            {isStudent && (
              <Button variant="ghost" size="sm" to="/app/settings?tab=notifications" leftIcon={<Settings2 className="h-4 w-4" />} aria-label="Cài đặt thông báo">
                <span className="max-sm:hidden">Cài đặt</span>
              </Button>
            )}
          </>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Bộ lọc */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-3 sm:px-4">
          <div className="-mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">
            {filters.map((f) => {
              const on = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setFilter(f.key);
                    setLimit(PAGE);
                  }}
                  className={cn('inline-flex h-11 shrink-0 items-center gap-1.5 border-b-2 px-2.5 text-[13px] font-medium transition-colors', on ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800')}
                >
                  {f.label}
                  {f.count !== undefined && <span className={cn('rounded-full px-1.5 text-[11px] tabular-nums', on ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500')}>{f.count}</span>}
                </button>
              );
            })}
          </div>
          {readCount > 0 && (
            <button type="button" onClick={() => setConfirmClear(true)} className="hidden shrink-0 items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-rose-600 sm:inline-flex">
              <Trash2 className="h-3.5 w-3.5" /> Xoá đã đọc
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-4">
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <BellOff className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-900">{filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}</p>
            <p className="mt-1 max-w-sm text-[13px] text-slate-500">Bài tập mới, nhắc ôn tập và tin từ lớp học sẽ hiện ở đây.</p>
          </div>
        ) : (
          <>
            {groups.map(([g, rows]) => (
              <section key={g}>
                <h2 className="border-b border-slate-100 bg-slate-50 px-4 py-1.5 text-[12px] font-medium text-slate-500">{g}</h2>
                <ul className="divide-y divide-slate-100">
                  {rows.map((n) => {
                    const m = NOTIFICATION_META[n.type];
                    const Icon = m.icon;
                    return (
                      <li key={n.id} className={cn('group relative flex gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50', !n.isRead && 'bg-sky-500/[0.04]')}>
                        {!n.isRead && <span className="absolute left-0 top-0 h-full w-0.5 bg-sky-500" aria-hidden />}
                        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', m.tone)}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <button type="button" onClick={() => open(n)} className={cn('min-w-0 flex-1 text-left', !n.link && n.isRead && 'cursor-default')}>
                          <span className={cn('block text-[14px] leading-snug', n.isRead ? 'text-slate-700' : 'font-semibold text-slate-900')}>{n.title}</span>
                          {n.message && <span className="mt-0.5 block text-[13px] leading-relaxed text-slate-500">{n.message}</span>}
                          <span className="mt-1 block text-[12px] text-slate-400" title={formatDateTime(n.createdAt)}>
                            {m.label} · {timeAgo(n.createdAt)}
                          </span>
                        </button>
                        <div className="flex shrink-0 items-start gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                          {!n.isRead && (
                            <button type="button" onClick={() => markOne.mutate(n.id)} title="Đánh dấu đã đọc" aria-label="Đánh dấu đã đọc" className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200/70 hover:text-slate-800">
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button type="button" onClick={() => remove(n)} title="Xoá thông báo" aria-label="Xoá thông báo" className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-500/10 hover:text-rose-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            {list.length > limit && (
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="block w-full border-t border-slate-100 py-3 text-center text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                Xem thêm {Math.min(PAGE, list.length - limit)} thông báo
              </button>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => void clearRead()}
        loading={clearing}
        danger
        title="Xoá thông báo đã đọc?"
        message={`${readCount} thông báo đã đọc sẽ bị xoá. Thông báo chưa đọc được giữ lại.`}
        confirmText="Xoá"
      />
    </div>
  );
};
