import React, { useMemo } from 'react';
import { BookMarked, Database, Headphones, PenLine, School, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { headApi, useHeadInvalidate, useHeadSubjects, useHeadTeachers } from '@/shared/api/head';
import type { Subject } from '@/shared/types';
import { Avatar, Column } from '@/shared/components/ui';
import { cn, formatNumber } from '@/shared/utils';
import { CrudEditor } from '@/engines';
import { Figures, IconTile, Meter, TPageHead } from '@/roles/teacher/components/TeacherKit';

const makeColumns = (maxQ: number, avatarOf: (name: string) => string | undefined): Column<Subject>[] => [
  {
    key: 'name',
    header: 'Môn học',
    render: (r) => (
      <div className="flex items-center gap-3">
        <IconTile icon={r.examType === 'TOEIC' ? Headphones : PenLine} tone={r.examType === 'TOEIC' ? 'indigo' : 'emerald'} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{r.name}</p>
          <p className="font-mono text-xs text-slate-500">{r.code}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'examType',
    header: 'Kỳ thi',
    render: (r) => <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-semibold', r.examType === 'TOEIC' ? 'bg-indigo-500/10 text-indigo-700' : 'bg-emerald-500/10 text-emerald-700')}>{r.examType}</span>,
  },
  {
    key: 'lead',
    header: 'Phụ trách',
    render: (r) => (
      <div className="flex items-center gap-2">
        <Avatar name={r.lead} src={avatarOf(r.lead)} size="xs" />
        <span className="whitespace-nowrap text-slate-700">{r.lead || '—'}</span>
      </div>
    ),
  },
  { key: 'teachersCount', header: 'Giáo viên', align: 'center' },
  { key: 'classesCount', header: 'Lớp', align: 'center' },
  {
    key: 'questionsCount',
    header: 'Câu hỏi',
    render: (r) => (
      <div className="flex min-w-[140px] items-center gap-2">
        <Meter value={maxQ ? (r.questionsCount / maxQ) * 100 : 0} tone={r.examType === 'TOEIC' ? 'indigo' : 'green'} className="flex-1" />
        <span className="w-12 text-right font-semibold tabular-nums text-slate-900">{formatNumber(r.questionsCount)}</span>
      </div>
    ),
  },
];

export const HeadSubjectsPage: React.FC = () => {
  useDocumentTitle('Danh mục môn học');
  const { data, isLoading } = useHeadSubjects();
  const teachers = useHeadTeachers().data ?? [];
  const refresh = useHeadInvalidate();
  const subjectList = useMemo<Subject[]>(() => data ?? [], [data]);
  const columns = makeColumns(Math.max(0, ...subjectList.map((s) => s.questionsCount)), (n) => teachers.find((t) => t.name === n)?.avatarUrl);
  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Bộ môn" title="Danh mục môn học" sub="Môn học thuộc bộ môn, mã môn, giáo viên phụ trách và quy mô lớp, ngân hàng câu hỏi của từng môn." />
      <Figures
        items={[
          { label: 'Môn học', value: subjectList.length, note: `${subjectList.filter((s) => s.examType === 'TOEIC').length} TOEIC · ${subjectList.filter((s) => s.examType === 'VSTEP').length} VSTEP`, icon: BookMarked, tone: 'amber' },
          { label: 'Lớp đang mở', value: subjectList.reduce((a, s) => a + s.classesCount, 0), note: 'tất cả môn', icon: School, tone: 'indigo' },
          { label: 'Lượt phân công GV', value: subjectList.reduce((a, s) => a + s.teachersCount, 0), note: 'giáo viên × môn', icon: Users, tone: 'emerald' },
          { label: 'Câu hỏi', value: formatNumber(subjectList.reduce((a, s) => a + s.questionsCount, 0)), note: 'đã xuất bản theo kỳ thi', icon: Database, tone: 'violet' },
        ]}
      />
      <CrudEditor<Subject>
        rows={subjectList}
        loading={isLoading}
        onCreate={async (v) => {
          const r = await headApi.createSubject({ name: String(v.name), code: String(v.code), examType: v.examType ?? 'TOEIC' });
          void refresh();
          return r;
        }}
        onUpdate={async (row, v) => {
          const r = await headApi.updateSubject(row.id, { name: v.name, code: v.code, examType: v.examType });
          void refresh();
          return r;
        }}
        onDelete={async (row) => {
          await headApi.deleteSubject(row.id);
          void refresh();
        }}
        columns={columns}
        entityName="môn học"
        createLabel="Thêm môn học"
        idPrefix="sj"
        searchKeys={['name', 'code']}
        filters={[{ key: 'examType', label: 'Kỳ thi', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] }]}
        defaultValues={{ examType: 'TOEIC', teachersCount: 0, classesCount: 0, questionsCount: 0 }}
        fields={[
          { key: 'name', label: 'Tên môn học', type: 'text', required: true, placeholder: 'VD: TOEIC Speaking & Writing' },
          { key: 'code', label: 'Mã môn', type: 'text', required: true, placeholder: 'VD: TOEIC-SW' },
          { key: 'examType', label: 'Kỳ thi', type: 'select', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] },
        ]}
      />
    </div>
  );
};
