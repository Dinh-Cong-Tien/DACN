import React from 'react';
import { BookMarked, Database, Headphones, PenLine, School, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { MOCK_SUBJECTS, teacherByName } from '@/shared/mocks';
import type { Subject } from '@/shared/types';
import { Avatar, Column } from '@/shared/components/ui';
import { cn, formatNumber } from '@/shared/utils';
import { CrudEditor } from '@/engines';
import { Figures, IconTile, Meter, TPageHead } from '@/roles/teacher/components/TeacherKit';

const maxQ = Math.max(...MOCK_SUBJECTS.map((s) => s.questionsCount));

const columns: Column<Subject>[] = [
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
        <Avatar name={r.lead} src={teacherByName(r.lead)?.avatarUrl} size="xs" />
        <span className="whitespace-nowrap text-slate-700">{r.lead}</span>
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
        <Meter value={(r.questionsCount / maxQ) * 100} tone={r.examType === 'TOEIC' ? 'indigo' : 'green'} className="flex-1" />
        <span className="w-12 text-right font-semibold tabular-nums text-slate-900">{formatNumber(r.questionsCount)}</span>
      </div>
    ),
  },
];

export const HeadSubjectsPage: React.FC = () => {
  useDocumentTitle('Danh mục môn học');
  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Bộ môn" title="Danh mục môn học" sub="Môn học thuộc bộ môn, mã môn, giáo viên phụ trách và quy mô lớp, ngân hàng câu hỏi của từng môn." />
      <Figures
        items={[
          { label: 'Môn học', value: MOCK_SUBJECTS.length, note: `${MOCK_SUBJECTS.filter((s) => s.examType === 'TOEIC').length} TOEIC · ${MOCK_SUBJECTS.filter((s) => s.examType === 'VSTEP').length} VSTEP`, icon: BookMarked, tone: 'amber' },
          { label: 'Lớp đang mở', value: MOCK_SUBJECTS.reduce((a, s) => a + s.classesCount, 0), note: 'tất cả môn', icon: School, tone: 'indigo' },
          { label: 'Lượt phân công GV', value: MOCK_SUBJECTS.reduce((a, s) => a + s.teachersCount, 0), note: 'giáo viên × môn', icon: Users, tone: 'emerald' },
          { label: 'Câu hỏi', value: formatNumber(MOCK_SUBJECTS.reduce((a, s) => a + s.questionsCount, 0)), note: 'đã thẩm định', icon: Database, tone: 'violet' },
        ]}
      />
      <CrudEditor<Subject>
        rows={MOCK_SUBJECTS}
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
          { key: 'lead', label: 'Giáo viên phụ trách', type: 'text', placeholder: 'Họ tên' },
        ]}
      />
    </div>
  );
};
