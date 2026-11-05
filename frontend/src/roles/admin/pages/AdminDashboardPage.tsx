import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, BarChart3, ChevronRight, ClipboardList, CreditCard, Database, Info, LifeBuoy, Megaphone, ScrollText, Server, ShieldAlert, UserCheck, UserPlus, Users, Wallet } from 'lucide-react';
import { useAdminAnalytics, useAdminAuditLogs, useAdminBilling, useAdminDashboard, useAdminSystem, useAdminUsers } from '@/shared/api/admin';
import type { AppRole, AuditLog } from '@/shared/types';
import { cn, formatDate, timeAgo, ROLE_LABEL, formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Avatar } from '@/shared/components/ui';
import { BarChart, HBarChart, LineChart } from '@/shared/components/charts/Charts';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { Figures, GradientTail, IconTile, Meter, Panel, PanelLink, Status, TBtn, type StatusTone, type Tone } from '@/roles/teacher/components/TeacherKit';
import { appLocale } from '@/shared/i18n';

const WEEKDAY = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const ROLE_STATUS: Record<AppRole, StatusTone> = { GUEST: 'gray', STUDENT: 'blue', TEACHER: 'green', HEAD_TEACHER: 'amber', ADMIN: 'red' };
const SVC_DOT: Record<string, string> = { UP: 'bg-emerald-400', DEGRADED: 'bg-amber-300', DOWN: 'bg-rose-500' };
const SEV: Record<AuditLog['severity'], { icon: React.ElementType; tone: Tone; label: string }> = {
  INFO: { icon: Info, tone: 'sky', label: 'Thông tin' },
  WARN: { icon: AlertTriangle, tone: 'amber', label: 'Cảnh báo' },
  CRITICAL: { icon: ShieldAlert, tone: 'rose', label: 'Nghiêm trọng' },
};

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan hệ thống');
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const dash = useAdminDashboard().data;
  const sys = useAdminSystem();
  const analytics = useAdminAnalytics(7).data;
  const billing = useAdminBilling().data;
  const logs = useAdminAuditLogs({ pageSize: 5 }).data?.items ?? [];
  const usersStats = useAdminUsers({ pageSize: 1 }).data?.stats;
  const services = sys.data?.services ?? [];
  const daily = analytics?.daily ?? [];
  const traffic = daily.reduce((a, d) => a + d.active, 0);
  const upCount = services.filter((s) => s.status === 'UP').length;
  const troubled = services.filter((s) => s.status !== 'UP');
  const allUp = !sys.isError && services.length > 0 && troubled.length === 0;
  const totalUsers = dash?.users ?? 0;
  const pendingUsers = dash?.pendingUsers ?? [];
  const newest = dash?.recentUsers ?? [];
  const signups = dash?.newThisMonth ?? 0;
  const signupsPrev = dash?.newPrevMonth ?? 0;
  const revenueTr = Math.round((dash?.revenueMonth ?? 0) / 100_000) / 10;
  const revenuePrevTr = Math.round((dash?.revenuePrevMonth ?? 0) / 100_000) / 10;
  const revenueSeries = billing?.revenue ?? { labels: [], revenue: [] };
  const signupSeries = analytics?.signupsMonthly ?? { labels: [], values: [] };
  const roles: AppRole[] = ['STUDENT', 'TEACHER', 'HEAD_TEACHER', 'ADMIN'];
  const byRole = usersStats?.byRole ?? analytics?.roles ?? {};
  const byStatus = usersStats?.byStatus ?? {};

  const todos: { icon: React.ElementType; tone: Tone; text: string; note: string; to: string; cta: string }[] = [
    ...(dash?.openTickets ? [{ icon: LifeBuoy, tone: 'rose' as Tone, text: `${dash.openTickets} yêu cầu hỗ trợ mới`, note: 'Từ khung chat hỗ trợ, email và hotline', to: '/admin/support', cta: 'Trả lời' }] : []),
    ...(dash?.pendingPayments ? [{ icon: CreditCard, tone: 'amber' as Tone, text: `${dash.pendingPayments} thanh toán chờ xác nhận`, note: 'Chuyển khoản ngân hàng · cần kích hoạt VIP', to: '/admin/billing', cta: 'Xác nhận' }] : []),
    ...troubled.map((s) => ({ icon: Server, tone: 'sky' as Tone, text: `${s.name} ${s.status === 'DOWN' ? 'mất kết nối' : 'phản hồi chậm'}`, note: `${s.latencyMs} ms · ${s.uptime}`, to: '/admin/system', cta: 'Kiểm tra' })),
    ...(pendingUsers.length ? [{ icon: UserCheck, tone: 'emerald' as Tone, text: `${pendingUsers.length} tài khoản chờ kích hoạt`, note: pendingUsers.map((u) => u.fullName).join(', '), to: '/admin/users', cta: 'Duyệt' }] : []),
    ...(dash?.scheduledBroadcasts ?? []).map((b) => ({ icon: Megaphone, tone: 'violet' as Tone, text: `Thông báo hẹn giờ: ${b.title}`, note: b.scheduledAt ? `Gửi lúc ${new Date(b.scheduledAt).toLocaleString(appLocale(), { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}` : 'Chưa đặt giờ', to: '/admin/broadcasts', cta: 'Xem' })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-amber-600">
          {WEEKDAY[now.getDay()]}, {now.toLocaleDateString(appLocale())}{sys.data?.process ? ` · Node ${sys.data.process.node}` : ''}
        </p>
        <h1 className="mt-1.5 font-display text-[2rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 md:text-[2.6rem]">
          <GradientTail text="Tổng quan hệ thống" />
        </h1>
        <p className="mt-1 text-[15px] text-slate-500">
          {user?.fullName} · {formatNumber(traffic)} lượt hoạt động 7 ngày · {signups} tài khoản mới tháng này
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Trạng thái hệ thống */}
        <section className="relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_20px_40px_-24px_rgba(16,24,40,0.6)]">
          <div className="absolute inset-0 opacity-50">
            <Img src={PHOTOS.office} alt="Trung tâm vận hành" wrapperClass="h-full" fallbackClass="bg-slate-800" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-indigo-950/80 to-indigo-900/30" />
          <div className="relative flex h-full flex-col justify-between gap-6 p-6 md:p-7">
            <div>
              <p className={cn('inline-flex items-center gap-2 text-[13px] font-semibold', allUp ? 'text-emerald-300' : 'text-amber-300')}>
                <Activity className="h-4 w-4" /> {sys.isError ? 'Không kết nối được máy chủ' : allUp ? 'Mọi dịch vụ hoạt động bình thường' : services.length ? `${troubled.length} dịch vụ cần chú ý` : 'Đang kiểm tra…'}
              </p>
              <h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-tight md:text-[2rem]">
                {upCount}/{services.length} dịch vụ ổn định
              </h2>
              <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-slate-300">
                {allUp ? `API đã chạy liên tục ${services[0]?.uptime ?? ''}. ${sys.data?.database ? `CSDL ${sys.data.database.size}, ${sys.data.database.tables} bảng.` : ''}` : troubled.length ? `${troubled.map((s) => `${s.name} (${s.latencyMs} ms)`).join(', ')} đang vượt ngưỡng.` : ''}
              </p>
              <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {services.map((s) => (
                  <li key={s.name} className="flex items-center gap-2.5 text-sm">
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', SVC_DOT[s.status])} />
                    <span className="min-w-0 flex-1 truncate text-slate-100">{s.name}</span>
                    <span className={cn('font-mono text-xs tabular-nums', s.status === 'UP' ? 'text-slate-400' : 'text-amber-300')}>{s.latencyMs} ms</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/system" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-indigo-50">
                <Server className="h-4 w-4" /> Trạng thái dịch vụ
              </Link>
              <Link to="/admin/audit-logs" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10">
                <ScrollText className="h-4 w-4" /> Nhật ký hệ thống
              </Link>
              <Link to="/admin/analytics" className="inline-flex h-10 items-center gap-1 px-2 text-sm font-semibold text-slate-200 hover:text-white">
                Thống kê <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Việc cần xử lý */}
        <Panel title="Việc cần xử lý" sub={`${todos.length} việc đang chờ`} icon={ClipboardList} tone="indigo" flush>
          <ul className="divide-y divide-slate-100">
            {!todos.length && <li className="px-5 py-10 text-center text-sm text-slate-500">Không có việc nào đang chờ.</li>}
            {todos.map((t) => (
              <li key={t.text} className="flex items-center gap-3 px-5 py-3">
                <IconTile icon={t.icon} tone={t.tone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{t.text}</p>
                  <p className="truncate text-xs text-slate-500">{t.note}</p>
                </div>
                <TBtn size="sm" to={t.to}>
                  {t.cta}
                </TBtn>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Figures
        items={[
          { label: 'Tài khoản', value: totalUsers, note: `${dash?.vipUsers ?? 0} gói VIP đang hiệu lực`, icon: Users, tone: 'indigo' },
          { label: 'Đăng ký tháng này', value: signups, note: `${signups >= signupsPrev ? '+' : ''}${signups - signupsPrev} so với tháng trước`, icon: UserPlus, tone: 'emerald' },
          { label: 'Doanh thu tháng', value: `${revenueTr} tr`, note: revenuePrevTr ? `${revenueTr >= revenuePrevTr ? '+' : ''}${Math.round(((revenueTr - revenuePrevTr) / revenuePrevTr) * 100)}% so với tháng trước` : 'chưa có doanh thu tháng trước', icon: Wallet, tone: 'amber' },
          { label: 'Lượt làm bài 7 ngày', value: formatNumber(dash?.attempts7d ?? 0), note: `${formatNumber(traffic)} lượt người học hoạt động`, icon: BarChart3, tone: 'violet' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Đăng ký mới" sub="12 tháng gần nhất" icon={UserPlus} tone="emerald" action={<PanelLink to="/admin/analytics">Thống kê</PanelLink>}>
          {signupSeries.values.some(Boolean) ? <LineChart ariaLabel="Đăng ký mới 12 tháng" labels={signupSeries.labels} series={[{ name: 'Đăng ký mới', values: signupSeries.values }]} height={220} unit=" tài khoản" /> : <p className="py-14 text-center text-sm text-slate-500">Chưa có dữ liệu.</p>}
        </Panel>
        <Panel title="Doanh thu gói VIP" sub="Triệu đồng · 6 tháng gần nhất" icon={Wallet} tone="amber" action={<PanelLink to="/admin/billing">Thanh toán</PanelLink>}>
          {revenueSeries.revenue.some(Boolean) ? <BarChart ariaLabel="Doanh thu 6 tháng" data={revenueSeries.labels.map((l, i) => ({ label: l, value: revenueSeries.revenue[i] }))} height={220} unit=" triệu" highlight={revenueSeries.labels[revenueSeries.labels.length - 1]} /> : <p className="py-14 text-center text-sm text-slate-500">Chưa có giao dịch thành công.</p>}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Người học hoạt động" sub="7 ngày gần nhất" icon={Activity} tone="sky">
          {traffic ? <BarChart ariaLabel="Người học hoạt động 7 ngày" data={daily.map((d) => ({ label: d.label, value: d.active }))} height={190} unit=" người" format={(v) => formatNumber(v)} /> : <p className="py-14 text-center text-sm text-slate-500">Chưa có hoạt động học tập.</p>}
        </Panel>

        <Panel title="Người dùng mới" sub="5 tài khoản gần nhất" icon={UserPlus} tone="indigo" action={<PanelLink to="/admin/users">Tất cả</PanelLink>} flush>
          <ul className="divide-y divide-slate-100">
            {newest.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-5 py-2.5">
                <Avatar name={u.fullName} src={u.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/users?q=${encodeURIComponent(u.email)}`} className="block truncate text-sm font-semibold text-slate-800 hover:text-indigo-700">
                    {u.fullName}
                  </Link>
                  <p className="truncate text-xs text-slate-500">{u.email}</p>
                </div>
                <div className="shrink-0 text-right">
                  <Status tone={ROLE_STATUS[u.role as AppRole]}>{ROLE_LABEL[u.role as AppRole]}</Status>
                  <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(u.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Phân bố vai trò" sub={`${totalUsers} tài khoản`} icon={Database} tone="violet">
          <HBarChart ariaLabel="Số tài khoản theo vai trò" labelWidth={110} data={roles.map((r) => ({ label: ROLE_LABEL[r], value: byRole[r] ?? 0 }))} />
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
            {[
              { label: 'Đang hoạt động', n: byStatus.ACTIVE ?? 0, tone: 'green' as const },
              { label: 'Chờ kích hoạt', n: byStatus.PENDING ?? 0, tone: 'amber' as const },
              { label: 'Đã khoá', n: byStatus.LOCKED ?? 0, tone: 'red' as const },
            ].map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="text-slate-600">{s.label}</span>
                  <span className="font-semibold tabular-nums text-slate-900">{s.n}</span>
                </div>
                <Meter value={totalUsers ? (s.n / totalUsers) * 100 : 0} tone={s.tone} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Nhật ký gần nhất" sub="Thao tác quản trị và cảnh báo bảo mật" icon={ShieldAlert} tone="rose" action={<PanelLink to="/admin/audit-logs">Xem tất cả</PanelLink>} flush>
        <ul className="divide-y divide-slate-100">
          {!logs.length && <li className="px-5 py-10 text-center text-sm text-slate-500">Chưa có nhật ký.</li>}
          {logs.map((l) => {
            const sv = SEV[l.severity];
            return (
              <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                <IconTile icon={sv.icon} tone={sv.tone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">{l.action}</span>
                    <span className="truncate">{l.target}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {l.actor} · {ROLE_LABEL[l.role]}{l.ip ? ` · IP ${l.ip}` : ''}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <Status tone={l.severity === 'CRITICAL' ? 'red' : l.severity === 'WARN' ? 'amber' : 'blue'}>{sv.label}</Status>
                  <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(l.createdAt)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
};
