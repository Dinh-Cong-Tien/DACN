import React, { useState } from 'react';
import { BarChart3, Download, School, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_CLASS_REPORTS, MOCK_SUBJECTS } from '@/shared/mocks';
import type { ClassReport } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Badge, Button, Card, CardHeader, Column, DataTable, MiniBars, PageHeader, ProgressBar, Select, StatCard } from '@/shared/components/ui';

const GRADE_TONE: Record<ClassReport['grade'], 'emerald' | 'sky' | 'amber' | 'rose'> = { A: 'emerald', B: 'sky', C: 'amber', D: 'rose' };
const GRADE_LABEL: Record<ClassReport['grade'], string> = { A: 'Xuất sắc', B: 'Khá', C: 'Trung bình', D: 'Cần cải thiện' };

type Row = ClassReport & { id: string };

const columns: Column<Row>[] = [
  { key: 'className', header: 'Lớp', render: (r) => (<div><p className="font-bold text-slate-900">{r.className}</p><p className="text-[11px] text-slate-500">{r.teacher}</p></div>) },
  { key: 'students', header: 'HV', align: 'center' },
  { key: 'avgScore', header: 'Điểm TB', align: 'center', render: (r) => <span className="font-black text-slate-900">{r.avgScore}</span> },
  { key: 'attendance', header: 'Chuyên cần', width: '160px', render: (r) => <ProgressBar value={r.attendance} size="sm" showValue tone={r.attendance >= 85 ? 'emerald' : r.attendance >= 75 ? 'amber' : 'rose'} /> },
  { key: 'grade', header: 'Xếp loại', align: 'center', render: (r) => <Badge tone={GRADE_TONE[r.grade]} solid>{r.grade} · {GRADE_LABEL[r.grade]}</Badge> },
  { key: 'trend', header: 'Xu hướng', align: 'right', render: (r) => <span className={cn('font-bold text-xs', r.trend >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{r.trend >= 0 ? '▲' : '▼'} {Math.abs(r.trend)}%</span> },
];

export const HeadReportsPage: React.FC = () => {
  useDocumentTitle('Báo cáo tổng kết');
  const [subject, setSubject] = useState('');
  const rows = MOCK_CLASS_REPORTS.filter((r) => !subject || (subject.includes('VSTEP') ? r.avgScore <= 10 : r.avgScore > 10));
  const grades = (['A', 'B', 'C', 'D'] as const).map((g) => ({ g, n: rows.filter((r) => r.grade === g).length }));
  const totalStudents = rows.reduce((a, r) => a + r.students, 0);
  const avgAttendance = rows.length ? Math.round(rows.reduce((a, r) => a + r.attendance, 0) / rows.length) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Báo cáo tổng kết" description="Điểm số, chuyên cần và xếp loại học tập các lớp trong bộ môn." icon={<BarChart3 />}
        actions={<><div className="w-56"><Select inputSize="sm" placeholder="Tất cả môn học" options={MOCK_SUBJECTS.map((s) => ({ value: s.name, label: s.name }))} value={subject} onChange={(e) => setSubject(e.target.value)} /></div><Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast.info('Đang xuất báo cáo', 'File PDF sẽ được tải xuống trong giây lát.')}>Xuất báo cáo</Button></>} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Lớp" value={rows.length} icon={<School />} tone="amber" />
        <StatCard label="Học viên" value={totalStudents} icon={<Users />} tone="indigo" />
        <StatCard label="Chuyên cần TB" value={avgAttendance} suffix="%" icon={<CheckCircle2 />} tone="emerald" />
        <StatCard label="Lớp tiến bộ" value={rows.filter((r) => r.trend > 0).length} icon={<TrendingUp />} tone="sky" hint="xu hướng tăng" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Điểm trung bình theo lớp" subtitle="TOEIC quy đổi / VSTEP thang 10" />
          <MiniBars data={rows.map((r) => ({ label: r.className.replace('TOEIC ', '').slice(0, 10), value: r.avgScore, tone: GRADE_TONE[r.grade] }))} height={170} />
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: '80ms' }}>
          <CardHeader title="Phân bố xếp loại" subtitle={`${rows.length} lớp`} />
          <div className="grid grid-cols-2 gap-3">
            {grades.map(({ g, n }, i) => (
              <div key={g} className={`p-4 rounded-2xl border text-center animate-pop bg-${GRADE_TONE[g]}-50 border-${GRADE_TONE[g]}-200`} style={{ animationDelay: `${i * 80}ms` }}>
                <p className={`text-3xl font-black text-${GRADE_TONE[g]}-700`}>{n}</p>
                <p className="text-xs font-bold text-slate-600 mt-1">Loại {g}</p>
                <p className="text-[10px] text-slate-400">{GRADE_LABEL[g]}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <DataTable columns={columns} rows={rows.map((r) => ({ ...r, id: r.classId }))} className="animate-fade-up" />
    </div>
  );
};
