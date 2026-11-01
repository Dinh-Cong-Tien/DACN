import React, { useState } from 'react';
import { BarChart3, Activity, Users, FileText, Clock, Monitor, Smartphone, Tablet } from 'lucide-react';
import { ADMIN_TRAFFIC, ADMIN_SIGNUPS } from '@/shared/mocks';
import { formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Card, CardHeader, Column, DataTable, PageHeader, Segmented, StatCard, Tone } from '@/shared/components/ui';
import { BarChart, HBarChart, LineChart } from '@/shared/components/charts/Charts';

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
  { key: 'path', header: 'Trang', render: (r) => <span className="font-mono text-xs text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded">{r.path}</span> },
  { key: 'views', header: 'Lượt xem', align: 'right', render: (r) => <span className="font-mono font-bold text-slate-900">{formatNumber(r.views)}</span> },
  { key: 'avgTime', header: 'TG trung bình', align: 'right', render: (r) => <span className="text-xs font-mono text-slate-600">{r.avgTime}</span> },
];

export const AdminAnalyticsPage: React.FC = () => {
  useDocumentTitle('Thống kê truy cập');
  const [range, setRange] = useState('7');
  const mult = range === '30' ? 4.2 : 1;
  const traffic = Math.round(ADMIN_TRAFFIC.reduce((a, b) => a + b.value, 0) * mult);

  const devices: { label: string; value: number; icon: React.ReactNode; tone: Tone }[] = [
    { label: 'Desktop', value: 54, icon: <Monitor className="w-4 h-4" />, tone: 'indigo' },
    { label: 'Mobile', value: 38, icon: <Smartphone className="w-4 h-4" />, tone: 'violet' },
    { label: 'Tablet', value: 8, icon: <Tablet className="w-4 h-4" />, tone: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Thống kê <span className="mark">truy cập</span>
          </>
        }
        icon={<BarChart3 />}
        description="Lưu lượng, người dùng hoạt động và hành vi học tập trên toàn hệ thống. Nguồn: nhật ký API Gateway."
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
        <Card hard className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Lượt truy cập theo ngày" subtitle={range === '7' ? 'Tuần hiện tại, so với tuần trước' : '30 ngày gần nhất (theo tuần), so với kỳ trước'} />
          <LineChart
            ariaLabel="Lượt truy cập theo ngày"
            labels={ADMIN_TRAFFIC.map((d) => d.label)}
            series={[
              { name: range === '7' ? 'Tuần này' : 'Kỳ này', values: ADMIN_TRAFFIC.map((d) => Math.round(d.value * mult)) },
              { name: range === '7' ? 'Tuần trước' : 'Kỳ trước', values: ADMIN_TRAFFIC.map((d, i) => Math.round(d.value * mult * (0.86 + (i % 3) * 0.04))) },
            ]}
            height={250}
            format={(v) => formatNumber(v)}
          />
        </Card>
        <Card hard className="animate-fade-up" style={{ animationDelay: '80ms' }}>
          <CardHeader title="Thiết bị truy cập" subtitle="% phiên theo loại thiết bị" />
          <HBarChart ariaLabel="Tỷ lệ thiết bị truy cập" data={devices.map((d) => ({ label: d.label, value: d.value }))} max={100} unit="%" labelWidth={80} />
          <div className="mt-6 border-t border-slate-200 pt-4">
            <CardHeader title="Lượt làm đề theo kỳ thi" subtitle="% số lượt làm đề" />
            <HBarChart ariaLabel="Tỷ lệ lượt làm đề theo kỳ thi" data={[{ label: 'TOEIC', value: 68 }, { label: 'VSTEP', value: 32 }]} max={100} unit="%" labelWidth={80} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card hard className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <CardHeader title="Đăng ký mới theo tháng" subtitle="12 tháng gần nhất" />
          <BarChart ariaLabel="Số tài khoản đăng ký mới theo tháng" data={ADMIN_SIGNUPS.map((v, i) => ({ label: `T${((i + 11) % 12) + 1}`, value: v }))} height={240} unit=" tài khoản" />
        </Card>
        <Card hard className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <CardHeader title="Trang được xem nhiều nhất" subtitle="Lượt xem trong kỳ" />
          <HBarChart ariaLabel="Trang được xem nhiều nhất" data={TOP_PAGES.map((p) => ({ label: p.path, value: Math.round(p.views * mult) }))} format={(v) => formatNumber(v)} labelWidth={130} />
          <DataTable<PageRow> columns={columns} rows={TOP_PAGES} dense className="mt-5" />
        </Card>
      </div>
    </div>
  );
};
