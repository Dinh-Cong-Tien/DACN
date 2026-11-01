import React, { useState } from 'react';
import { Database, Eye } from 'lucide-react';
import type { IQuestion } from '@toeic-vstep/shared';
import { useDocumentTitle } from '@/shared/hooks';
import { ALL_QUESTIONS, QUESTIONS_BY_PART } from '@/shared/mocks';
import { BarChart } from '@/shared/components/charts/Charts';
import { Badge, Card, CardHeader, Column, Modal, PageHeader, StatCard } from '@/shared/components/ui';
import { CrudEditor, QuestionRenderer } from '@/engines';

const SKILL_OPTS = ['LISTENING', 'READING', 'WRITING', 'SPEAKING', 'VOCABULARY', 'GRAMMAR'].map((s) => ({ value: s, label: s }));

const columns: Column<IQuestion>[] = [
  {
    key: 'stem',
    header: 'Câu hỏi',
    render: (r) => (
      <p className="font-semibold text-slate-800 max-w-md truncate" title={r.stem}>
        {r.stem}
      </p>
    ),
  },
  {
    key: 'examType',
    header: 'Kỳ thi',
    render: (r) => (
      <Badge tone={r.examType === 'TOEIC' ? 'indigo' : 'emerald'} size="xs">
        {r.examType}
      </Badge>
    ),
  },
  {
    key: 'partOrSkill',
    header: 'Part',
    render: (r) => (
      <Badge tone="violet" size="xs">
        {r.partOrSkill.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  { key: 'skillType', header: 'Kỹ năng', render: (r) => <span className="text-xs font-bold text-slate-600">{r.skillType}</span> },
  {
    key: 'difficulty',
    header: 'Độ khó',
    align: 'center',
    render: (r) => (
      <span className="text-amber-500 text-xs tracking-tight">
        {'★'.repeat(r.difficulty)}
        <span className="text-slate-300">{'★'.repeat(5 - r.difficulty)}</span>
      </span>
    ),
  },
  {
    key: 'tags',
    header: 'Tags',
    render: (r) => (
      <div className="flex gap-1 flex-wrap">
        {r.tags.slice(0, 2).map((t) => (
          <Badge key={t} tone="slate" size="xs">
            #{t}
          </Badge>
        ))}
      </div>
    ),
  },
];

export const HeadQuestionBankPage: React.FC = () => {
  useDocumentTitle('Ngân hàng câu hỏi');
  const [preview, setPreview] = useState<IQuestion | null>(null);
  const byPart = Object.entries(QUESTIONS_BY_PART).map(([k, v]) => ({ label: k.replace('PART_', 'P').replace('VSTEP_', 'VS-').slice(0, 7), value: v.length }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Ngân hàng <span className="mark">câu hỏi</span>
          </>
        }
        description="Quản lý, hiệu đính và phân loại câu hỏi theo Part / kỹ năng thuộc bộ môn."
        icon={<Database />}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <Card hard className="animate-fade-up">
          <CardHeader title="Phân bố theo Part / kỹ năng" subtitle="Số câu hỏi mẫu đang có trong ngân hàng" />
          <BarChart ariaLabel="Số câu hỏi theo Part" data={byPart.map(({ label, value }) => ({ label, value }))} height={190} unit=" câu" />
        </Card>
        <div className="grid grid-cols-1 gap-4">
          <StatCard label="Tổng câu hỏi" value={ALL_QUESTIONS.length} tone="amber" hint="Bộ mẫu demo" />
          <StatCard label="Có lời giải" value={ALL_QUESTIONS.filter((q) => q.explanation).length} tone="emerald" />
        </div>
      </div>

      <CrudEditor<IQuestion>
        rows={ALL_QUESTIONS}
        columns={columns}
        entityName="câu hỏi"
        createLabel="Thêm câu hỏi"
        idPrefix="q"
        pageSize={10}
        searchKeys={['stem', 'partOrSkill']}
        filters={[
          { key: 'examType', label: 'Kỳ thi', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] },
          { key: 'skillType', label: 'Kỹ năng', options: SKILL_OPTS },
        ]}
        defaultValues={{ examType: 'TOEIC', type: 'SINGLE_CHOICE', skillType: 'READING', partOrSkill: 'PART_5', level: '550+', difficulty: 2, tags: [], options: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }], correctAnswer: { key: 'A' } }}
        fields={[
          { key: 'stem', label: 'Nội dung câu hỏi', type: 'textarea', required: true },
          { key: 'examType', label: 'Kỳ thi', type: 'select', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] },
          { key: 'partOrSkill', label: 'Part / Kỹ năng', type: 'text', placeholder: 'PART_5' },
          { key: 'skillType', label: 'Loại kỹ năng', type: 'select', options: SKILL_OPTS },
          { key: 'difficulty', label: 'Độ khó (1–5)', type: 'number' },
          { key: 'explanation', label: 'Lời giải thích', type: 'textarea' },
        ]}
        rowActions={(row) => [{ label: 'Xem trước', icon: <Eye />, onClick: () => setPreview(row) }]}
      />

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Xem trước câu hỏi" size="lg">
        {preview && <QuestionRenderer question={preview} selectedAnswer={undefined} onSelectAnswer={() => undefined} showExplanation isReadOnly allowFlagReport={false} />}
      </Modal>
    </div>
  );
};
