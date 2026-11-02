import React, { useState } from 'react';
import { RefreshCw, Cpu, MemoryStick, HardDrive, Database, AlertTriangle, CheckCircle2, Info, Server, Gauge, Activity, Rocket, Mail } from 'lucide-react';
import { MOCK_SERVICES } from '@/shared/mocks';
import type { ServiceStatus } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { IconTile, Meter, Panel, Status, TBtn, TPageHead, type StatusTone, type Tone } from '@/roles/teacher/components/TeacherKit';

const STATUS_META: Record<ServiceStatus['status'], { tone: StatusTone; label: string; meter: 'green' | 'amber' | 'red' }> = {
  UP: { tone: 'green', label: 'Hoạt động', meter: 'green' },
  DEGRADED: { tone: 'amber', label: 'Suy giảm', meter: 'amber' },
  DOWN: { tone: 'red', label: 'Gián đoạn', meter: 'red' },
};

const SERVICE_ICON: Record<string, { icon: React.ElementType; tone: Tone }> = {
  'API Gateway': { icon: Server, tone: 'indigo' },
  PostgreSQL: { icon: Database, tone: 'sky' },
  'Redis Cache': { icon: Gauge, tone: 'rose' },
  'Media Storage (S3)': { icon: HardDrive, tone: 'amber' },
  'Email Service': { icon: Mail, tone: 'violet' },
  'Background Jobs': { icon: Activity, tone: 'emerald' },
};

const RESOURCES: { label: string; value: number; icon: React.ElementType; tone: Tone; detail: string }[] = [
  { label: 'CPU', value: 42, icon: Cpu, tone: 'indigo', detail: '4 vCPU · load 1.7' },
  { label: 'RAM', value: 63, icon: MemoryStick, tone: 'violet', detail: '5.1 / 8 GB' },
  { label: 'Ổ đĩa', value: 71, icon: HardDrive, tone: 'amber', detail: '142 / 200 GB' },
  { label: 'Kết nối CSDL', value: 28, icon: Database, tone: 'sky', detail: '28 / 100 pool' },
];

const INCIDENTS: { id: string; title: string; description: string; time: string; tone: Tone; icon: React.ElementType }[] = [
  { id: 'i1', title: 'Media Storage phản hồi chậm', description: 'Độ trễ CDN tăng lên 310 ms, đang theo dõi.', time: '09:12 hôm nay', tone: 'amber', icon: AlertTriangle },
  { id: 'i2', title: 'Sao lưu CSDL hoàn tất', description: 'orbilingo_prod · 1.8 GB · 02:00', time: 'Hôm nay', tone: 'emerald', icon: CheckCircle2 },
  { id: 'i3', title: 'Triển khai API v1.4.2', description: 'Không downtime, 14 endpoint cập nhật.', time: '2 ngày trước', tone: 'indigo', icon: Rocket },
  { id: 'i4', title: 'Email Service gián đoạn 6 phút', description: 'SMTP relay timeout, đã tự phục hồi.', time: '5 ngày trước', tone: 'rose', icon: AlertTriangle },
];

const uptimeNum = (s: string) => Number.parseFloat(s) || 0;

export const AdminSystemPage: React.FC = () => {
  useDocumentTitle('Trạng thái dịch vụ');
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState(new Date());
  const up = MOCK_SERVICES.filter((s) => s.status === 'UP').length;
  const allUp = up === MOCK_SERVICES.length;
  const avgLatency = Math.round(MOCK_SERVICES.reduce((a, s) => a + s.latencyMs, 0) / MOCK_SERVICES.length);

  const recheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setCheckedAt(new Date());
      toast.success('Đã kiểm tra lại', `${up}/${MOCK_SERVICES.length} dịch vụ hoạt động bình thường.`);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Hệ thống' }, { label: 'Trạng thái dịch vụ' }]}
        title="Trạng thái dịch vụ"
        sub="Giám sát API, cơ sở dữ liệu, cache, lưu trữ media và các job nền theo thời gian thực."
        actions={
          <TBtn variant="primary" icon={<RefreshCw className={cn(checking && 'animate-spin')} />} onClick={recheck} disabled={checking}>
            {checking ? 'Đang kiểm tra…' : 'Kiểm tra lại'}
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
              {allUp ? 'Tất cả hệ thống hoạt động bình thường' : `${MOCK_SERVICES.length - up} dịch vụ đang suy giảm hiệu năng`}
            </h2>
            <p className="mt-2 text-sm text-white/60">Kiểm tra lần cuối lúc {checkedAt.toLocaleTimeString('vi-VN')} · region ap-southeast-1 · build 1.4.2</p>
            <dl className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: 'Đang chạy', v: `${up}/${MOCK_SERVICES.length}` },
                { k: 'Uptime 30 ngày', v: '99,94%' },
                { k: 'Độ trễ TB', v: `${avgLatency} ms` },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
                  <dt className="text-[11px] text-white/50">{x.k}</dt>
                  <dd className="mt-1 font-display text-lg font-extrabold tabular-nums md:text-xl">{x.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-semibold text-white/60">Lịch sử 30 ngày</p>
            <div className="flex h-14 items-end gap-[3px]">
              {Array.from({ length: 30 }).map((_, i) => (
                <span
                  key={i}
                  title={`Ngày -${29 - i}`}
                  className={cn('flex-1 rounded-sm', i === 25 ? 'h-3/5 bg-amber-400' : i === 12 ? 'h-2/5 bg-rose-500' : 'h-full bg-emerald-400/80')}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-white/40">
              <span>30 ngày trước</span>
              <span>Hôm nay</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dịch vụ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_SERVICES.map((s) => {
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
                  <p className="text-[12px] text-slate-500">Uptime</p>
                  <p className="font-display text-xl font-extrabold tabular-nums text-slate-900">{s.uptime}</p>
                </div>
              </div>
              <Meter value={uptimeNum(s.uptime)} tone={m.meter} className="mt-3" />
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Tài nguyên máy chủ" sub="orbi-prod-01 · Ubuntu 22.04 · ap-southeast-1" icon={Cpu} tone="indigo">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {RESOURCES.map((r) => (
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
        <Panel title="Nhật ký sự cố" sub="7 ngày gần nhất" icon={AlertTriangle} tone="amber">
          <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-slate-200">
            {INCIDENTS.map((it) => (
              <li key={it.id} className="relative flex gap-3">
                <IconTile icon={it.icon} tone={it.tone} size="sm" className="relative ring-4 ring-white" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{it.title}</p>
                  <p className="text-[13px] text-slate-500">{it.description}</p>
                  <p className="mt-0.5 text-[12px] text-slate-400">{it.time}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
};
