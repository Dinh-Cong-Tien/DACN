import React from 'react';
import { School } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { MOCK_CLASSES, MOCK_TEACHERS } from '@/shared/mocks';
import type { ClassRoom } from '@/shared/types';
import { Badge, Column, PageHeader, ProgressBar, StatCard } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { CrudEditor } from '@/engines';

const columns: Column<ClassRoom>[] = [
  {
    key: 'name',
    header: 'Lớp',
    render: (r) => (
      <div className="flex items-center gap-3">
        <Img src={r.coverUrl ?? PHOTOS.classroom} alt={r.name} wrapperClass="w-14 h-10 rounded-lg border-2 border-slate-900 shrink-0" fallbackClass="bg-indigo-200" />
        <div>
          <p className="font-bold text-slate-900">{r.name}</p>
          <p className="text-[11px] text-slate-500">{r.schedule}</p>
        </div>
      </div>
    ),
  },
  { key: 'code', header: 'Mã', render: (r) => <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300">{r.code}</span> },
  { key: 'examType', header: 'Kỳ thi', render: (r) => <Badge tone={r.examType === 'TOEIC' ? 'indigo' : 'emerald'}>{r.examType}</Badge> },
  { key: 'teacherName', header: 'Giáo viên', render: (r) => <span className="text-xs font-bold">{r.teacherName}</span> },
  { key: 'studentsCount', header: 'HV', align: 'center' },
  { key: 'avgScore', header: 'Điểm TB', align: 'center', render: (r) => <span className="font-display font-extrabold text-slate-900">{r.avgScore}</span> },
  { key: 'completionRate', header: 'Hoàn thành', width: '150px', render: (r) => <ProgressBar value={r.completionRate} size="sm" showValue tone={r.completionRate >= 80 ? 'emerald' : 'amber'} /> },
];

export const HeadClassesPage: React.FC = () => {
  useDocumentTitle('Lớp học bộ môn');
  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Lớp học <span className="mark">thuộc bộ môn</span>
          </>
        }
        description="Theo dõi toàn bộ lớp, giáo viên phụ trách và tiến độ hoàn thành."
        icon={<School />}
      />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Lớp đang mở" value={MOCK_CLASSES.length} tone="amber" />
        <StatCard label="Tổng học viên" value={MOCK_CLASSES.reduce((a, c) => a + c.studentsCount, 0)} tone="indigo" />
        <StatCard label="Hoàn thành TB" value={Math.round(MOCK_CLASSES.reduce((a, c) => a + c.completionRate, 0) / MOCK_CLASSES.length)} suffix="%" tone="emerald" />
      </div>
      <CrudEditor<ClassRoom>
        rows={MOCK_CLASSES}
        columns={columns}
        entityName="lớp học"
        createLabel="Tạo lớp"
        idPrefix="cl"
        searchKeys={['name', 'code', 'teacherName']}
        filters={[{ key: 'examType', label: 'Kỳ thi', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] }]}
        defaultValues={{ examType: 'TOEIC', code: `ORB-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, studentsCount: 0, assignmentsCount: 0, avgScore: 0, completionRate: 0, attendanceRate: 0, createdAt: new Date().toISOString().slice(0, 10), gradient: '', coverUrl: PHOTOS.students2, teacherName: MOCK_TEACHERS[0].name }}
        fields={[
          { key: 'name', label: 'Tên lớp', type: 'text', required: true },
          { key: 'examType', label: 'Kỳ thi', type: 'select', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] },
          { key: 'teacherName', label: 'Giáo viên phụ trách', type: 'select', options: MOCK_TEACHERS.map((t) => ({ value: t.name, label: t.name })) },
          { key: 'schedule', label: 'Lịch học', type: 'text', placeholder: 'T2 – T4 · 19:00' },
        ]}
      />
    </div>
  );
};
