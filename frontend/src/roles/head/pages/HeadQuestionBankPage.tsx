import React, { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Database, Eye, Headphones, BookOpenText, Archive, ArchiveRestore } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { IQuestion } from '@toeic-vstep/shared';
import { useDocumentTitle } from '@/shared/hooks';
import { BarChart } from '@/shared/components/charts/Charts';
import { Column, Modal, Select } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { Figures, Panel, Status, TPageHead } from '@/roles/teacher/components/TeacherKit';
import { CrudEditor, QuestionRenderer, type CrudField } from '@/engines';
import { WordImportButton } from '@/shared/components/import/WordImportDialog';
import { errorMessage } from '@/shared/api/client';
import { toast } from '@/shared/stores/uiStore';
import { headApi, useHeadQuestionBank, type QuestionRow } from '@/shared/api/head';
import { EXAM_PARTS, partLabel, partShort, SKILL_VI, stars, toIQuestion } from '@/shared/constants/staff';
import type { SkillType } from '@/shared/types';
import { Stars } from '@/shared/components/ui/named-icon';

const chip = 'inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold';
const SKILL_OPTS = (Object.keys(SKILL_VI) as SkillType[]).map((s) => ({ value: s, label: SKILL_VI[s] }));
const EMPTY: QForm[] = [];

/** Hàng bảng + phương án tách riêng để hiệu đính trong form */
type QForm = QuestionRow & { optA?: string; optB?: string; optC?: string; optD?: string };
const toForm = (q: QuestionRow): QForm => {
  const o = Object.fromEntries((q.options ?? []).map((x) => [x.key, x.text]));
  return { ...q, optA: o.A ?? '', optB: o.B ?? '', optC: o.C ?? '', optD: o.D ?? '' };
};
const STATUS_VI: Record<string, { label: string; tone: 'green' | 'amber' | 'red' | 'gray' | 'blue' }> = {
  PUBLISHED: { label: 'Đã xuất bản', tone: 'green' },
  PENDING_REVIEW: { label: 'Chờ duyệt', tone: 'amber' },
  REJECTED: { label: 'Bị từ chối', tone: 'red' },
  DRAFT: { label: 'Nháp', tone: 'gray' },
  ARCHIVED: { label: 'Lưu trữ', tone: 'gray' },
};
const editFields: CrudField<QForm>[] = [
  { key: 'stem', label: 'Nội dung câu hỏi', type: 'textarea', required: true, colSpan: 2 },
  { key: 'optA', label: 'Phương án A', type: 'text' },
  { key: 'optB', label: 'Phương án B', type: 'text' },
  { key: 'optC', label: 'Phương án C', type: 'text' },
  { key: 'optD', label: 'Phương án D', type: 'text' },
  { key: 'correctAnswer', label: 'Đáp án đúng', type: 'select', options: ['A', 'B', 'C', 'D'].map((k) => ({ value: k, label: k })) },
  { key: 'explanation', label: 'Giải thích', type: 'textarea', colSpan: 2 },
];

const columns: Column<QForm>[] = [
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
      <Stars value={stars(r.difficulty)} label={`Độ khó ${stars(r.difficulty)}/5`} />
    ),
  },
  { key: 'status', header: 'Trạng thái', render: (r) => <Status tone={STATUS_VI[r.status]?.tone ?? 'gray'}>{STATUS_VI[r.status]?.label ?? r.status}</Status> },
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
  const rows = useMemo(() => (data?.items ? data.items.map(toForm) : EMPTY), [data]);
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ['head'] });
  const archive = async (q: QForm, archived: boolean) => {
    try {
      await headApi.archiveQuestion(q.id, archived);
      toast.success(archived ? 'Đã lưu trữ câu hỏi' : 'Đã khôi phục câu hỏi', archived ? 'Học viên không còn gặp câu này; bài làm cũ vẫn giữ nguyên.' : 'Câu hỏi xuất bản trở lại.');
      await refresh();
    } catch (e) {
      toast.error('Không thực hiện được', errorMessage(e));
    }
  };
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
      <TPageHead
        eyebrow="Học liệu bộ môn"
        title="Ngân hàng câu hỏi"
        sub="Tra cứu, hiệu đính (sửa nội dung, đáp án, giải thích) và lưu trữ câu hỏi thuộc bộ môn; xem trước đúng như học viên làm bài. Nhập đề từ file Word tự chia Part 1–7. Bảng hiển thị tối đa 200 câu theo bộ lọc Part."
        actions={<WordImportButton canChooseStatus onDone={() => void refresh()} />}
      />
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

      <CrudEditor<QForm>
        rows={rows}
        loading={isLoading}
        canCreate={false}
        canEditRow={(r) => r.status !== 'ARCHIVED'}
        canDeleteRow={() => false}
        onUpdate={async (row, v) => {
          const m = { ...row, ...v };
          const objective = (row.options ?? []).length > 0;
          const u = await headApi.updateQuestion(row.id, {
            stem: String(m.stem ?? '').trim(),
            ...(objective
              ? { options: (['A', 'B', 'C', 'D'] as const).map((k) => ({ key: k, text: String(m[`opt${k}` as const] ?? '').trim() })).filter((o) => o.text), correctAnswer: m.correctAnswer || null }
              : {}),
            explanation: m.explanation || null,
          });
          void refresh();
          return toForm(u);
        }}
        columns={columns}
        entityName="câu hỏi"
        idPrefix="q"
        pageSize={10}
        searchKeys={['stem', 'part']}
        filters={[
          { key: 'examType', label: 'Kỳ thi', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] },
          { key: 'skill', label: 'Kỹ năng', options: SKILL_OPTS },
          { key: 'status', label: 'Trạng thái', options: Object.entries(STATUS_VI).map(([value, v]) => ({ value, label: v.label })) },
        ]}
        fields={editFields}
        toolbarExtra={
          <div className="w-44">
            <Select inputSize="sm" placeholder="Part" value={part} onChange={(e) => setPart(e.target.value)} options={EXAM_PARTS.map((p) => ({ value: p.value, label: p.label }))} />
          </div>
        }
        rowActions={(row) => [
          { label: 'Xem trước', icon: <Eye />, onClick: () => void openPreview(row) },
          row.status === 'ARCHIVED'
            ? { label: 'Khôi phục', icon: <ArchiveRestore />, onClick: () => void archive(row, false) }
            : { label: 'Lưu trữ', icon: <Archive />, onClick: () => void archive(row, true) },
        ]}
      />

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Xem trước câu hỏi" size="lg">
        {preview && <QuestionRenderer question={preview} selectedAnswer={undefined} onSelectAnswer={() => undefined} showExplanation isReadOnly allowFlagReport={false} />}
      </Modal>
    </div>
  );
};
