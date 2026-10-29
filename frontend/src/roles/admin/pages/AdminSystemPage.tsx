import React, { useState } from 'react';
import { Activity, RefreshCw, Cpu, MemoryStick, HardDrive, Database, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { MOCK_SERVICES } from '@/shared/mocks';
import type { ServiceStatus } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, PageHeader, ProgressBar, Timeline, Tone } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';

const STATUS_META: Record<ServiceStatus['status'], { tone: Tone; label: string; led: string }> = {
  UP: { tone: 'emerald', label: 'OPERATIONAL', led: 'bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse' },
  DEGRADED: { tone: 'amber', label: 'DEGRADED', led: 'bg-amber-300 shadow-[0_0_12px_#fcd34d]' },
  DOWN: { tone: 'rose', label: 'OUTAGE', led: 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' },
};

const RESOURCES: { label: string; value: number; icon: React.ReactNode; detail: string }[] = [
  { label: 'CPU', value: 42, icon: <Cpu />, detail: '4 vCPU · load 1.7' },
  { label: 'RAM', value: 63, icon: <MemoryStick />, detail: '5.1 / 8 GB' },
  { label: 'Disk', value: 71, icon: <HardDrive />, detail: '142 / 200 GB' },
  { label: 'DB connections', value: 28, icon: <Database />, detail: '28 / 100 pool' },
];

const INCIDENTS = [
  { id: 'i1', title: 'Media Storage phản hồi chậm', description: 'Độ trễ CDN tăng lên 310 ms, đang theo dõi.', time: '09:12 hôm nay', tone: 'amber' as Tone, icon: <AlertTriangle /> },
  { id: 'i2', title: 'Sao lưu CSDL hoàn tất', description: 'orbilingo_prod · 1.8 GB · 02:00', time: 'Hôm nay', tone: 'emerald' as Tone, icon: <CheckCircle2 /> },
  { id: 'i3', title: 'Triển khai API v1.4.2', description: 'Không downtime, 14 endpoint cập nhật.', time: '2 ngày trước', tone: 'indigo' as Tone, icon: <Info /> },
  { id: 'i4', title: 'Email Service gián đoạn 6 phút', description: 'SMTP relay timeout, đã tự phục hồi.', time: '5 ngày trước', tone: 'rose' as Tone, icon: <AlertTriangle /> },
];

export const AdminSystemPage: React.FC = () => {
  useDocumentTitle('Trạng thái dịch vụ');
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState(new Date());
  const up = MOCK_SERVICES.filter((s) => s.status === 'UP').length;
  const allUp = up === MOCK_SERVICES.length;

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
      <PageHeader
        title={
          <>
            Trạng thái <span className="mark">dịch vụ</span>
          </>
        }
        icon={<Activity />}
        description={`Kiểm tra lần cuối lúc ${checkedAt.toLocaleTimeString('vi-VN')} · Giám sát API, CSDL, cache, lưu trữ media và các job nền.`}
        actions={
          <Button leftIcon={<RefreshCw className={cn('w-4 h-4', checking && 'animate-spin')} />} onClick={recheck} loading={checking}>
            Kiểm tra lại
          </Button>
        }
      />

      {/* Bảng trạng thái tổng */}
      <Card hard tone="ink" padding="sm" className="flex flex-col md:flex-row md:items-center gap-4 animate-fade-down">
        <div className="flex items-center gap-4 flex-1">
          <span className={cn('w-4 h-4 rounded-full shrink-0', allUp ? STATUS_META.UP.led : STATUS_META.DEGRADED.led)} />
          <div>
            <p className="font-display font-bold text-lg">{allUp ? 'Tất cả hệ thống hoạt động bình thường' : `${MOCK_SERVICES.length - up} dịch vụ đang suy giảm hiệu năng`}</p>
            <p className="text-xs text-slate-400 font-mono">
              {up}/{MOCK_SERVICES.length} UP · uptime 30d 99.94% · region ap-southeast-1 · build 1.4.2+ab12cd
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 md:pr-2">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className={cn('w-1.5 h-6 rounded-sm', i === 25 ? 'bg-amber-300' : i === 12 ? 'bg-rose-500' : 'bg-emerald-400')} title={`Ngày -${29 - i}`} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MOCK_SERVICES.map((s, i) => {
          const m = STATUS_META[s.status];
          return (
            <Card key={s.name} hard hover className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn('w-3.5 h-3.5 rounded-full border-2 border-slate-900 shrink-0', m.led)} />
                  <div>
                    <p className="font-display font-bold text-slate-900">{s.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{s.description}</p>
                  </div>
                </div>
                <Badge tone={m.tone} size="xs" solid={s.status !== 'UP'}>
                  {m.label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t-2 border-dashed border-slate-200">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Độ trễ</p>
                  <p className={cn('font-mono text-xl font-bold', s.latencyMs > 250 ? 'text-amber-700' : 'text-slate-900')}>
                    {s.latencyMs} <span className="text-xs font-semibold text-slate-400">ms</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Uptime</p>
                  <p className="font-mono text-xl font-bold text-slate-900">{s.uptime}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card hard className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Tài nguyên máy chủ" subtitle="orbi-prod-01 · Ubuntu 22.04 · ap-southeast-1" icon={<Cpu />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RESOURCES.map((r) => (
              <div key={r.label} className="p-4 rounded-2xl border-2 border-slate-900/10 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-indigo-700">
                    {r.icon} {r.label}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900">{r.value}%</span>
                </div>
                <ProgressBar value={r.value} tone={r.value > 80 ? 'rose' : r.value > 60 ? 'amber' : 'emerald'} />
                <p className="text-[11px] text-slate-500 mt-2 font-mono">{r.detail}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card hard tone="cream" className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <CardHeader title="Nhật ký sự cố" subtitle="7 ngày gần nhất" icon={<AlertTriangle />} />
          <Timeline items={INCIDENTS} />
        </Card>
      </div>
    </div>
  );
};
