import React, { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Database, Eye, Headphones, BookOpenText } from 'lucide-react';
import type { IQuestion } from '@toeic-vstep/shared';
import { useDocumentTitle } from '@/shared/hooks';
import { BarChart } from '@/shared/components/charts/Charts';
import { Column, Modal, Select } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { Figures, Panel, TPageHead } from '@/roles/teacher/components/TeacherKit';
import { CrudEditor, QuestionRenderer } from '@/engines';
import { headApi, useHeadQuestionBank, type QuestionRow } from '@/shared/api/head';
import { EXAM_PARTS, partLabel, partShort, SKILL_VI, stars, toIQuestion } from '@/shared/constants/staff';
import type { SkillType } from '@/shared/types';

const chip = 'inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold';
const SKILL_OPTS = (Object.keys(SKILL_VI) as SkillType[]).map((s) => ({ value: s, label: SKILL_VI[s] }));
const EMPTY: QuestionRow[] = [];

const columns: Column<QuestionRow>[] = [
  {
    key: 'stem',
    header: 'Câu hỏi',
    render: (r) => (
      <div className="max-w-md">
        <p className="truncate font-medium text-slate-900" title={r.stem}>
          {r.stem}
        </p>
        {r.passageTitle && <p className="truncate text-xs text-slate-400">{r.passageTitle}</p>}
      </div>
    ),
  },
  {
    key: 'examType',
    header: 'Kỳ thi',
    render: (r) => <span className={cn(chip, r.examType === 'TOEIC' ? 'bg-indigo-500/10 text-indigo-700' : 'bg-emerald-500/10 text-emerald-700')}>{r.examType}</span>,
  },
  { key: 'part', header: 'Part', render: (r) => <span className={cn(chip, 'bg-slate-100 text-slate-700')}>{partLabel(r.part)}</span> },
  { key: 'skill', header: 'Kỹ năng', render: (r) => <span className="text-[13px] text-slate-600">{SKILL_VI[r.skill as SkillType] ?? r.skill}</span> },
  {
    key: 'difficulty',
    header: 'Độ khó',
    align: 'center',
    render: (r) => (
      <span className="text-amber-500 text-xs tracking-tight">
        {'★'.repeat(stars(r.difficulty))}
        <span className="text-slate-300">{'★'.repeat(5 - stars(r.difficulty))}</span>
      </span>
    ),
  },
  {
    key: 'hasExplanation',
    header: 'Lời giải',
    align: 'center',
    render: (r) => (r.hasExplanation ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" /> : <span className="text-xs text-slate-400">—</span>),
  },
];

/** Ngân hàng câu hỏi của bộ môn: tra cứu, lọc theo Part và xem trước đúng như học viên làm bài */
export const HeadQuestionBankPage: React.FC = () => {
  useDocumentTitle('Ngân hàng câu hỏi');
  const [preview, setPreview] = useState<IQuestion | null>(null);
  const [part, setPart] = useState('');
  const query = useMemo(() => ({ pageSize: 200, part: part || undefined }), [part]);
  const { data, isLoading } = useHeadQuestionBank(query);
  const all = useHeadQuestionBank({ pageSize: 1 }).data;
  const rows = data?.items ?? EMPTY;
  const byPartAll = all?.byPart ?? [];
  const total = all?.total ?? 0;
  const sum = (pred: (p: string) => boolean) => byPartAll.filter((b) => pred(b.part)).reduce((a, b) => a + b.count, 0);
  const byPart = byPartAll.map((b) => ({ label: partShort(b.part), value: b.count }));

  const openPreview = async (q: QuestionRow) => {
    const full = await headApi.question(q.id).catch(() => null);
    setPreview(toIQuestion(q, full?.passage));
  };

  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Học liệu bộ môn" title="Ngân hàng câu hỏi" sub="Tra cứu, phân loại câu hỏi theo Part / kỹ năng và xem trước đúng như học viên làm bài. Bảng hiển thị tối đa 200 câu theo bộ lọc Part." />
      <Figures
        items={[
          { label: 'Tổng câu hỏi', value: total.toLocaleString('vi-VN'), note: `${byPart.length} Part / kỹ năng`, icon: Database, tone: 'amber' },
          { label: 'Có lời giải', value: rows.filter((q) => q.hasExplanation).length, note: `trong ${rows.length} câu đang xem`, icon: CheckCircle2, tone: 'emerald' },
          { label: 'Câu Nghe', value: sum((p) => /TOEIC_P[1-4]|VSTEP_L/.test(p)).toLocaleString('vi-VN'), note: 'có audio', icon: Headphones, tone: 'sky' },
          { label: 'Câu Đọc', value: sum((p) => /TOEIC_P[5-7]|VSTEP_R/.test(p)).toLocaleString('vi-VN'), note: 'Part 5–7, Reading', icon: BookOpenText, tone: 'violet' },
        ]}
      />
      <Panel title="Phân bố theo Part / kỹ năng" sub="Số câu hỏi đang có trong ngân hàng" icon={BarChart3} tone="indigo">
        {byPart.length ? <BarChart ariaLabel="Số câu hỏi theo Part" data={byPart} height={200} unit=" câu" /> : <p className="py-10 text-center text-sm text-slate-500">Chưa có câu hỏi.</p>}
      </Panel>

      <CrudEditor<QuestionRow>
        rows={rows}
        loading={isLoading}
        readOnly
        columns={columns}
        entityName="câu hỏi"
        idPrefix="q"
        pageSize={10}
        searchKeys={['stem', 'part']}
        filters={[
          { key: 'examType', label: 'Kỳ thi', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] },
          { key: 'skill', label: 'Kỹ năng', options: SKILL_OPTS },
        ]}
        fields={[]}
        toolbarExtra={
          <div className="w-44">
            <Select inputSize="sm" placeholder="Part" value={part} onChange={(e) => setPart(e.target.value)} options={EXAM_PARTS.map((p) => ({ value: p.value, label: p.label }))} />
          </div>
        }
        rowActions={(row) => [{ label: 'Xem trước', icon: <Eye />, onClick: () => void openPreview(row) }]}
      />

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Xem trước câu hỏi" size="lg">
        {preview && <QuestionRenderer question={preview} selectedAnswer={undefined} onSelectAnswer={() => undefined} showExplanation isReadOnly allowFlagReport={false} />}
      </Modal>
    </div>
  );
};
