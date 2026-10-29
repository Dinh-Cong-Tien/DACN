import React, { useState } from 'react';
import { FileQuestion, Eye, Upload } from 'lucide-react';
import { ALL_QUESTIONS } from '@/shared/mocks';
import type { IQuestion, SkillType } from '@/shared/types';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Column, Modal, PageHeader, StatCard, Tone } from '@/shared/components/ui';
import { CrudEditor, CrudField, QuestionRenderer } from '@/engines';
import { toast } from '@/shared/stores/uiStore';

const SKILL_TONE: Record<SkillType, Tone> = { LISTENING: 'sky', READING: 'indigo', WRITING: 'violet', SPEAKING: 'rose', VOCABULARY: 'amber', GRAMMAR: 'emerald' };
const SKILL_OPTIONS = (Object.keys(SKILL_TONE) as SkillType[]).map((s) => ({ value: s, label: s }));

const columns: Column<IQuestion>[] = [
  {
    key: 'stem',
    header: 'Câu hỏi',
    render: (q) => (
      <div className="max-w-md">
        <p className="font-semibold text-slate-800 truncate">{q.stem.length > 70 ? `${q.stem.slice(0, 70)}…` : q.stem}</p>
        <p className="text-[11px] text-slate-400 font-mono">{q.id}</p>
      </div>
    ),
  },
  { key: 'examType', header: 'Kỳ thi', render: (q) => <Badge tone={q.examType === 'TOEIC' ? 'indigo' : 'emerald'} solid size="xs">{q.examType}</Badge> },
  { key: 'partOrSkill', header: 'Part', render: (q) => <span className="font-mono text-xs text-slate-600">{q.partOrSkill}</span> },
  { key: 'skillType', header: 'Kỹ năng', render: (q) => <Badge tone={SKILL_TONE[q.skillType]}>{q.skillType}</Badge> },
  { key: 'difficulty', header: 'Độ khó', render: (q) => <span className="text-amber-500 text-xs tracking-wider">{'★'.repeat(q.difficulty)}<span className="text-slate-200">{'★'.repeat(Math.max(0, 5 - q.difficulty))}</span></span> },
  {
    key: 'tags',
    header: 'Thẻ',
    render: (q) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {q.tags.slice(0, 2).map((t) => (
          <Badge key={t} tone="slate" size="xs">
            #{t}
          </Badge>
        ))}
        {q.tags.length > 2 && <span className="text-[10px] text-slate-400">+{q.tags.length - 2}</span>}
      </div>
    ),
  },
];

const fields: CrudField<IQuestion>[] = [
  { key: 'stem', label: 'Nội dung câu hỏi', type: 'textarea', required: true, placeholder: 'Nhập đề bài...' },
  {
    key: 'examType',
    label: 'Kỳ thi',
    type: 'select',
    required: true,
    options: [
      { value: 'TOEIC', label: 'TOEIC' },
      { value: 'VSTEP', label: 'VSTEP' },
    ],
  },
  { key: 'partOrSkill', label: 'Part / Kỹ năng', type: 'text', required: true, placeholder: 'PART_5' },
  { key: 'skillType', label: 'Loại kỹ năng', type: 'select', required: true, options: SKILL_OPTIONS },
  { key: 'level', label: 'Cấp độ', type: 'text', placeholder: '550+' },
  { key: 'difficulty', label: 'Độ khó (1–5)', type: 'number', required: true },
  { key: 'explanation', label: 'Lời giải thích', type: 'textarea', placeholder: 'Giải thích vì sao chọn đáp án đúng...' },
];

export const AdminQuestionsPage: React.FC = () => {
  useDocumentTitle('Ngân hàng câu hỏi');
  const [preview, setPreview] = useState<IQuestion | null>(null);
  const toeic = ALL_QUESTIONS.filter((q) => q.examType === 'TOEIC').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Ngân hàng câu hỏi" icon={<FileQuestion />} description="Quản trị CSDL câu hỏi: tạo, sửa, xoá, phân loại theo kỳ thi, Part và kỹ năng." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Tổng câu hỏi (mẫu)" value={ALL_QUESTIONS.length} tone="indigo" />
        <StatCard label="TOEIC" value={toeic} tone="violet" />
        <StatCard label="VSTEP" value={ALL_QUESTIONS.length - toeic} tone="emerald" />
        <StatCard label="Có lời giải" value={ALL_QUESTIONS.filter((q) => q.explanation).length} tone="amber" />
      </div>

      <CrudEditor<IQuestion>
        rows={ALL_QUESTIONS}
        columns={columns}
        fields={fields}
        entityName="câu hỏi"
        createLabel="Thêm câu hỏi"
        idPrefix="q"
        searchKeys={['stem', 'partOrSkill']}
        filters={[
          {
            key: 'examType',
            label: 'Kỳ thi',
            options: [
              { value: 'TOEIC', label: 'TOEIC' },
              { value: 'VSTEP', label: 'VSTEP' },
            ],
          },
          { key: 'skillType', label: 'Kỹ năng', options: SKILL_OPTIONS },
        ]}
        defaultValues={{ examType: 'TOEIC', type: 'SINGLE_CHOICE', skillType: 'READING', partOrSkill: 'PART_5', level: '550+', difficulty: 2, tags: [], options: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }], correctAnswer: { key: 'A' } }}
        toolbarExtra={
          <Button size="sm" variant="outline" leftIcon={<Upload className="w-4 h-4" />} onClick={() => toast.info('Import CSV', 'Chọn file .csv theo mẫu để nhập hàng loạt (demo).')}>
            Import CSV
          </Button>
        }
        rowActions={(q) => [{ label: 'Xem trước', icon: <Eye />, onClick: () => setPreview(q) }]}
      />

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Xem trước câu hỏi" size="lg">
        {preview && <QuestionRenderer question={preview} showExplanation isReadOnly onSelectAnswer={() => {}} allowFlagReport={false} />}
      </Modal>
    </div>
  );
};
