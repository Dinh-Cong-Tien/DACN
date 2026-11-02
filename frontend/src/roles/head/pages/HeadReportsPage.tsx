import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BarChart3, CalendarCheck, CheckCircle2, Download, LineChart as LineIcon, School, Table2, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { HEAD_MONTHLY, MOCK_CLASS_REPORTS, MOCK_SUBJECTS, teacherByName } from '@/shared/mocks';
import { BarChart, HBarChart, LineChart } from '@/shared/components/charts/Charts';
import type { ClassReport } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Figures, Meter, Panel, TBtn, TPageHead, inputCls, tbl } from '@/roles/teacher/components/TeacherKit';

const GRADE_CLS: Record<ClassReport['grade'], string> = { A: 'bg-emerald-500/10 text-emerald-700', B: 'bg-sky-500/10 text-sky-700', C: 'bg-amber-500/15 text-amber-800', D: 'bg-rose-500/10 text-rose-700' };
const GRADE_LABEL: Record<ClassReport['grade'], string> = { A: 'Xuất sắc', B: 'Khá', C: 'Trung bình', D: 'Cần cải thiện' };

export const HeadReportsPage: React.FC = () => {
  useDocumentTitle('Báo cáo tổng kết');
  const [subject, setSubject] = useState('');
  const rows = MOCK_CLASS_REPORTS.filter((r) => !subject || (subject.includes('VSTEP') ? r.avgScore <= 10 : r.avgScore > 10));
  const grades = (['A', 'B', 'C', 'D'] as const).map((g) => ({ g, n: rows.filter((r) => r.grade === g).length }));
  const totalStudents = rows.reduce((a, r) => a + r.students, 0);
  const avgAttendance = rows.length ? Math.round(rows.reduce((a, r) => a + r.attendance, 0) / rows.length) : 0;

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Học kỳ 1 · 2026–2027"
        title="Báo cáo tổng kết"
        sub="Điểm số, chuyên cần và xếp loại học tập các lớp trong bộ môn."
        actions={
          <>
            <select aria-label="Môn học" className={cn(inputCls, 'w-56')} value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Tất cả môn học</option>
              {MOCK_SUBJECTS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <TBtn variant="primary" icon={<Download />} onClick={() => toast.info('Đang xuất báo cáo', 'File PDF sẽ được tải xuống trong giây lát.')}>
              Xuất báo cáo
            </TBtn>
          </>
        }
      />

      <Figures
        items={[
          { label: 'Lớp', value: rows.length, note: `${grades[0].n} lớp xếp loại A`, icon: School, tone: 'amber' },
          { label: 'Học viên', value: totalStudents, note: 'đang theo học', icon: Users, tone: 'indigo' },
          { label: 'Chuyên cần TB', value: `${avgAttendance}%`, note: 'từ đầu học kỳ', icon: CheckCircle2, tone: 'emerald' },
          { label: 'Lớp tiến bộ', value: rows.filter((r) => r.trend > 0).length, note: 'xu hướng điểm tăng', icon: TrendingUp, tone: 'sky' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Điểm TOEIC trung bình theo lớp" sub="Bài thi thử gần nhất · thang 990" icon={BarChart3} tone="indigo">
          <BarChart ariaLabel="Điểm TOEIC trung bình theo lớp" data={rows.filter((r) => r.avgScore > 10).map((r) => ({ label: r.className.replace('TOEIC ', '').replace('Ngữ pháp nền tảng ', 'NP ').replace(' Intensive', '').replace('Foundation Sáng', 'Found.'), value: r.avgScore }))} height={240} unit=" điểm" />
        </Panel>
        <Panel title="Phân bố xếp loại" sub={`Số lớp theo xếp loại · ${rows.length} lớp`} icon={Award} tone="amber">
          <ul className="space-y-4">
            {grades.map(({ g, n }) => (
              <li key={g} className="flex items-center gap-3">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-extrabold', GRADE_CLS[g])}>{g}</span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-slate-700">{GRADE_LABEL[g]}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{n} lớp</span>
                  </div>
                  <Meter value={rows.length ? (n / rows.length) * 100 : 0} tone={g === 'A' ? 'green' : g === 'D' ? 'red' : g === 'C' ? 'amber' : 'indigo'} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Chuyên cần theo lớp" sub="% buổi có mặt từ đầu học kỳ" icon={CalendarCheck} tone="emerald">
          <HBarChart ariaLabel="Chuyên cần theo lớp" data={[...rows].sort((a, b) => b.attendance - a.attendance).map((r) => ({ label: r.className, value: r.attendance }))} max={100} unit="%" labelWidth={150} />
        </Panel>
        <Panel title="Chuyên cần và hoàn thành bài tập" sub="Trung bình toàn bộ môn theo tháng" icon={LineIcon} tone="violet">
          <LineChart
            ariaLabel="Chuyên cần và hoàn thành bài tập theo tháng"
            labels={HEAD_MONTHLY.labels}
            series={[
              { name: 'Chuyên cần', values: HEAD_MONTHLY.attendance },
              { name: 'Hoàn thành bài tập', values: HEAD_MONTHLY.completion },
            ]}
            min={50}
            max={100}
            unit="%"
          />
        </Panel>
      </div>

      <Panel title="Chi tiết từng lớp" sub={`${rows.length} lớp`} icon={Table2} tone="sky" flush>
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Lớp</th>
                <th className={cn(tbl.th, 'text-center')}>Học viên</th>
                <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                <th className={cn(tbl.th, 'w-48')}>Chuyên cần</th>
                <th className={tbl.th}>Xếp loại</th>
                <th className={cn(tbl.th, 'text-right')}>Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.classId} className={tbl.tr}>
                  <td className={tbl.td}>
                    <div className="flex items-center gap-3">
                      <Avatar name={r.teacher} src={teacherByName(r.teacher)?.avatarUrl} size="sm" />
                      <div className="min-w-0">
                        <Link to={`/head/classes/${r.classId}`} className="block whitespace-nowrap font-semibold text-slate-900 hover:text-indigo-700">
                          {r.className}
                        </Link>
                        <p className="whitespace-nowrap text-xs text-slate-500">{r.teacher}</p>
                      </div>
                    </div>
                  </td>
                  <td className={cn(tbl.td, 'text-center tabular-nums')}>{r.students}</td>
                  <td className={cn(tbl.td, 'text-right font-semibold tabular-nums text-slate-900')}>{r.avgScore}</td>
                  <td className={tbl.td}>
                    <div className="flex min-w-[120px] items-center gap-2">
                      <Meter value={r.attendance} tone={r.attendance >= 85 ? 'green' : r.attendance >= 75 ? 'amber' : 'red'} className="flex-1" />
                      <span className="w-9 text-right text-xs tabular-nums text-slate-600">{r.attendance}%</span>
                    </div>
                  </td>
                  <td className={tbl.td}>
                    <span className={cn('whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold', GRADE_CLS[r.grade])}>
                      {r.grade} · {GRADE_LABEL[r.grade]}
                    </span>
                  </td>
                  <td className={cn(tbl.td, 'text-right')}>
                    <span className={cn('inline-flex items-center gap-0.5 text-xs font-bold', r.trend >= 0 ? 'text-emerald-700' : 'text-rose-600')}>
                      {r.trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {Math.abs(r.trend)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
