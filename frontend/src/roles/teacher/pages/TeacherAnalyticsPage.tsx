import React, { useState } from 'react';
import { BarChart3, Users, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { MOCK_CLASSES, MOCK_CLASS_STUDENTS, MOCK_ASSIGNMENTS, CLASS_WEEKLY_PROGRESS } from '@/shared/mocks';
import type { ClassStudent } from '@/shared/types';
import { Avatar, Badge, Card, CardHeader, Column, DataTable, MiniBars, PageHeader, ProgressBar, RadarChart, Select, StatCard } from '@/shared/components/ui';

const SCORE_DIST = [
  { label: '<450', value: 2, tone: 'rose' as const },
  { label: '450–549', value: 4, tone: 'orange' as const },
  { label: '550–649', value: 7, tone: 'amber' as const },
  { label: '650–749', value: 9, tone: 'emerald' as const },
  { label: '750–849', value: 4, tone: 'teal' as const },
  { label: '850+', value: 2, tone: 'indigo' as const },
];

const CLASS_RADAR = [
  { label: 'Listening', value: 71 },
  { label: 'Reading', value: 64 },
  { label: 'Grammar', value: 76 },
  { label: 'Vocabulary', value: 59 },
  { label: 'Speed', value: 62 },
];

export const TeacherAnalyticsPage: React.FC = () => {
  useDocumentTitle('Thống kê lớp học');
  const [classId, setClassId] = useState(MOCK_CLASSES[0].id);
  const cls = MOCK_CLASSES.find((c) => c.id === classId) ?? MOCK_CLASSES[0];
  const sorted = [...MOCK_CLASS_STUDENTS].sort((a, b) => b.avgScore - a.avgScore);
  const top = sorted.slice(0, 3);
  const bottom = sorted.slice(-3).reverse();
  const assignments = MOCK_ASSIGNMENTS.filter((a) => a.classId === cls.id);

  const cols: Column<ClassStudent>[] = [
    { key: 'name', header: 'Học viên', render: (r) => (<div className="flex items-center gap-2"><Avatar name={r.name} size="xs" /><span className="font-semibold">{r.name}</span></div>) },
    { key: 'avgScore', header: 'Điểm TB', align: 'center', render: (r) => <span className="font-black">{r.avgScore}</span> },
    { key: 'completion', header: 'Hoàn thành', align: 'center', render: (r) => <span>{r.completion}%</span> },
    { key: 'status', header: '', render: (r) => <Badge tone={r.status === 'GOOD' ? 'emerald' : r.status === 'WARNING' ? 'amber' : 'rose'} size="xs" dot>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Thống kê lớp học" description="Tiến độ hoàn thành, phân bố điểm và hồ sơ kỹ năng của lớp." icon={<BarChart3 />} actions={<div className="w-64"><Select options={MOCK_CLASSES.map((c) => ({ value: c.id, label: c.name }))} value={classId} onChange={(e) => setClassId(e.target.value)} /></div>} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4" key={cls.id}>
        <StatCard label="Học viên" value={cls.studentsCount} icon={<Users />} tone="emerald" />
        <StatCard label="Điểm TB" value={cls.avgScore} icon={<TrendingUp />} tone="indigo" delta={3} deltaLabel="so với tháng trước" />
        <StatCard label="Hoàn thành" value={cls.completionRate} suffix="%" icon={<CheckCircle2 />} tone="sky" />
        <StatCard label="Chuyên cần" value={cls.attendanceRate} suffix="%" icon={<Clock />} tone="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="animate-fade-up">
          <CardHeader title="Hoàn thành bài tập theo tuần" subtitle="% học viên nộp đúng hạn" />
          <MiniBars data={CLASS_WEEKLY_PROGRESS.map((d) => ({ ...d, tone: 'emerald' as const }))} max={100} height={150} />
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: '60ms' }}>
          <CardHeader title="Phân bố điểm thi thử gần nhất" subtitle={`${cls.studentsCount} học viên`} />
          <MiniBars data={SCORE_DIST} height={150} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="flex flex-col items-center animate-fade-up" style={{ animationDelay: '100ms' }}>
          <CardHeader title="Hồ sơ kỹ năng lớp" subtitle="Trung bình (%)" className="w-full" />
          <RadarChart data={CLASS_RADAR} tone="emerald" size={240} />
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: '140ms' }}>
          <CardHeader title="Tỷ lệ nộp bài" subtitle="Theo từng bài tập" />
          <div className="space-y-4">
            {(assignments.length ? assignments : MOCK_ASSIGNMENTS.slice(0, 4)).map((a) => (
              <ProgressBar key={a.id} value={a.total ? (a.submitted / a.total) * 100 : 0} label={a.title} showValue size="sm" tone={a.submitted / a.total > 0.7 ? 'emerald' : 'amber'} />
            ))}
          </div>
        </Card>
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '180ms' }}>
          <Card padding="sm">
            <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 mb-2 px-1">🏆 Top học viên</p>
            <DataTable columns={cols} rows={top} dense />
          </Card>
          <Card padding="sm">
            <p className="text-xs font-extrabold uppercase tracking-wider text-rose-600 mb-2 px-1">⚠️ Cần hỗ trợ</p>
            <DataTable columns={cols} rows={bottom} dense />
          </Card>
        </div>
      </div>
    </div>
  );
};
