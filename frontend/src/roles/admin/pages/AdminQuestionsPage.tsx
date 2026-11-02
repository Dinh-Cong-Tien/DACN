import React, { useState } from 'react';
import { BarChart3, CheckCircle2, Database, Eye, Layers, Upload } from 'lucide-react';
import { ALL_QUESTIONS, QUESTIONS_BY_PART } from '@/shared/mocks';
import type { IQuestion, SkillType } from '@/shared/types';
import { useDocumentTitle } from '@/shared/hooks';
import { BarChart } from '@/shared/components/charts/Charts';
import { Button, Column, Modal } from '@/shared/components/ui';
import { Figures, Panel, TPageHead } from '@/roles/teacher/components/TeacherKit';
import { CrudEditor, CrudField, QuestionRenderer } from '@/engines';
import { toast } from '@/shared/stores/uiStore';

const SKILL_TONE: Record<SkillType, string> = {
  LISTENING: 'bg-sky-50 text-sky-700 ring-sky-200/70',
  READING: 'bg-indigo-50 text-indigo-700 ring-indigo-200/70',
  WRITING: 'bg-violet-50 text-violet-700 ring-violet-200/70',
  SPEAKING: 'bg-rose-50 text-rose-700 ring-rose-200/70',
  VOCABULARY: 'bg-amber-50 text-amber-800 ring-amber-200/70',
  GRAMMAR: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
};
const SKILL_VI: Record<SkillType, string> = { LISTENING: 'Nghe', READING: 'Đọc', WRITING: 'Viết', SPEAKING: 'Nói', VOCABULARY: 'Từ vựng', GRAMMAR: 'Ngữ pháp' };
const chip = 'inline-flex items-center whitespace-nowrap rounded-lg px-2 py-0.5 text-xs font-semibold ring-1 ring-inset';
const SKILL_OPTIONS = (Object.keys(SKILL_TONE) as SkillType[]).map((s) => ({ value: s, label: SKILL_VI[s] }));

const columns: Column<IQuestion>[] = [
  {
    key: 'stem',
    header: 'Câu hỏi',
    render: (q) => (
      <div className="max-w-md">
        <p className="font-medium text-slate-900 truncate">{q.stem.length > 70 ? `${q.stem.slice(0, 70)}…` : q.stem}</p>
        <p className="text-xs text-slate-400 font-mono">{q.id}</p>
      </div>
    ),
  },
  { key: 'examType', header: 'Kỳ thi', render: (q) => <span className={`${chip} ${q.examType === 'TOEIC' ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-emerald-600 text-white ring-emerald-600'}`}>{q.examType}</span> },
  { key: 'partOrSkill', header: 'Part', render: (q) => <span className="whitespace-nowrap text-[13px] text-slate-700">{q.partOrSkill.replace('PART_', 'Part ').replace('VSTEP_', '').replace('_', ' ')}</span> },
  { key: 'skillType', header: 'Kỹ năng', render: (q) => <span className={`${chip} ${SKILL_TONE[q.skillType]}`}>{SKILL_VI[q.skillType]}</span> },
  {
    key: 'difficulty',
    header: 'Độ khó',
    render: (q) => (
      <span className="text-amber-500 text-xs tracking-wider">
        {'★'.repeat(q.difficulty)}
        <span className="text-slate-300">{'★'.repeat(Math.max(0, 5 - q.difficulty))}</span>
      </span>
    ),
  },
  {
    key: 'tags',
    header: 'Thẻ',
    render: (q) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {q.tags.slice(0, 2).map((t) => (
          <span key={t} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
            #{t}
          </span>
        ))}
        {q.tags.length > 2 && <span className="text-[10px] text-slate-500">+{q.tags.length - 2}</span>}
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
  const byPart = Object.entries(QUESTIONS_BY_PART).map(([k, v]) => ({ label: k.replace('PART_', 'P').replace('VSTEP_', 'V-'), value: v.length }));

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Nội dung · Ngân hàng đề"
        title="Ngân hàng câu hỏi"
        sub="Tạo, sửa, xoá và phân loại câu hỏi theo kỳ thi, Part và kỹ năng. Kho chính thức 12.614 câu; bảng dưới hiển thị bộ câu mẫu."
      />

      <Figures
        items={[
          { label: 'Câu mẫu', value: ALL_QUESTIONS.length, note: 'kho chính thức 12.614 câu', icon: Database, tone: 'indigo' },
          { label: 'TOEIC', value: toeic, note: 'Part 1–7', icon: Layers, tone: 'violet' },
          { label: 'VSTEP', value: ALL_QUESTIONS.length - toeic, note: 'Reading · Listening', icon: Layers, tone: 'emerald' },
          { label: 'Có lời giải', value: ALL_QUESTIONS.filter((q) => q.explanation).length, note: 'đã biên soạn giải thích', icon: CheckCircle2, tone: 'amber' },
        ]}
      />

      <Panel title="Phân bố theo Part" sub="Số câu mẫu trong từng phần thi" icon={BarChart3} tone="sky">
        <BarChart ariaLabel="Số câu hỏi theo Part" data={byPart.map(({ label, value }) => ({ label, value }))} height={200} unit=" câu" />
      </Panel>

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
