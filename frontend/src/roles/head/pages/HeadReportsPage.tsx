import { academicTerm } from '@/shared/constants/staff';
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Award, BarChart3, CalendarCheck, CheckCircle2, Download, LineChart as LineIcon, School, Table2, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { useHeadReports, useHeadSubjects, useHeadTeachers } from '@/shared/api/head';
import { BarChart, HBarChart, LineChart } from '@/shared/components/charts/Charts';
import type { ClassReport } from '@/shared/types';
import { cn, staffPath, formatNumber } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Figures, Meter, Panel, TBtn, TPageHead, TTabs, inputCls, tbl } from '@/roles/teacher/components/TeacherKit';
import { HeadReportSummary } from './HeadReportSummary';

const GRADE_CLS: Record<NonNullable<ClassReport['grade']>, string> = { A: 'bg-emerald-500/10 text-emerald-700', B: 'bg-sky-500/10 text-sky-700', C: 'bg-amber-500/15 text-amber-800', D: 'bg-rose-500/10 text-rose-700' };
const GRADE_LABEL: Record<NonNullable<ClassReport['grade']>, string> = { A: 'Xuất sắc', B: 'Khá', C: 'Trung bình', D: 'Cần cải thiện' };

export const HeadReportsPage: React.FC = () => {
  useDocumentTitle('Báo cáo tổng kết');
  const [subject, setSubject] = useState('');
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'summary' ? 'summary' : 'classes';
  const [months, setMonths] = useState(6);
  const subjectList = useHeadSubjects().data ?? [];
  const teachers = useHeadTeachers().data ?? [];
  const teacherByName = (name: string) => teachers.find((t) => t.name === name);
  const { data, isLoading } = useHeadReports(6, subject || undefined);
  const rows = data?.classes ?? [];
  const HEAD_MONTHLY = data?.monthly ?? { labels: [], attendance: [], completion: [] };
  const toeicRows = rows.filter((r) => r.examType === 'TOEIC' && r.avgScore > 0);
  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [['Lớp', 'Giáo viên', 'Kỳ thi', 'Học viên', 'Điểm TB', 'Chuyên cần %', 'Hoàn thành bài %', 'Xếp loại', 'Xu hướng %'], ...rows.map((r) => [r.className, r.teacher, r.examType, r.students, r.avgScore, r.attendance, r.completion, r.grade ?? '', r.trend ?? ''])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([String.fromCharCode(0xfeff) + lines.map((l) => l.map(esc).join(',')).join(String.fromCharCode(10))], { type: 'text/csv;charset=utf-8' }));
    a.download = `bao-cao-bo-mon-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('Đã xuất báo cáo', `${rows.length} lớp · tệp CSV mở được bằng Excel.`);
  };
  const grades = (['A', 'B', 'C', 'D'] as const).map((g) => ({ g, n: rows.filter((r) => r.grade === g).length }));
  // Tổng hợp tính ở backend (cùng bộ lọc môn): học viên khác nhau, chuyên cần theo tổng lượt điểm danh
  const totalStudents = data?.summary?.students ?? 0;
  const avgAttendance = data?.summary?.attendanceRate ?? 0;

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow={academicTerm().short}
        title="Báo cáo tổng kết"
        sub="Điểm số, chuyên cần và xếp loại học tập các lớp trong bộ môn; thống kê tổng kết toàn bộ môn bằng biểu đồ."
        actions={
          <>
            {tab === 'summary' && (
              <select aria-label="Giai đoạn" className={cn(inputCls, 'w-40')} value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                <option value={3}>3 tháng</option>
                <option value={6}>6 tháng</option>
                <option value={12}>12 tháng</option>
              </select>
            )}
            <select aria-label="Môn học" className={cn(inputCls, 'w-56')} value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Tất cả môn học</option>
              {subjectList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {tab === 'classes' && (
              <TBtn variant="primary" icon={<Download />} disabled={!rows.length} onClick={exportCsv}>
                Xuất báo cáo
              </TBtn>
            )}
          </>
        }
      />

      <TTabs
        value={tab}
        onChange={(k) => setParams(k === 'classes' ? {} : { tab: k }, { replace: true })}
        items={[
          { key: 'classes', label: 'Báo cáo theo lớp' },
          { key: 'summary', label: 'Thống kê tổng kết' },
        ]}
      />

      {tab === 'summary' ? (
        <HeadReportSummary months={months} departmentId={subject || undefined} />
      ) : (
      <>
      <Figures
        items={[
          { label: 'Lớp', value: rows.length, note: `${grades[0].n} lớp xếp loại A`, icon: School, tone: 'amber' },
          { label: 'Học viên', value: totalStudents, note: 'đang theo học', icon: Users, tone: 'indigo' },
          { label: 'Chuyên cần TB', value: avgAttendance ? `${avgAttendance}%` : '—', note: 'từ các buổi đã điểm danh', icon: CheckCircle2, tone: 'emerald' },
          { label: 'Lớp tiến bộ', value: rows.filter((r) => (r.trend ?? 0) > 0).length, note: 'xu hướng điểm tăng', icon: TrendingUp, tone: 'sky' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Điểm TOEIC trung bình theo lớp" sub="Trung bình bài thi thử đề full · thang 990" icon={BarChart3} tone="indigo">
          {toeicRows.length ? (
            <BarChart ariaLabel="Điểm TOEIC trung bình theo lớp" data={toeicRows.map((r) => ({ label: r.className.replace('TOEIC ', '').replace('Ngữ pháp nền tảng ', 'NP ').replace(' Intensive', '').replace('Foundation Sáng', 'Found.'), value: r.avgScore }))} height={240} unit=" điểm" />
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">{isLoading ? 'Đang tải…' : 'Chưa có điểm thi thử của học viên các lớp TOEIC.'}</p>
          )}
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
        <Panel title="Chuyên cần theo lớp" sub={`% có mặt trên các buổi đã điểm danh${rows.some((r) => !r.hasAttendance) ? ` · ${rows.filter((r) => !r.hasAttendance).length} lớp chưa điểm danh` : ''}`} icon={CalendarCheck} tone="emerald">
          {rows.some((r) => r.hasAttendance) ? (
            <HBarChart ariaLabel="Chuyên cần theo lớp" data={rows.filter((r) => r.hasAttendance).sort((a, b) => b.attendance - a.attendance).map((r) => ({ label: r.className, value: r.attendance }))} max={100} unit="%" labelWidth={150} />
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">Chưa có buổi học nào được điểm danh.</p>
          )}
        </Panel>
        <Panel title="Chuyên cần và hoàn thành bài tập" sub="Trung bình toàn bộ môn theo tháng" icon={LineIcon} tone="violet">
          {HEAD_MONTHLY.attendance.some(Boolean) || HEAD_MONTHLY.completion.some(Boolean) ? (
          <LineChart
            ariaLabel="Chuyên cần và hoàn thành bài tập theo tháng"
            labels={HEAD_MONTHLY.labels}
            series={[
              { name: 'Chuyên cần', values: HEAD_MONTHLY.attendance },
              { name: 'Hoàn thành bài tập', values: HEAD_MONTHLY.completion },
            ]}
            min={0}
            max={100}
            unit="%"
          />
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">Chưa có dữ liệu chuyên cần và bài tập.</p>
          )}
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
                        <Link to={staffPath(`/classes/${r.classId}`)} className="block whitespace-nowrap font-semibold text-slate-900 hover:text-indigo-700">
                          {r.className}
                        </Link>
                        <p className="whitespace-nowrap text-xs text-slate-500">{r.teacher}</p>
                      </div>
                    </div>
                  </td>
                  <td className={cn(tbl.td, 'text-center tabular-nums')}>{r.students}</td>
                  <td className={cn(tbl.td, 'text-right font-semibold tabular-nums text-slate-900')}>{r.avgScore > 0 ? formatNumber(r.avgScore) : <span className="font-normal text-slate-400">—</span>}</td>
                  <td className={tbl.td}>
                    <div className="flex min-w-[120px] items-center gap-2">
                      {r.hasAttendance === false ? (
                        <span className="text-xs text-slate-400">Chưa điểm danh</span>
                      ) : (
                        <>
                          <Meter value={r.attendance} tone={r.attendance >= 85 ? 'green' : r.attendance >= 75 ? 'amber' : 'red'} className="flex-1" />
                          <span className="w-9 text-right text-xs tabular-nums text-slate-600">{r.attendance}%</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className={tbl.td}>
                    {r.grade ? (
                      <span className={cn('whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold', GRADE_CLS[r.grade])}>
                        {r.grade} · {GRADE_LABEL[r.grade]}
                      </span>
                    ) : (
                      <span className="whitespace-nowrap text-xs text-slate-400">Chưa xếp loại</span>
                    )}
                  </td>
                  <td className={cn(tbl.td, 'text-right')}>
                    {r.trend === null ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <span className={cn('inline-flex items-center gap-0.5 text-xs font-bold', r.trend >= 0 ? 'text-emerald-700' : 'text-rose-600')}>
                        {r.trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {Math.abs(r.trend)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      </>
      )}
    </div>
  );
};
