import React from 'react';
import { Library } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { MOCK_SUBJECTS } from '@/shared/mocks';
import type { Subject } from '@/shared/types';
import { Badge, Column, PageHeader, StatCard } from '@/shared/components/ui';
import { CrudEditor } from '@/engines';

const columns: Column<Subject>[] = [
  { key: 'name', header: 'Môn học', render: (r) => (<div><p className="font-bold text-slate-900">{r.name}</p><p className="text-[11px] text-slate-500">Phụ trách: {r.lead}</p></div>) },
  { key: 'code', header: 'Mã', render: (r) => <span className="font-mono text-xs font-bold text-slate-600">{r.code}</span> },
  { key: 'examType', header: 'Kỳ thi', render: (r) => <Badge tone={r.examType === 'TOEIC' ? 'indigo' : 'emerald'}>{r.examType}</Badge> },
  { key: 'teachersCount', header: 'Giáo viên', align: 'center' },
  { key: 'classesCount', header: 'Lớp', align: 'center' },
  { key: 'questionsCount', header: 'Câu hỏi', align: 'right', render: (r) => <span className="font-bold">{r.questionsCount.toLocaleString('vi-VN')}</span> },
];

export const HeadSubjectsPage: React.FC = () => {
  useDocumentTitle('Danh mục môn học');
  return (
    <div className="space-y-6">
      <PageHeader title="Danh mục môn học" description="Quản lý các môn học thuộc bộ môn, mã môn và giáo viên phụ trách." icon={<Library />} />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Môn học" value={MOCK_SUBJECTS.length} tone="amber" />
        <StatCard label="Lớp đang mở" value={MOCK_SUBJECTS.reduce((a, s) => a + s.classesCount, 0)} tone="indigo" />
        <StatCard label="Câu hỏi" value={MOCK_SUBJECTS.reduce((a, s) => a + s.questionsCount, 0)} tone="emerald" />
      </div>
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
