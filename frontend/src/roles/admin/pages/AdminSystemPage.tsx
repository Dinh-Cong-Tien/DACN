import React from 'react';
import { RefreshCw, Cpu, MemoryStick, Database, AlertTriangle, ShieldAlert, Server, Activity, HardDrive } from 'lucide-react';
import type { ServiceStatus } from '@/shared/types';
import { cn, timeAgo } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { useAdminAuditLogs, useAdminSystem } from '@/shared/api/admin';
import { IconTile, Meter, Panel, Status, TBtn, TPageHead, type StatusTone, type Tone } from '@/roles/teacher/components/TeacherKit';

const STATUS_META: Record<ServiceStatus['status'], { tone: StatusTone; label: string; meter: 'green' | 'amber' | 'red' }> = {
  UP: { tone: 'green', label: 'Hoạt động', meter: 'green' },
  DEGRADED: { tone: 'amber', label: 'Suy giảm', meter: 'amber' },
  DOWN: { tone: 'red', label: 'Gián đoạn', meter: 'red' },
};

const SERVICE_ICON: Record<string, { icon: React.ElementType; tone: Tone }> = {
  'API Server': { icon: Server, tone: 'indigo' },
  PostgreSQL: { icon: Database, tone: 'sky' },
};

/** Trạng thái dịch vụ đo thật từ backend: ping CSDL, thông số tiến trình Node và máy chủ */
export const AdminSystemPage: React.FC = () => {
  useDocumentTitle('Trạng thái dịch vụ');
  const { data, isFetching, refetch, isError } = useAdminSystem();
  const incidents = useAdminAuditLogs({ severity: 'CRITICAL', pageSize: 6 });
  const services = data?.services ?? [];
  const up = services.filter((s) => s.status === 'UP').length;
  const allUp = !isError && services.length > 0 && up === services.length;
  const host = data?.host;
  const proc = data?.process;
  const db = data?.database;

  const recheck = async () => {
    const r = await refetch();
    const ss = r.data?.services ?? [];
    if (r.isError) toast.error('Không kết nối được máy chủ API');
    else toast.success('Đã kiểm tra lại', `${ss.filter((s) => s.status === 'UP').length}/${ss.length} dịch vụ hoạt động bình thường.`);
  };

  const ramUsed = host ? host.totalMemMb - host.freeMemMb : 0;
  const resources: { label: string; value: number; icon: React.ElementType; tone: Tone; detail: string }[] = [
    { label: 'CPU (tải 1 phút)', value: host && host.load[0] ? Math.min(100, Math.round((host.load[0] / host.cpus) * 100)) : 0, icon: Cpu, tone: 'indigo', detail: host ? `${host.cpus} nhân · ${host.platform}${host.load[0] ? '' : ' · hệ điều hành không báo tải'}` : '—' },
    { label: 'RAM máy chủ', value: host ? Math.round((ramUsed / host.totalMemMb) * 100) : 0, icon: MemoryStick, tone: 'violet', detail: host ? `${(ramUsed / 1024).toFixed(1)} / ${(host.totalMemMb / 1024).toFixed(1)} GB` : '—' },
    { label: 'Bộ nhớ tiến trình API', value: proc ? Math.round((proc.heapUsedMb / proc.heapTotalMb) * 100) : 0, icon: HardDrive, tone: 'amber', detail: proc ? `Heap ${proc.heapUsedMb} / ${proc.heapTotalMb} MB · RSS ${proc.rssMb} MB` : '—' },
    { label: 'Kết nối CSDL', value: db?.maxConnections ? Math.round((db.connections / db.maxConnections) * 100) : 0, icon: Database, tone: 'sky', detail: db ? `${db.connections}${db.maxConnections ? ` / ${db.maxConnections}` : ''} kết nối · ${db.tables} bảng · ${db.size}` : '—' },
  ];

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Hệ thống' }, { label: 'Trạng thái dịch vụ' }]}
        title="Trạng thái dịch vụ"
        sub="Giám sát máy chủ API và cơ sở dữ liệu PostgreSQL theo thời gian thực (tự làm mới mỗi phút)."
        actions={
          <TBtn variant="primary" icon={<RefreshCw className={cn(isFetching && 'animate-spin')} />} onClick={recheck} disabled={isFetching}>
            {isFetching ? 'Đang kiểm tra…' : 'Kiểm tra lại'}
          </TBtn>
        }
      />

      {/* Tổng trạng thái */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-bold', allUp ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300')}>
              <span className={cn('h-2 w-2 rounded-full', allUp ? 'bg-emerald-400' : 'bg-amber-400')} />
              {allUp ? 'Mọi dịch vụ ổn định' : 'Có dịch vụ cần chú ý'}
            </span>
            <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight md:text-3xl">
              {isError ? 'Không kết nối được máy chủ API' : !data ? 'Đang kiểm tra…' : allUp ? 'Tất cả hệ thống hoạt động bình thường' : `${services.length - up} dịch vụ đang suy giảm hiệu năng`}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Kiểm tra lần cuối lúc {data ? new Date(data.checkedAt).toLocaleTimeString('vi-VN') : '—'}
              {proc ? ` · Node ${proc.node} · PID ${proc.pid}` : ''}
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: 'Đang chạy', v: `${up}/${services.length}` },
                { k: 'API chạy liên tục', v: services[0]?.uptime ?? '—' },
                { k: 'Độ trễ CSDL', v: services.find((x) => x.name === 'PostgreSQL') ? `${services.find((x) => x.name === 'PostgreSQL')!.latencyMs} ms` : '—' },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
                  <dt className="text-[11px] text-white/50">{x.k}</dt>
                  <dd className="mt-1 font-display text-lg font-extrabold tabular-nums md:text-xl">{x.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
            <p className="mb-3 text-[12px] font-semibold text-white/60">Cơ sở dữ liệu</p>
            <dl className="space-y-2 text-[13px]">
              {[
                ['Phiên bản', db?.version.split(',')[0] ?? '—'],
                ['Dung lượng', db?.size ?? '—'],
                ['Số bảng', db ? String(db.tables) : '—'],
                ['Hoạt động gần nhất', data?.lastActivityAt ? timeAgo(data.lastActivityAt) : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-white/50">{k}</dt>
                  <dd className="truncate text-right font-semibold text-white/90">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Dịch vụ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {services.map((s) => {
          const m = STATUS_META[s.status];
          const ic = SERVICE_ICON[s.name] ?? { icon: Server, tone: 'indigo' as Tone };
          return (
            <article key={s.name} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)] transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(16,24,40,0.25)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <IconTile icon={ic.icon} tone={ic.tone} />
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold text-slate-900">{s.name}</p>
                    <p className="truncate text-[12px] text-slate-500">{s.description}</p>
                  </div>
                </div>
                <Status tone={m.tone}>{m.label}</Status>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[12px] text-slate-500">Độ trễ</p>
                  <p className={cn('font-display text-xl font-extrabold tabular-nums', s.latencyMs > 250 ? 'text-amber-600' : 'text-slate-900')}>
                    {s.latencyMs} <span className="text-xs font-semibold text-slate-400">ms</span>
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-slate-500">Tình trạng</p>
                  <p className="truncate font-display text-xl font-extrabold text-slate-900">{s.uptime}</p>
                </div>
              </div>
              <Meter value={s.status === 'UP' ? 100 : s.status === 'DEGRADED' ? 60 : 10} tone={m.meter} className="mt-3" />
            </article>
          );
        })}
        {!services.length && <p className="col-span-full py-6 text-center text-sm text-slate-500">{isError ? 'Không lấy được trạng thái dịch vụ.' : 'Đang kiểm tra…'}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Tài nguyên máy chủ" sub={host ? `${host.platform} · ${host.cpus} nhân` : 'Đang tải…'} icon={Cpu} tone="indigo">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {resources.map((r) => (
              <div key={r.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                    <IconTile icon={r.icon} tone={r.tone} size="sm" />
                    {r.label}
                  </span>
                  <span className="font-display text-lg font-extrabold tabular-nums text-slate-900">{r.value}%</span>
                </div>
                <Meter value={r.value} tone={r.value > 80 ? 'red' : r.value > 60 ? 'amber' : 'green'} className="mt-3" />
                <p className="mt-2 text-[12px] text-slate-500">{r.detail}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Sự kiện nghiêm trọng" sub="Thao tác mức CRITICAL gần nhất" icon={AlertTriangle} tone="amber">
          {incidents.data?.items.length ? (
            <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-slate-200">
              {incidents.data.items.map((it) => (
                <li key={it.id} className="relative flex gap-3">
                  <IconTile icon={ShieldAlert} tone="rose" size="sm" className="relative ring-4 ring-white" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{it.action}</p>
                    <p className="truncate text-[13px] text-slate-500">
                      {it.actor} · {it.target}
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-400">{timeAgo(it.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <IconTile icon={Activity} tone="emerald" />
              <p className="text-sm text-slate-500">Chưa có sự kiện nghiêm trọng nào.</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};
