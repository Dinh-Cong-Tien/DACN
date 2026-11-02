import React, { useState } from 'react';
import { Activity, Users, FileText, Clock, Monitor, TrendingUp, UserPlus, Eye, PieChart } from 'lucide-react';
import { ADMIN_TRAFFIC, ADMIN_SIGNUPS } from '@/shared/mocks';
import { cn, formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { BarChart, HBarChart, LineChart } from '@/shared/components/charts/Charts';
import { Figures, Panel, TPageHead, tbl } from '@/roles/teacher/components/TeacherKit';

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

const Delta: React.FC<{ v: number }> = ({ v }) => (
  <span className="inline-flex items-center gap-1">
    <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-700">
      <TrendingUp className="h-3 w-3" />+{v}%
    </span>
    so với kỳ trước
  </span>
);

export const AdminAnalyticsPage: React.FC = () => {
  useDocumentTitle('Thống kê truy cập');
  const [range, setRange] = useState<'7' | '30'>('7');
  const mult = range === '30' ? 4.2 : 1;
  const traffic = Math.round(ADMIN_TRAFFIC.reduce((a, b) => a + b.value, 0) * mult);

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Toàn hệ thống · nguồn API Gateway"
        title="Thống kê truy cập"
        sub="Lưu lượng, người dùng hoạt động và hành vi học tập trên toàn hệ thống."
        actions={
          <div role="tablist" className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(['7', '30'] as const).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={cn('h-8 rounded-lg px-3.5 text-[13px] font-semibold transition-colors', range === r ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900')}
              >
                {r} ngày
              </button>
            ))}
          </div>
        }
      />

      <Figures
        items={[
          { label: 'Lượt truy cập', value: formatNumber(traffic), icon: Activity, tone: 'sky', note: <Delta v={8} /> },
          { label: 'Người dùng hoạt động', value: formatNumber(Math.round(1240 * mult)), icon: Users, tone: 'indigo', note: <Delta v={5} /> },
          { label: 'Đề thi đã làm', value: formatNumber(Math.round(3860 * mult)), icon: FileText, tone: 'violet', note: <Delta v={11} /> },
          { label: 'Thời gian TB / phiên', value: '24m', icon: Clock, tone: 'emerald', note: <Delta v={3} /> },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Lượt truy cập theo ngày" sub={range === '7' ? 'Tuần hiện tại, so với tuần trước' : '30 ngày gần nhất (theo tuần), so với kỳ trước'} icon={Activity} tone="sky">
          <LineChart
            ariaLabel="Lượt truy cập theo ngày"
            labels={ADMIN_TRAFFIC.map((d) => d.label)}
            series={[
              { name: range === '7' ? 'Tuần này' : 'Kỳ này', values: ADMIN_TRAFFIC.map((d) => Math.round(d.value * mult)) },
              { name: range === '7' ? 'Tuần trước' : 'Kỳ trước', values: ADMIN_TRAFFIC.map((d, i) => Math.round(d.value * mult * (0.86 + (i % 3) * 0.04))) },
            ]}
            height={260}
            format={(v) => formatNumber(v)}
          />
        </Panel>
        <div className="grid gap-6">
          <Panel title="Thiết bị truy cập" sub="% phiên theo loại thiết bị" icon={Monitor} tone="indigo">
            <HBarChart ariaLabel="Tỷ lệ thiết bị truy cập" data={[{ label: 'Máy tính', value: 54 }, { label: 'Điện thoại', value: 38 }, { label: 'Máy tính bảng', value: 8 }]} max={100} unit="%" labelWidth={100} />
          </Panel>
          <Panel title="Lượt làm đề theo kỳ thi" sub="% số lượt làm đề" icon={PieChart} tone="violet">
            <HBarChart ariaLabel="Tỷ lệ lượt làm đề theo kỳ thi" data={[{ label: 'TOEIC', value: 68 }, { label: 'VSTEP', value: 32 }]} max={100} unit="%" labelWidth={100} />
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Đăng ký mới theo tháng" sub="12 tháng gần nhất" icon={UserPlus} tone="emerald">
          <BarChart ariaLabel="Số tài khoản đăng ký mới theo tháng" data={ADMIN_SIGNUPS.map((v, i) => ({ label: `T${((i + 11) % 12) + 1}`, value: v }))} height={260} unit=" tài khoản" />
        </Panel>
        <Panel flush title="Trang được xem nhiều nhất" sub="Lượt xem trong kỳ" icon={Eye} tone="amber">
          <div className="p-5 pb-3">
            <HBarChart ariaLabel="Trang được xem nhiều nhất" data={TOP_PAGES.map((p) => ({ label: p.path, value: Math.round(p.views * mult) }))} format={(v) => formatNumber(v)} labelWidth={130} />
          </div>
          <table className={cn(tbl.table, 'border-t border-slate-100')}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Trang</th>
                <th className={cn(tbl.th, 'text-right')}>Lượt xem</th>
                <th className={cn(tbl.th, 'text-right')}>TG trung bình</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PAGES.map((r, i) => (
                <tr key={r.id} className={tbl.tr}>
                  <td className={tbl.td}>
                    <span className="mr-2 inline-block w-4 text-[12px] tabular-nums text-slate-400">{i + 1}</span>
                    <code className="rounded-md bg-indigo-500/[0.07] px-1.5 py-0.5 font-mono text-[12px] text-indigo-700">{r.path}</code>
                  </td>
                  <td className={cn(tbl.td, 'text-right font-semibold tabular-nums text-slate-900')}>{formatNumber(Math.round(r.views * mult))}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums text-slate-500')}>{r.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
};
