import React, { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Database, Eye, Layers } from 'lucide-react';
import type { IQuestion, SkillType } from '@/shared/types';
import { adminApi, useAdminInvalidate, useAdminQuestions } from '@/shared/api/admin';
import { headApi, type QuestionRow } from '@/shared/api/head';
import { EXAM_PARTS, partLabel, partShort, stars, toIQuestion } from '@/shared/constants/staff';
import { useDocumentTitle } from '@/shared/hooks';
import { BarChart } from '@/shared/components/charts/Charts';
import { Column, Modal, Select } from '@/shared/components/ui';
import { Figures, Panel, TPageHead } from '@/roles/teacher/components/TeacherKit';
import { CrudEditor, CrudField, QuestionRenderer } from '@/engines';

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

const columns: Column<QuestionRow>[] = [
  {
    key: 'stem',
    header: 'Câu hỏi',
    render: (q) => (
      <div className="max-w-md">
        <p className="font-medium text-slate-900 truncate">{q.stem.length > 70 ? `${q.stem.slice(0, 70)}…` : q.stem}</p>
        <p className="text-xs text-slate-400">{q.passageTitle ?? (q.status === 'PUBLISHED' ? 'Đã xuất bản' : q.status)}</p>
      </div>
    ),
  },
  { key: 'examType', header: 'Kỳ thi', render: (q) => <span className={`${chip} ${q.examType === 'TOEIC' ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-emerald-600 text-white ring-emerald-600'}`}>{q.examType}</span> },
  { key: 'part', header: 'Part', render: (q) => <span className="whitespace-nowrap text-[13px] text-slate-700">{partLabel(q.part)}</span> },
  { key: 'skill', header: 'Kỹ năng', render: (q) => <span className={`${chip} ${SKILL_TONE[q.skill as SkillType]}`}>{SKILL_VI[q.skill as SkillType]}</span> },
  {
    key: 'difficulty',
    header: 'Độ khó',
    render: (q) => (
      <span className="text-amber-500 text-xs tracking-wider">
        {'★'.repeat(stars(q.difficulty))}
        <span className="text-slate-300">{'★'.repeat(Math.max(0, 5 - stars(q.difficulty)))}</span>
      </span>
    ),
  },
  {
    key: 'correctAnswer',
    header: 'Đáp án',
    align: 'center',
    render: (q) => (q.correctAnswer ? <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">{q.correctAnswer}</span> : <span className="text-xs text-slate-400">—</span>),
  },
];

const fields: CrudField<QuestionRow>[] = [
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
  { key: 'part', label: 'Part', type: 'select', required: true, options: EXAM_PARTS.map((p) => ({ value: p.value, label: p.label })) },
  { key: 'skill', label: 'Loại kỹ năng', type: 'select', required: true, options: SKILL_OPTIONS },
  { key: 'correctAnswer', label: 'Đáp án đúng', type: 'select', options: ['A', 'B', 'C', 'D'].map((k) => ({ value: k, label: k })) },
  { key: 'explanation', label: 'Lời giải thích', type: 'textarea', placeholder: 'Giải thích vì sao chọn đáp án đúng...' },
];

const EMPTY: QuestionRow[] = [];

export const AdminQuestionsPage: React.FC = () => {
  useDocumentTitle('Ngân hàng câu hỏi');
  const [preview, setPreview] = useState<IQuestion | null>(null);
  const [exam, setExam] = useState<'' | 'TOEIC' | 'VSTEP'>('');
  const [part, setPart] = useState('');
  const query = useMemo(() => ({ pageSize: 200, examType: exam || undefined, part: part || undefined }), [exam, part]);
  const { data, isLoading } = useAdminQuestions(query);
  const all = useAdminQuestions({ pageSize: 1 });
  const refresh = useAdminInvalidate();
  const rows = data?.items ?? EMPTY;
  const byPartAll = all.data?.byPart ?? [];
  const total = all.data?.total ?? 0;
  const toeic = byPartAll.filter((b) => b.part.startsWith('TOEIC')).reduce((a, b) => a + b.count, 0);
  const byPart = byPartAll.map((b) => ({ label: partShort(b.part), value: b.count }));

  const openPreview = async (q: QuestionRow) => {
    const full = await headApi.question(q.id).catch(() => null);
    setPreview(toIQuestion(q, full?.passage));
  };
  const payload = (v: Partial<QuestionRow>) => ({
    examType: v.examType,
    part: v.part,
    skill: v.skill,
    stem: v.stem,
    correctAnswer: v.correctAnswer || undefined,
    explanation: v.explanation ?? undefined,
    options: v.options,
  });

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Nội dung · Ngân hàng đề"
        title="Ngân hàng câu hỏi"
        sub={`Tạo, sửa, xoá và phân loại câu hỏi theo kỳ thi, Part và kỹ năng. Kho hiện có ${total.toLocaleString('vi-VN')} câu; bảng hiển thị tối đa 200 câu theo bộ lọc Kỳ thi / Part.`}
      />

      <Figures
        items={[
          { label: 'Tổng câu hỏi', value: total.toLocaleString('vi-VN'), note: 'trong ngân hàng', icon: Database, tone: 'indigo' },
          { label: 'TOEIC', value: toeic.toLocaleString('vi-VN'), note: 'Part 1–7', icon: Layers, tone: 'violet' },
          { label: 'VSTEP', value: (total - toeic).toLocaleString('vi-VN'), note: 'Nghe · Đọc · Viết · Nói', icon: Layers, tone: 'emerald' },
          { label: 'Có lời giải', value: rows.filter((q) => q.hasExplanation).length, note: `trong ${rows.length} câu đang xem`, icon: CheckCircle2, tone: 'amber' },
        ]}
      />

      <Panel title="Phân bố theo Part" sub="Số câu hỏi trong từng phần thi" icon={BarChart3} tone="sky">
        {byPart.length ? <BarChart ariaLabel="Số câu hỏi theo Part" data={byPart} height={200} unit=" câu" /> : <p className="py-10 text-center text-sm text-slate-500">Chưa có câu hỏi.</p>}
      </Panel>

      <CrudEditor<QuestionRow>
        rows={rows}
        loading={isLoading}
        columns={columns}
        fields={fields}
        entityName="câu hỏi"
        createLabel="Thêm câu hỏi"
        idPrefix="q"
        searchKeys={['stem', 'part']}
        filters={[{ key: 'skill', label: 'Kỹ năng', options: SKILL_OPTIONS }]}
        defaultValues={{ examType: 'TOEIC', type: 'SINGLE_CHOICE', skill: 'READING', part: 'TOEIC_P5', options: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }], correctAnswer: 'A' }}
        toolbarExtra={
          <div className="flex gap-2">
            <div className="w-32">
              <Select inputSize="sm" placeholder="Kỳ thi" value={exam} onChange={(e) => { setExam(e.target.value as '' | 'TOEIC' | 'VSTEP'); setPart(''); }} options={[{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }]} />
            </div>
            <div className="w-44">
              <Select inputSize="sm" placeholder="Part" value={part} onChange={(e) => setPart(e.target.value)} options={EXAM_PARTS.filter((p) => !exam || p.exam === exam).map((p) => ({ value: p.value, label: p.label }))} />
            </div>
          </div>
        }
        onCreate={async (v) => {
          const q = await adminApi.createQuestion(payload(v));
          void refresh();
          return q;
        }}
        onUpdate={async (row, v) => {
          const q = await adminApi.updateQuestion(row.id, payload(v));
          void refresh();
          return q;
        }}
        onDelete={async (row) => {
          await adminApi.deleteQuestion(row.id);
          void refresh();
        }}
        rowActions={(q) => [{ label: 'Xem trước', icon: <Eye />, onClick: () => void openPreview(q) }]}
      />

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Xem trước câu hỏi" size="lg">
        {preview && <QuestionRenderer question={preview} showExplanation isReadOnly onSelectAnswer={() => {}} allowFlagReport={false} />}
      </Modal>
    </div>
  );
};
