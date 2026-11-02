import React, { useState } from 'react';
import { BarChart3, CheckCircle2, Database, Eye, Headphones, BookOpenText } from 'lucide-react';
import type { IQuestion } from '@toeic-vstep/shared';
import { useDocumentTitle } from '@/shared/hooks';
import { ALL_QUESTIONS, QUESTIONS_BY_PART } from '@/shared/mocks';
import { BarChart } from '@/shared/components/charts/Charts';
import { Column, Modal } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { Figures, Panel, TPageHead } from '@/roles/teacher/components/TeacherKit';

const chip = 'inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold';
import { CrudEditor, QuestionRenderer } from '@/engines';

const SKILL_OPTS = ['LISTENING', 'READING', 'WRITING', 'SPEAKING', 'VOCABULARY', 'GRAMMAR'].map((s) => ({ value: s, label: s }));

const SKILL_VI: Record<string, string> = { LISTENING: 'Nghe', READING: 'Đọc', WRITING: 'Viết', SPEAKING: 'Nói', VOCABULARY: 'Từ vựng', GRAMMAR: 'Ngữ pháp' };

const columns: Column<IQuestion>[] = [
  {
    key: 'stem',
    header: 'Câu hỏi',
    render: (r) => (
      <p className="max-w-md truncate font-medium text-slate-900" title={r.stem}>
        {r.stem}
      </p>
    ),
  },
  {
    key: 'examType',
    header: 'Kỳ thi',
    render: (r) => (
      <span className={cn(chip, r.examType === 'TOEIC' ? 'bg-indigo-500/10 text-indigo-700' : 'bg-emerald-500/10 text-emerald-700')}>{r.examType}</span>
    ),
  },
  {
    key: 'partOrSkill',
    header: 'Part',
    render: (r) => (
      <span className={cn(chip, 'bg-slate-100 font-mono text-slate-700')}>{r.partOrSkill.replace(/_/g, ' ')}</span>
    ),
  },
  { key: 'skillType', header: 'Kỹ năng', render: (r) => <span className="text-[13px] text-slate-600">{SKILL_VI[r.skillType] ?? r.skillType}</span> },
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
          <span key={t} className="text-xs text-slate-500">
            #{t}
          </span>
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
      <TPageHead
        eyebrow="Học liệu bộ môn"
        title="Ngân hàng câu hỏi"
        sub="Hiệu đính, phân loại câu hỏi theo Part / kỹ năng và xem trước đúng như học viên làm bài."
      />
      <Figures
        items={[
          { label: 'Tổng câu hỏi', value: ALL_QUESTIONS.length, note: `${byPart.length} Part / kỹ năng`, icon: Database, tone: 'amber' },
          { label: 'Có lời giải', value: ALL_QUESTIONS.filter((q) => q.explanation).length, note: `${Math.round((ALL_QUESTIONS.filter((q) => q.explanation).length / Math.max(1, ALL_QUESTIONS.length)) * 100)}% ngân hàng`, icon: CheckCircle2, tone: 'emerald' },
          { label: 'Câu Nghe', value: ALL_QUESTIONS.filter((q) => q.skillType === 'LISTENING').length, note: 'có audio', icon: Headphones, tone: 'sky' },
          { label: 'Câu Đọc', value: ALL_QUESTIONS.filter((q) => q.skillType === 'READING').length, note: 'Part 5–7', icon: BookOpenText, tone: 'violet' },
        ]}
      />
      <Panel title="Phân bố theo Part / kỹ năng" sub="Số câu hỏi đang có trong ngân hàng" icon={BarChart3} tone="indigo">
        <BarChart ariaLabel="Số câu hỏi theo Part" data={byPart} height={200} unit=" câu" />
      </Panel>

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
