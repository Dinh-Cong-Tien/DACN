import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, RotateCcw, ClipboardList, Award, Settings2, Users, Trash2 } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '@/shared/mocks';
import type { AppNotification } from '@/shared/types';
import { cn, timeAgo } from '@/shared/utils';
import { Badge, Button, Card, EmptyState, PageHeader, Tabs } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';

const META: Record<AppNotification['type'], { icon: React.ElementType; cls: string; label: string }> = {
  REVIEW: { icon: RotateCcw, cls: 'bg-indigo-50 text-indigo-600', label: 'Ôn tập' },
  ASSIGNMENT: { icon: ClipboardList, cls: 'bg-emerald-50 text-emerald-600', label: 'Bài tập' },
  ACHIEVEMENT: { icon: Award, cls: 'bg-amber-50 text-amber-600', label: 'Thành tích' },
  SYSTEM: { icon: Settings2, cls: 'bg-slate-100 text-slate-600', label: 'Hệ thống' },
  CLASS: { icon: Users, cls: 'bg-sky-50 text-sky-600', label: 'Lớp học' },
};

export const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);
  const [tab, setTab] = useState('all');
  const list = items.filter((n) => (tab === 'all' ? true : tab === 'unread' ? !n.isRead : n.type === tab));
  const unread = items.filter((n) => !n.isRead).length;

  const markAll = () => {
    setItems((s) => s.map((n) => ({ ...n, isRead: true })));
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Thông báo"
        icon={<Bell />}
        description={unread ? `Bạn có ${unread} thông báo chưa đọc.` : 'Bạn đã xem hết thông báo.'}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<CheckCheck className="w-4 h-4" />} onClick={markAll} disabled={!unread}>
              Đọc tất cả
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setItems([])}>
              Xoá hết
            </Button>
          </>
        }
      />
      <Tabs
        variant="pill"
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'all', label: 'Tất cả', count: items.length },
          { key: 'unread', label: 'Chưa đọc', count: unread },
          { key: 'REVIEW', label: 'Ôn tập' },
          { key: 'ASSIGNMENT', label: 'Bài tập' },
          { key: 'SYSTEM', label: 'Hệ thống' },
        ]}
      />
      {list.length === 0 ? (
        <Card>
          <EmptyState icon={<Bell />} title="Không có thông báo" description="Khi có cập nhật mới, chúng sẽ xuất hiện tại đây." />
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((n, i) => {
            const m = META[n.type];
            const Icon = m.icon;
            const inner = (
              <div className={cn('flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 animate-fade-up hover:-translate-y-0.5 hover:shadow-soft', n.isRead ? 'bg-white border-slate-200' : 'bg-indigo-50/40 border-indigo-200')} style={{ animationDelay: `${i * 50}ms` }}>
                <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', m.cls)}>
                  <Icon className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn('text-sm', n.isRead ? 'font-semibold text-slate-700' : 'font-bold text-slate-900')}>{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />}
                    <Badge tone="slate" size="xs">
                      {m.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} onClick={() => setItems((s) => s.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))} className="block">
                {inner}
              </Link>
            ) : (
              <div key={n.id} onClick={() => setItems((s) => s.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))} className="cursor-pointer">
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
