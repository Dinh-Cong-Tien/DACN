import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, FileQuestion, Server, ArrowRight, ShieldAlert, Info, AlertTriangle, Database, HardDrive } from 'lucide-react';
import { MOCK_USERS, MOCK_SERVICES, MOCK_AUDIT_LOGS, ADMIN_TRAFFIC, ADMIN_SIGNUPS } from '@/shared/mocks';
import type { AppRole } from '@/shared/types';
import { cn, formatDate, timeAgo, ROLE_LABEL, formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Avatar, Badge, Button, Card, CardHeader, MiniBars, PageHeader, ProgressBar, Sparkline, StatCard, Timeline, Tone } from '@/shared/components/ui';
import { CountUp } from '@/shared/components/motion';

const ROLE_TONE: Record<AppRole, Tone> = { GUEST: 'slate', STUDENT: 'indigo', TEACHER: 'emerald', HEAD_TEACHER: 'amber', ADMIN: 'violet' };
const SEVERITY_TONE: Record<string, Tone> = { INFO: 'slate', WARN: 'amber', CRITICAL: 'rose' };
const SEVERITY_ICON: Record<string, React.ReactNode> = { INFO: <Info />, WARN: <AlertTriangle />, CRITICAL: <ShieldAlert /> };

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan hệ thống');
  const user = useAuthStore((s) => s.user);
  const traffic = ADMIN_TRAFFIC.reduce((a, b) => a + b.value, 0);
  const upCount = MOCK_SERVICES.filter((s) => s.status === 'UP').length;
  const allUp = upCount === MOCK_SERVICES.length;
  const roles: AppRole[] = ['STUDENT', 'TEACHER', 'HEAD_TEACHER', 'ADMIN'];
  const newest = [...MOCK_USERS].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()).slice(0, 5);
  const logs = [...MOCK_AUDIT_LOGS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Xin chào, <span className="mark">{user?.fullName.split(' ').slice(-1)[0] ?? 'Admin'}</span>
          </>
        }
        description={`${now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} · máy chủ ap-southeast-1 · API v1.4.2`}
        eyebrow="Admin Console"
        actions={
          <>
            <Button variant="outline" size="sm" to="/admin/audit-logs">
              Nhật ký
            </Button>
            <Button size="sm" to="/admin/users" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Quản lý người dùng
            </Button>
          </>
        }
      />

      {/* Bento hàng 1: trạng thái hệ thống (ink) + 2 stat + traffic (teal) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card hard tone="ink" className="xl:row-span-2 flex flex-col animate-fade-up" padding="md">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Trạng thái hệ thống</p>
            <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-extrabold border', allUp ? 'bg-emerald-400 text-slate-900 border-emerald-300' : 'bg-amber-300 text-slate-900 border-amber-200')}>{allUp ? 'ALL GREEN' : 'DEGRADED'}</span>
          </div>
          <p className="font-display text-5xl font-extrabold mt-3 leading-none">
            {upCount}
            <span className="text-2xl text-slate-500">/{MOCK_SERVICES.length}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">dịch vụ hoạt động · uptime 30 ngày 99.94%</p>
          <ul className="mt-5 space-y-2.5 flex-1">
            {MOCK_SERVICES.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5">
                  <span className={cn('w-2.5 h-2.5 rounded-full ring-4', s.status === 'UP' ? 'bg-emerald-400 ring-emerald-400/20 animate-pulse' : s.status === 'DEGRADED' ? 'bg-amber-300 ring-amber-300/20' : 'bg-rose-500 ring-rose-500/20')} />
                  <span className="font-semibold text-slate-200">{s.name}</span>
                </span>
                <span className="font-mono text-xs text-slate-400">{s.latencyMs} ms</span>
              </li>
            ))}
          </ul>
          <Link to="/admin/system" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200">
            Chi tiết dịch vụ <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <StatCard label="Người dùng" value={MOCK_USERS.length} icon={<Users />} tone="indigo" delta={12} deltaLabel="tuần này" />
        <StatCard label="Câu hỏi trong kho" value={12600} icon={<FileQuestion />} tone="violet" hint="TOEIC & VSTEP" format={formatNumber} />

        <Card hard tone="teal" className="xl:row-span-2 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-100">Lượt truy cập 7 ngày</p>
              <p className="font-display text-4xl font-extrabold mt-1">
                <CountUp value={traffic} />
              </p>
            </div>
            <span className="sticker tilt-2 !bg-amber-300">+8%</span>
          </div>
          <div className="mt-4 [&_.text-slate-400]:text-indigo-100 [&_.bg-white]:bg-indigo-900 [&_.text-slate-700]:text-white">
            <MiniBars data={ADMIN_TRAFFIC.map((d) => ({ ...d, tone: 'amber' as Tone }))} height={150} />
          </div>
          <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-indigo-100">Đỉnh</p>
              <p className="font-mono font-bold">T7 · 3.120</p>
            </div>
            <div>
              <p className="text-indigo-100">TB/ngày</p>
              <p className="font-mono font-bold">{Math.round(traffic / 7).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </Card>

        <StatCard label="Dung lượng media" value="128" suffix="GB" icon={<HardDrive />} tone="amber" hint="/ 200 GB S3 bucket" />
        <StatCard label="Kết nối CSDL" value={28} icon={<Database />} tone="sky" hint="/ 100 pool · PostgreSQL 16" />
      </div>

      {/* Bento hàng 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card hard tone="yellow" className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <CardHeader title="Người dùng mới" subtitle="5 tài khoản gần nhất" action={<Button size="xs" variant="outline" to="/admin/users" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Tất cả</Button>} />
          <ul className="space-y-2.5">
            {newest.map((u, i) => (
              <li key={u.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/60 border border-slate-900/10 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <Avatar name={u.fullName} src={u.avatarUrl} size="sm" ring />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{u.fullName}</p>
                  <p className="text-[11px] text-slate-600 truncate">{u.email}</p>
                </div>
                <div className="text-right">
                  <Badge tone={ROLE_TONE[u.role]} size="xs">
                    {ROLE_LABEL[u.role]}
                  </Badge>
                  <p className="text-[10px] text-slate-600 mt-1 font-mono">{formatDate(u.joinedAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <CardHeader title="Nhật ký gần nhất" subtitle="Thao tác nhạy cảm" icon={<Activity />} action={<Link to="/admin/audit-logs" className="text-xs font-bold text-indigo-700 underline underline-offset-2">Xem tất cả</Link>} />
          <Timeline
            items={logs.map((l) => ({
              id: l.id,
              title: (
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{l.action}</span>
                  <Badge tone={SEVERITY_TONE[l.severity]} size="xs">
                    {l.severity}
                  </Badge>
                </span>
              ),
              description: `${l.actor} · ${l.target} · ${l.ip}`,
              time: timeAgo(l.createdAt),
              tone: SEVERITY_TONE[l.severity],
              icon: SEVERITY_ICON[l.severity],
            }))}
          />
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <CardHeader title="Đăng ký mới" subtitle="12 tháng gần nhất" icon={<Server />} />
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-4xl font-extrabold text-slate-900">{ADMIN_SIGNUPS[ADMIN_SIGNUPS.length - 1]}</p>
              <p className="text-xs text-slate-500">tài khoản tháng này</p>
            </div>
            <Sparkline data={ADMIN_SIGNUPS} width={150} height={56} tone="violet" />
          </div>
          <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-200 space-y-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Phân bố vai trò</p>
            {roles.map((r) => {
              const n = MOCK_USERS.filter((u) => u.role === r).length;
              return (
                <div key={r} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <Badge tone={ROLE_TONE[r]} size="xs">
                      {ROLE_LABEL[r]}
                    </Badge>
                    <span className="font-mono font-bold text-slate-700">{n}</span>
                  </div>
                  <ProgressBar value={(n / MOCK_USERS.length) * 100} size="xs" tone={ROLE_TONE[r]} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
