import React, { useState } from 'react';
import { Activity, Users, FileText, Clock, Monitor, TrendingUp, TrendingDown, UserPlus, Eye, PieChart } from 'lucide-react';
import { useAdminAnalytics } from '@/shared/api/admin';
import { cn, formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { BarChart, HBarChart, LineChart } from '@/shared/components/charts/Charts';
import { Figures, Panel, TPageHead, tbl } from '@/roles/teacher/components/TeacherKit';

const Delta: React.FC<{ v: number }> = ({ v }) => (
  <span className="inline-flex items-center gap-1">
    <span className={cn('inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold', v >= 0 ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-600')}>
      {v >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {v >= 0 ? '+' : ''}
      {v}%
    </span>
    so với kỳ trước
  </span>
);

const ROLE_VI: Record<string, string> = { STUDENT: 'Học viên', TEACHER: 'Giáo viên', HEAD_TEACHER: 'Trưởng bộ môn', ADMIN: 'Quản trị viên' };
const pct = (a: number, total: number) => (total ? Math.round((a / total) * 100) : 0);
const Empty: React.FC<{ text?: string }> = ({ text = 'Chưa có dữ liệu trong kỳ này.' }) => <p className="py-10 text-center text-sm text-slate-500">{text}</p>;

export const AdminAnalyticsPage: React.FC = () => {
  useDocumentTitle('Thống kê truy cập');
  const [range, setRange] = useState<'7' | '30'>('7');
  const { data, isLoading } = useAdminAnalytics(Number(range));
  const f = data?.figures;
  const daily = data?.daily ?? [];
  const hasDaily = daily.some((d) => d.active || d.prevActive);
  const devices = data?.devices ?? { desktop: 0, mobile: 0, tablet: 0 };
  const devTotal = devices.desktop + devices.mobile + devices.tablet;
  const exams = data?.attemptsByExam ?? { TOEIC: 0, VSTEP: 0 };
  const examTotal = exams.TOEIC + exams.VSTEP;
  const roles = Object.entries(data?.roles ?? {}).map(([k, v]) => ({ label: ROLE_VI[k] ?? k, value: v ?? 0 }));

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Toàn hệ thống · dữ liệu học tập thật"
        title="Thống kê truy cập"
        sub="Người dùng hoạt động, thời gian học và lượt làm bài trên toàn hệ thống, tổng hợp từ nhật ký học tập hằng ngày."
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
          { label: 'Người dùng hoạt động', value: formatNumber(f?.activeUsers.value ?? 0), icon: Users, tone: 'indigo', note: <Delta v={f?.activeUsers.change ?? 0} /> },
          { label: 'Phút học', value: formatNumber(f?.studyMinutes.value ?? 0), icon: Activity, tone: 'sky', note: <Delta v={f?.studyMinutes.change ?? 0} /> },
          { label: 'Lượt làm bài', value: formatNumber(f?.attempts.value ?? 0), icon: FileText, tone: 'violet', note: <Delta v={f?.attempts.change ?? 0} /> },
          { label: 'Thời gian TB / phiên', value: `${f?.avgSessionMin.value ?? 0}m`, icon: Clock, tone: 'emerald', note: 'phút học / lượt hoạt động' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Người dùng hoạt động theo ngày" sub={range === '7' ? 'Tuần hiện tại, so với tuần trước' : '30 ngày gần nhất, so với kỳ trước'} icon={Activity} tone="sky">
          {isLoading ? (
            <Empty text="Đang tải…" />
          ) : hasDaily ? (
            <LineChart
              ariaLabel="Người dùng hoạt động theo ngày"
              labels={daily.map((d) => d.label)}
              series={[
                { name: 'Kỳ này', values: daily.map((d) => d.active) },
                { name: 'Kỳ trước', values: daily.map((d) => d.prevActive) },
              ]}
              height={260}
              format={(v) => formatNumber(v)}
            />
          ) : (
            <Empty text="Chưa có hoạt động học tập nào được ghi nhận trong kỳ." />
          )}
        </Panel>
        <div className="grid gap-6">
          <Panel title="Thiết bị làm bài" sub="% lượt làm bài theo loại thiết bị" icon={Monitor} tone="indigo">
            {devTotal ? (
              <HBarChart ariaLabel="Tỷ lệ thiết bị" data={[{ label: 'Máy tính', value: pct(devices.desktop, devTotal) }, { label: 'Điện thoại', value: pct(devices.mobile, devTotal) }, { label: 'Máy tính bảng', value: pct(devices.tablet, devTotal) }]} max={100} unit="%" labelWidth={100} />
            ) : (
              <Empty />
            )}
          </Panel>
          <Panel title="Lượt làm đề theo kỳ thi" sub="% số lượt làm đề" icon={PieChart} tone="violet">
            {examTotal ? <HBarChart ariaLabel="Tỷ lệ lượt làm đề theo kỳ thi" data={[{ label: 'TOEIC', value: pct(exams.TOEIC, examTotal) }, { label: 'VSTEP', value: pct(exams.VSTEP, examTotal) }]} max={100} unit="%" labelWidth={100} /> : <Empty />}
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Đăng ký mới theo tháng" sub="12 tháng gần nhất" icon={UserPlus} tone="emerald">
          {data?.signupsMonthly.values.some(Boolean) ? (
            <BarChart ariaLabel="Số tài khoản đăng ký mới theo tháng" data={data.signupsMonthly.labels.map((label, i) => ({ label, value: data.signupsMonthly.values[i] }))} height={260} unit=" tài khoản" />
          ) : (
            <Empty />
          )}
        </Panel>
        <Panel flush title="Chi tiết theo ngày" sub="Người hoạt động · phút học · số câu đã làm" icon={Eye} tone="amber">
          <div className="p-5 pb-3">
            {roles.length ? <HBarChart ariaLabel="Tài khoản theo vai trò" data={roles} format={(v) => formatNumber(v)} labelWidth={120} /> : <Empty />}
          </div>
          <div className="max-h-[320px] overflow-auto">
            <table className={cn(tbl.table, 'border-t border-slate-100')}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Ngày</th>
                  <th className={cn(tbl.th, 'text-right')}>Hoạt động</th>
                  <th className={cn(tbl.th, 'text-right')}>Phút học</th>
                  <th className={cn(tbl.th, 'text-right')}>Số câu</th>
                </tr>
              </thead>
              <tbody>
                {[...daily].reverse().map((r) => (
                  <tr key={r.date} className={tbl.tr}>
                    <td className={cn(tbl.td, 'tabular-nums text-slate-700')}>{r.date.split('-').reverse().join('/')}</td>
                    <td className={cn(tbl.td, 'text-right font-semibold tabular-nums text-slate-900')}>{formatNumber(r.active)}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{formatNumber(r.minutes)}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{formatNumber(r.questions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};
