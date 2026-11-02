import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, ShieldAlert, Info, AlertTriangle, Activity, LifeBuoy, CreditCard, Megaphone } from 'lucide-react';
import { MOCK_USERS, MOCK_SERVICES, MOCK_AUDIT_LOGS, ADMIN_TRAFFIC, ADMIN_SIGNUPS, MOCK_TICKETS, MOCK_PAYMENTS, MOCK_BROADCASTS } from '@/shared/mocks';
import type { AppRole } from '@/shared/types';
import { cn, formatDate, timeAgo, ROLE_LABEL, formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Avatar, Badge, Button, Card, ProgressBar, Timeline, Tone } from '@/shared/components/ui';
import { BarChart, LineChart } from '@/shared/components/charts/Charts';
import { CountUp, Reveal, Stagger } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';

const ROLE_TONE: Record<AppRole, Tone> = { GUEST: 'slate', STUDENT: 'indigo', TEACHER: 'emerald', HEAD_TEACHER: 'amber', ADMIN: 'violet' };
const SEVERITY_TONE: Record<string, Tone> = { INFO: 'slate', WARN: 'amber', CRITICAL: 'rose' };
const SEVERITY_ICON: Record<string, React.ReactNode> = { INFO: <Info />, WARN: <AlertTriangle />, CRITICAL: <ShieldAlert /> };
const STATUS_DOT: Record<string, string> = { UP: 'bg-emerald-400', DEGRADED: 'bg-amber-300', DOWN: 'bg-rose-500' };

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan hệ thống');
  const user = useAuthStore((s) => s.user);
  const traffic = ADMIN_TRAFFIC.reduce((a, b) => a + b.value, 0);
  const upCount = MOCK_SERVICES.filter((s) => s.status === 'UP').length;
  const allUp = upCount === MOCK_SERVICES.length;
  const roles: AppRole[] = ['STUDENT', 'TEACHER', 'HEAD_TEACHER', 'ADMIN'];
  const newest = [...MOCK_USERS].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()).slice(0, 5);
  const logs = [...MOCK_AUDIT_LOGS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const signupsThisMonth = ADMIN_SIGNUPS[ADMIN_SIGNUPS.length - 1];
  const signupsPrev = ADMIN_SIGNUPS[ADMIN_SIGNUPS.length - 2];

  return (
    <div className="space-y-10">
      {/* ===== Chào + dải số liệu ===== */}
      <section className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-end animate-fade-up">
        <div className="space-y-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-amber-600">
            {today} · máy chủ ap-southeast-1 · API v1.4.2
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
            Tổng quan <span className="hero-gradient-text">hệ thống</span>
          </h1>
          <p className="text-base text-slate-500 max-w-xl">
            {allUp ? 'Hệ thống ổn định. ' : 'Hệ thống cần chú ý. '}{upCount}/{MOCK_SERVICES.length} dịch vụ đang hoạt động, {formatNumber(traffic)} lượt truy cập trong 7 ngày và {signupsThisMonth} tài khoản mới tháng này.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button variant="gradient" size="lg" to="/admin/users" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Quản lý người dùng
            </Button>
            <Button variant="outline" size="lg" to="/admin/audit-logs">
              Nhật ký hệ thống
            </Button>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-900/10 p-2 grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 divide-x divide-slate-900/10">
          {[
            { label: 'Người dùng', value: MOCK_USERS.length, suffix: 'tài khoản', sub: '+12% tuần này' },
            { label: 'Truy cập 7 ngày', value: traffic, suffix: 'lượt', sub: `đỉnh ${formatNumber(Math.max(...ADMIN_TRAFFIC.map((t) => t.value)))}` },
            { label: 'Câu hỏi', value: 12614, suffix: 'câu', sub: 'TOEIC & VSTEP' },
            { label: 'Dịch vụ', value: upCount, suffix: `/${MOCK_SERVICES.length}`, sub: 'uptime 99.94%' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className="font-display text-3xl font-extrabold text-slate-900 mt-2 leading-none">
                <CountUp value={s.value} />
                <span className="font-sans text-xs font-semibold text-slate-400 ml-1">{s.suffix}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1.5 truncate">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Việc cần xử lý ===== */}
      <section aria-label="Việc cần xử lý" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { to: '/admin/support', icon: LifeBuoy, label: 'Yêu cầu hỗ trợ mới', value: MOCK_TICKETS.filter((t) => t.status === 'OPEN').length, note: `${MOCK_TICKETS.filter((t) => t.status === 'OPEN' && t.priority === 'HIGH').length} yêu cầu gấp từ khung chat học viên`, tone: 'from-rose-500 to-pink-500' },
          { to: '/admin/billing', icon: CreditCard, label: 'Thanh toán chờ xác nhận', value: MOCK_PAYMENTS.filter((p) => p.status === 'PENDING').length, note: 'Chuyển khoản, cần kích hoạt VIP', tone: 'from-amber-400 to-orange-500' },
          { to: '/admin/system', icon: Activity, label: 'Dịch vụ cần chú ý', value: MOCK_SERVICES.length - upCount, note: MOCK_SERVICES.filter((s) => s.status !== 'UP').map((s) => s.name).join(', ') || 'Tất cả hoạt động bình thường', tone: 'from-sky-500 to-cyan-500' },
          { to: '/admin/broadcasts', icon: Megaphone, label: 'Thông báo hẹn giờ', value: MOCK_BROADCASTS.filter((b) => b.status === 'SCHEDULED').length, note: MOCK_BROADCASTS.find((b) => b.status === 'SCHEDULED')?.title ?? 'Không có', tone: 'from-violet-500 to-fuchsia-500' },
        ].map((t) => (
          <Link key={t.to} to={t.to} className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(16,24,40,0.25)]">
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white', t.tone)}>
              <t.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 text-[13px] text-slate-500">
                {t.label}
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
              </span>
              <span className="mt-1 block font-display text-[1.65rem] font-extrabold leading-none tabular-nums text-slate-900">{t.value}</span>
              <span className="mt-1.5 block truncate text-xs text-slate-500">{t.note}</span>
            </span>
          </Link>
        ))}
      </section>

      {/* ===== Khối nhấn: trạng thái hệ thống + đăng ký ===== */}
      <section className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white grid md:grid-cols-[1fr_260px] min-h-[320px]">
            <div aria-hidden className="absolute inset-0 bg-dots opacity-10" />
            <div className="relative p-7 md:p-9 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="sticker !bg-amber-300 !shadow-none !border-transparent">Trạng thái hệ thống</span>
                <Badge tone={allUp ? 'emerald' : 'amber'} solid>
                  {allUp ? 'All green' : 'Degraded'}
                </Badge>
              </div>
              <div>
                <p className="font-display text-5xl font-extrabold leading-none">
                  {upCount}
                  <span className="text-2xl text-slate-500">/{MOCK_SERVICES.length}</span>
                </p>
                <p className="text-sm text-slate-400 mt-2">dịch vụ hoạt động · uptime 30 ngày 99.94%</p>
              </div>
              <ul className="divide-y divide-white/10">
                {MOCK_SERVICES.map((s) => (
                  <li key={s.name} className="py-2.5 flex items-center gap-3 text-sm">
                    <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', STATUS_DOT[s.status], s.status !== 'DOWN' && 'animate-pulse')} />
                    <span className="flex-1 font-semibold truncate">{s.name}</span>
                    <span className="font-mono text-xs text-slate-400">{s.latencyMs} ms</span>
                  </li>
                ))}
              </ul>
              <Link to="/admin/system" className="inline-flex items-center gap-1 text-sm font-bold text-amber-300 hover:gap-2 transition-all">
                Chi tiết dịch vụ <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative hidden md:block">
              <Img src={PHOTOS.office} alt="Phòng máy chủ" wrapperClass="absolute inset-0" fallbackClass="bg-slate-800" className="opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Card className="h-full flex flex-col justify-between" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Đăng ký mới</p>
                <p className="font-display text-5xl font-extrabold text-slate-900 mt-2 leading-none">{signupsThisMonth}</p>
                <p className="text-sm text-slate-500 mt-2">
                  tài khoản tháng này · <span className={cn('font-bold', signupsThisMonth >= signupsPrev ? 'text-emerald-700' : 'text-rose-600')}>{signupsThisMonth >= signupsPrev ? '+' : ''}{signupsThisMonth - signupsPrev}</span> so với tháng trước
                </p>
              </div>
              <Badge tone="emerald">12 tháng</Badge>
            </div>
            <LineChart ariaLabel="Đăng ký mới 12 tháng" labels={ADMIN_SIGNUPS.map((_, i) => `T${((i + 11) % 12) + 1}`)} series={[{ name: 'Đăng ký mới', values: ADMIN_SIGNUPS }]} height={150} className="mt-4" />
            <Link to="/admin/analytics" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700 hover:gap-2 transition-all mt-3">
              Xem thống kê truy cập <ChevronRight className="w-4 h-4" />
            </Link>
          </Card>
        </Reveal>
      </section>

      {/* ===== Truy cập · Người dùng mới · Vai trò ===== */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Hoạt động</p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Người dùng và lưu lượng</h2>
          </div>
          <Link to="/admin/analytics" className="text-sm font-bold text-slate-700 hover:text-indigo-700 inline-flex items-center gap-1">
            Thống kê <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Stagger className="grid lg:grid-cols-3 gap-6">
          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Lượt truy cập</h3>
                <p className="text-sm text-slate-500">7 ngày gần nhất</p>
              </div>
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <BarChart ariaLabel="Lượt truy cập 7 ngày" data={ADMIN_TRAFFIC} height={170} unit=" lượt" format={(v) => formatNumber(v)} />
            <p className="text-sm text-slate-600 mt-4">
              Tổng <b className="text-slate-900">{formatNumber(traffic)}</b> · TB/ngày {formatNumber(Math.round(traffic / ADMIN_TRAFFIC.length))}
            </p>
          </Card>

          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Người dùng mới</h3>
                <p className="text-sm text-slate-500">5 tài khoản gần nhất</p>
              </div>
              <Link to="/admin/users" className="text-xs font-bold text-indigo-700">
                Tất cả
              </Link>
            </div>
            <ul className="divide-y divide-slate-900/10">
              {newest.map((u) => (
                <li key={u.id} className="py-2.5 flex items-center gap-3">
                  <Avatar name={u.fullName} src={u.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{u.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge tone={ROLE_TONE[u.role]} size="xs">
                      {ROLE_LABEL[u.role]}
                    </Badge>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(u.joinedAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Phân bố vai trò</h3>
                <p className="text-sm text-slate-500">{MOCK_USERS.length} tài khoản</p>
              </div>
            </div>
            <div className="space-y-4">
              {roles.map((r) => {
                const n = MOCK_USERS.filter((u) => u.role === r).length;
                return (
                  <div key={r}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">{ROLE_LABEL[r]}</span>
                      <span className="font-bold text-slate-900">{n}</span>
                    </div>
                    <ProgressBar value={(n / MOCK_USERS.length) * 100} size="sm" tone={ROLE_TONE[r]} />
                  </div>
                );
              })}
            </div>
          </Card>
        </Stagger>
      </section>

      {/* ===== Nhật ký gần nhất ===== */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Bảo mật</p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Nhật ký gần nhất</h2>
          </div>
          <Link to="/admin/audit-logs" className="text-sm font-bold text-slate-700 hover:text-indigo-700 inline-flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Reveal>
          <Card padding="lg">
            <Timeline
              items={logs.map((l) => ({
                id: l.id,
                tone: SEVERITY_TONE[l.severity],
                icon: SEVERITY_ICON[l.severity],
                time: timeAgo(l.createdAt),
                title: (
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{l.action}</span>
                    <Badge tone={SEVERITY_TONE[l.severity]} size="xs">
                      {l.severity}
                    </Badge>
                  </span>
                ),
                description: `${l.actor} · ${l.target} · ${l.ip}`,
              }))}
            />
          </Card>
        </Reveal>
      </section>
    </div>
  );
};
