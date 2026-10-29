import React, { useState } from 'react';
import { Activity, RefreshCw, Cpu, MemoryStick, HardDrive, Database, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { MOCK_SERVICES } from '@/shared/mocks';
import type { ServiceStatus } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, PageHeader, ProgressBar, Timeline, Tone } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';

const STATUS_META: Record<ServiceStatus['status'], { tone: Tone; label: string; dot: string }> = {
  UP: { tone: 'emerald', label: 'Hoạt động', dot: 'bg-emerald-500 animate-pulse' },
  DEGRADED: { tone: 'amber', label: 'Suy giảm', dot: 'bg-amber-500' },
  DOWN: { tone: 'rose', label: 'Ngừng', dot: 'bg-rose-500' },
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
        title="Trạng thái dịch vụ"
        icon={<Activity />}
        description={`Kiểm tra lần cuối lúc ${checkedAt.toLocaleTimeString('vi-VN')}. Giám sát API, CSDL, cache, lưu trữ media và các job nền.`}
        actions={
          <Button leftIcon={<RefreshCw className={cn('w-4 h-4', checking && 'animate-spin')} />} onClick={recheck} loading={checking}>
            Kiểm tra lại
          </Button>
        }
      />

      <Card className={cn('flex items-center gap-4 animate-fade-down', up === MOCK_SERVICES.length ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50')} padding="sm">
        <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white', up === MOCK_SERVICES.length ? 'bg-emerald-500' : 'bg-amber-500')}>
          {up === MOCK_SERVICES.length ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </span>
        <div>
          <p className="font-bold text-slate-900">{up === MOCK_SERVICES.length ? 'Tất cả hệ thống hoạt động bình thường' : `${MOCK_SERVICES.length - up} dịch vụ đang suy giảm hiệu năng`}</p>
          <p className="text-xs text-slate-500">
            {up}/{MOCK_SERVICES.length} dịch vụ UP · uptime 30 ngày 99.94%
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MOCK_SERVICES.map((s, i) => {
          const m = STATUS_META[s.status];
          return (
            <Card key={s.name} className="animate-fade-up card-hover" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex w-3 h-3">
                    <span className={cn('absolute inline-flex w-full h-full rounded-full opacity-60', s.status === 'UP' && 'bg-emerald-400 animate-pulse-ring')} />
                    <span className={cn('relative inline-flex w-3 h-3 rounded-full', m.dot)} />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-[11px] text-slate-500">{s.description}</p>
                  </div>
                </div>
                <Badge tone={m.tone} size="xs">
                  {m.label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Độ trễ</p>
                  <p className={cn('text-lg font-black', s.latencyMs > 250 ? 'text-amber-600' : 'text-slate-900')}>
                    {s.latencyMs} <span className="text-xs font-semibold text-slate-400">ms</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Uptime</p>
                  <p className="text-lg font-black text-slate-900">{s.uptime}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Tài nguyên máy chủ" subtitle="Server chính · ap-southeast-1" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {RESOURCES.map((r) => (
              <div key={r.label} className="p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-800 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-indigo-600">
                    {r.icon} {r.label}
                  </span>
                  <span className="text-sm font-black text-slate-900">{r.value}%</span>
                </div>
                <ProgressBar value={r.value} tone={r.value > 80 ? 'rose' : r.value > 60 ? 'amber' : 'emerald'} />
                <p className="text-[11px] text-slate-400 mt-2">{r.detail}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <CardHeader title="Nhật ký sự cố" subtitle="7 ngày gần nhất" />
          <Timeline items={INCIDENTS} />
        </Card>
      </div>
    </div>
  );
};
