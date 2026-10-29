import React, { useState } from 'react';
import { BarChart3, Activity, Users, FileText, Clock, Monitor, Smartphone, Tablet } from 'lucide-react';
import { ADMIN_TRAFFIC, ADMIN_SIGNUPS } from '@/shared/mocks';
import { formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Card, CardHeader, Column, DataTable, MiniBars, PageHeader, ProgressBar, RingProgress, Segmented, Sparkline, StatCard, Tone } from '@/shared/components/ui';

interface PageRow {
  id: string;
  path: string;
  views: number;
  avgTime: string;
}

const TOP_PAGES: PageRow[] = [
  { id: 'p1', path: '/mock-tests', views: 8420, avgTime: '4:12' },
  { id: 'p2', path: '/app/dashboard', views: 7310, avgTime: '2:48' },
  { id: 'p3', path: '/app/practice', views: 6105, avgTime: '9:31' },
  { id: 'p4', path: '/', views: 5890, avgTime: '1:22' },
  { id: 'p5', path: '/score-converter', views: 3240, avgTime: '1:05' },
  { id: 'p6', path: '/blog', views: 2715, avgTime: '3:40' },
];

const columns: Column<PageRow>[] = [
  { key: 'path', header: 'Trang', render: (r) => <span className="font-mono text-xs text-indigo-700">{r.path}</span> },
  { key: 'views', header: 'Lượt xem', align: 'right', render: (r) => <span className="font-bold text-slate-800">{formatNumber(r.views)}</span> },
  { key: 'avgTime', header: 'TG trung bình', align: 'right', render: (r) => <span className="text-xs text-slate-500">{r.avgTime}</span> },
];

export const AdminAnalyticsPage: React.FC = () => {
  useDocumentTitle('Thống kê truy cập');
  const [range, setRange] = useState('7');
  const mult = range === '30' ? 4.2 : 1;
  const traffic = Math.round(ADMIN_TRAFFIC.reduce((a, b) => a + b.value, 0) * mult);

  const devices: { label: string; value: number; icon: React.ReactNode; tone: Tone }[] = [
    { label: 'Desktop', value: 54, icon: <Monitor className="w-4 h-4" />, tone: 'indigo' },
    { label: 'Mobile', value: 38, icon: <Smartphone className="w-4 h-4" />, tone: 'emerald' },
    { label: 'Tablet', value: 8, icon: <Tablet className="w-4 h-4" />, tone: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thống kê truy cập"
        icon={<BarChart3 />}
        description="Lưu lượng, người dùng hoạt động và hành vi học tập trên toàn hệ thống."
        actions={
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { value: '7', label: '7 ngày' },
              { value: '30', label: '30 ngày' },
            ]}
          />
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Lượt truy cập" value={traffic} icon={<Activity />} tone="sky" delta={8} deltaLabel="so với kỳ trước" format={formatNumber} />
        <StatCard label="Người dùng hoạt động" value={Math.round(1240 * mult)} icon={<Users />} tone="indigo" delta={5} deltaLabel="so với kỳ trước" format={formatNumber} />
        <StatCard label="Đề thi đã làm" value={Math.round(3860 * mult)} icon={<FileText />} tone="violet" delta={11} deltaLabel="so với kỳ trước" format={formatNumber} />
        <StatCard label="Thời gian TB / phiên" value="24m" icon={<Clock />} tone="emerald" delta={3} deltaLabel="so với kỳ trước" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Lượt truy cập theo ngày" subtitle={range === '7' ? 'Tuần hiện tại' : '30 ngày gần nhất (theo tuần)'} />
          <MiniBars data={ADMIN_TRAFFIC.map((d) => ({ ...d, value: Math.round(d.value * mult), tone: 'sky' as Tone }))} height={170} />
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: '80ms' }}>
          <CardHeader title="Đăng ký mới" subtitle="12 tháng gần nhất" />
          <Sparkline data={ADMIN_SIGNUPS} width={280} height={90} tone="indigo" className="w-full" />
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Thiết bị</p>
            {devices.map((d) => (
              <div key={d.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    {d.icon} {d.label}
                  </span>
                  <span className="font-bold">{d.value}%</span>
                </div>
                <ProgressBar value={d.value} size="sm" tone={d.tone} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <CardHeader title="Trang được xem nhiều nhất" subtitle="Theo lượt xem trong kỳ" />
          <DataTable<PageRow> columns={columns} rows={TOP_PAGES} dense />
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <CardHeader title="Tỷ lệ kỳ thi" subtitle="Theo số lượt làm đề" />
          <div className="flex items-center justify-around py-4">
            <div className="text-center">
              <RingProgress value={68} size={110} tone="indigo">
                <div>
                  <p className="text-xl font-black text-slate-900">68%</p>
                </div>
              </RingProgress>
              <p className="text-xs font-bold text-indigo-700 mt-2">TOEIC</p>
            </div>
            <div className="text-center">
              <RingProgress value={32} size={110} tone="emerald">
                <div>
                  <p className="text-xl font-black text-slate-900">32%</p>
                </div>
              </RingProgress>
              <p className="text-xs font-bold text-emerald-700 mt-2">VSTEP</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
