import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, FileQuestion, Server, ArrowRight, ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { MOCK_USERS, MOCK_SERVICES, MOCK_AUDIT_LOGS, ADMIN_TRAFFIC, ADMIN_SIGNUPS } from '@/shared/mocks';
import type { AppRole } from '@/shared/types';
import { cn, formatDate, timeAgo, ROLE_LABEL } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Avatar, Badge, Button, Card, CardHeader, MiniBars, PageHeader, ProgressBar, Sparkline, StatCard, Timeline, Tone } from '@/shared/components/ui';

const ROLE_TONE: Record<AppRole, Tone> = { GUEST: 'slate', STUDENT: 'indigo', TEACHER: 'emerald', HEAD_TEACHER: 'amber', ADMIN: 'rose' };
const SEVERITY_TONE: Record<string, Tone> = { INFO: 'slate', WARN: 'amber', CRITICAL: 'rose' };
const SEVERITY_ICON: Record<string, React.ReactNode> = { INFO: <Info />, WARN: <AlertTriangle />, CRITICAL: <ShieldAlert /> };

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan hệ thống');
  const traffic = ADMIN_TRAFFIC.reduce((a, b) => a + b.value, 0);
  const upCount = MOCK_SERVICES.filter((s) => s.status === 'UP').length;
  const roles: AppRole[] = ['STUDENT', 'TEACHER', 'HEAD_TEACHER', 'ADMIN'];
  const newest = [...MOCK_USERS].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()).slice(0, 5);
  const logs = [...MOCK_AUDIT_LOGS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Tổng quan hệ thống" description="Tình trạng vận hành, người dùng và hoạt động quản trị trong 7 ngày gần nhất." eyebrow="Admin Console" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Người dùng" value={MOCK_USERS.length} icon={<Users />} tone="indigo" delta={12} deltaLabel="so với tuần trước" />
        <StatCard label="Lượt truy cập tuần" value={traffic} icon={<Activity />} tone="sky" delta={8} deltaLabel="so với tuần trước" />
        <StatCard label="Câu hỏi trong kho" value={12600} icon={<FileQuestion />} tone="violet" hint="TOEIC & VSTEP" />
        <StatCard label="Dịch vụ hoạt động" value={`${upCount}/${MOCK_SERVICES.length}`} icon={<Server />} tone={upCount === MOCK_SERVICES.length ? 'emerald' : 'amber'} hint={upCount === MOCK_SERVICES.length ? 'Tất cả ổn định' : 'Có dịch vụ suy giảm'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Lượt truy cập theo ngày" subtitle="7 ngày gần nhất" action={<Badge tone="sky">{traffic.toLocaleString('vi-VN')} lượt</Badge>} />
          <MiniBars data={ADMIN_TRAFFIC.map((d) => ({ ...d, tone: 'sky' as Tone }))} height={160} />
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: '80ms' }}>
          <CardHeader title="Đăng ký mới" subtitle="12 tháng gần nhất" />
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-black text-slate-900">{ADMIN_SIGNUPS[ADMIN_SIGNUPS.length - 1]}</p>
              <p className="text-xs text-slate-500">tài khoản tháng này</p>
            </div>
            <Sparkline data={ADMIN_SIGNUPS} width={160} height={60} tone="indigo" />
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phân bố vai trò</p>
            {roles.map((r) => {
              const n = MOCK_USERS.filter((u) => u.role === r).length;
              return (
                <div key={r} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <Badge tone={ROLE_TONE[r]} size="xs">
                      {ROLE_LABEL[r]}
                    </Badge>
                    <span className="font-bold text-slate-700">{n}</span>
                  </div>
                  <ProgressBar value={(n / MOCK_USERS.length) * 100} size="xs" tone={ROLE_TONE[r]} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <CardHeader title="Trạng thái dịch vụ" subtitle="Cập nhật theo thời gian thực" action={<Link to="/admin/system" className="text-xs font-bold text-indigo-600 hover:underline">Chi tiết</Link>} />
          <ul className="space-y-2.5">
            {MOCK_SERVICES.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5">
                  <span className={cn('w-2.5 h-2.5 rounded-full', s.status === 'UP' ? 'bg-emerald-500 animate-pulse' : s.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-rose-500')} />
                  <span className="font-semibold text-slate-700">{s.name}</span>
                </span>
                <span className="text-xs font-mono text-slate-500">{s.latencyMs} ms</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <CardHeader title="Nhật ký gần nhất" subtitle="Thao tác nhạy cảm" action={<Link to="/admin/audit-logs" className="text-xs font-bold text-indigo-600 hover:underline">Xem tất cả</Link>} />
          <Timeline
            items={logs.map((l) => ({
              id: l.id,
              title: (
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs">{l.action}</span>
                  <Badge tone={SEVERITY_TONE[l.severity]} size="xs">
                    {l.severity}
                  </Badge>
                </span>
              ),
              description: `${l.actor} · ${l.target}`,
              time: timeAgo(l.createdAt),
              tone: SEVERITY_TONE[l.severity],
              icon: SEVERITY_ICON[l.severity],
            }))}
          />
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <CardHeader title="Người dùng mới" subtitle="Tham gia gần đây" action={<Button size="xs" variant="ghost" to="/admin/users" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Quản lý</Button>} />
          <ul className="space-y-3">
            {newest.map((u, i) => (
              <li key={u.id} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <Avatar name={u.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.fullName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="text-right">
                  <Badge tone={ROLE_TONE[u.role]} size="xs">
                    {ROLE_LABEL[u.role]}
                  </Badge>
                  <p className="text-[10px] text-slate-400 mt-1">{formatDate(u.joinedAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
