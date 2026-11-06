import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FilePenLine, FileText, ListChecks, MessageSquareWarning, Send, Undo2, Clock3, CheckCircle2, ClipboardList } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Column } from '@/shared/components/ui';
import { CrudEditor, type CrudField } from '@/engines';
import { authoringApi, tKeys, useAuthorBank, useAuthorQuestions, useAuthorTests, type AuthorTest, type ContentStatus } from '@/shared/api/teacher';
import type { QuestionRow } from '@/shared/api/head';
import { errorMessage } from '@/shared/api/client';
import { EXAM_PARTS, partLabel } from '@/shared/constants/staff';
import { toast } from '@/shared/stores/uiStore';
import type { ExamType } from '@/shared/types';
import { TestQuestionsDialog, type TestQuestionsSource } from '@/roles/admin/components/TestQuestionsDialog';
import { Figures, Status, TPageHead, TTabs, type StatusTone } from '../components/TeacherKit';

/**
 * Học liệu giáo viên tự soạn (mục II [CƠ BẢN]): câu hỏi và đề kiểm tra.
 * Vòng đời: Nháp → Gửi duyệt → Trưởng bộ môn duyệt (xuất bản tới học viên, giao được cho lớp) / từ chối kèm góp ý → sửa, gửi lại.
 */

const STATUS: Record<ContentStatus, { label: string; tone: StatusTone }> = {
  DRAFT: { label: 'Nháp', tone: 'gray' },
  PENDING_REVIEW: { label: 'Chờ duyệt', tone: 'amber' },
  PUBLISHED: { label: 'Đã duyệt', tone: 'green' },
  REJECTED: { label: 'Cần sửa', tone: 'red' },
  ARCHIVED: { label: 'Lưu trữ', tone: 'gray' },
};
const EDITABLE = (s: string) => s === 'DRAFT' || s === 'REJECTED';
const StatusCell: React.FC<{ status: string; note?: string }> = ({ status, note }) => (
  <div className="min-w-0">
    <Status tone={STATUS[status as ContentStatus]?.tone ?? 'gray'}>{STATUS[status as ContentStatus]?.label ?? status}</Status>
    {status === 'REJECTED' && note && (
      <p className="mt-0.5 max-w-[240px] truncate text-xs text-rose-600" title={note}>
        Góp ý: {note}
      </p>
    )}
  </div>
);

// ---------------- Câu hỏi ----------------
type QForm = QuestionRow & { reviewNote?: string; optA?: string; optB?: string; optC?: string; optD?: string };

const QTYPE_OPTS = [
  { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm' },
  { value: 'ESSAY', label: 'Đề Viết' },
  { value: 'SPEAKING_RESPONSE', label: 'Đề Nói' },
];
/** Kỹ năng suy ra từ Part + loại câu (giáo viên không phải chọn thêm) */
function skillOf(part: string, type: string) {
  if (type === 'ESSAY') return 'WRITING';
  if (type === 'SPEAKING_RESPONSE') return 'SPEAKING';
  if (/TOEIC_P[1-4]|VSTEP_L/.test(part)) return 'LISTENING';
  if (part === 'TOEIC_P5') return 'GRAMMAR';
  if (/VSTEP_W/.test(part)) return 'WRITING';
  if (/VSTEP_S/.test(part)) return 'SPEAKING';
  return 'READING';
}
const toForm = (q: QuestionRow & { reviewNote?: string }): QForm => {
  const o = Object.fromEntries((q.options ?? []).map((x) => [x.key, x.text]));
  return { ...q, optA: o.A ?? '', optB: o.B ?? '', optC: o.C ?? '', optD: o.D ?? '' };
};
function toInput(v: Partial<QForm>) {
  const type = (v.type as 'SINGLE_CHOICE' | 'ESSAY' | 'SPEAKING_RESPONSE') ?? 'SINGLE_CHOICE';
  const part = String(v.part ?? '');
  const exam = (v.examType ?? 'TOEIC') as ExamType;
  if (!part.startsWith(exam)) throw new Error(`Part ${partLabel(part)} không thuộc kỳ thi ${exam}`);
  const objective = type === 'SINGLE_CHOICE';
  const options = objective
    ? (['A', 'B', 'C', 'D'] as const).map((k) => ({ key: k, text: String(v[`opt${k}` as const] ?? '').trim() })).filter((o) => o.text)
    : null;
  return {
    examType: exam,
    part,
    type,
    skill: skillOf(part, type),
    stem: String(v.stem ?? '').trim(),
    options,
    correctAnswer: objective ? (v.correctAnswer || null) : null,
    explanation: v.explanation || null,
    audioUrl: v.audioUrl || null,
    imageUrl: v.imageUrl || null,
  };
}

const qColumns: Column<QForm>[] = [
  {
    key: 'stem',
    header: 'Câu hỏi',
    render: (r) => (
      <div className="max-w-md">
        <p className="truncate font-medium text-slate-900" title={r.stem}>
          {r.stem}
        </p>
        <p className="text-xs text-slate-400">
          {r.examType} · {partLabel(r.part)} · {QTYPE_OPTS.find((t) => t.value === r.type)?.label ?? r.type}
        </p>
      </div>
    ),
  },
  { key: 'correctAnswer', header: 'Đáp án', align: 'center', render: (r) => (r.type === 'SINGLE_CHOICE' ? <span className="font-semibold text-slate-800">{r.correctAnswer || '—'}</span> : <span className="text-xs text-slate-400">Tự luận</span>) },
  { key: 'status', header: 'Trạng thái', render: (r) => <StatusCell status={r.status} note={r.reviewNote} /> },
];
const qFields: CrudField<QForm>[] = [
  { key: 'examType', label: 'Kỳ thi', type: 'select', required: true, options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] },
  { key: 'part', label: 'Part', type: 'select', required: true, options: EXAM_PARTS.map((p) => ({ value: p.value, label: p.label })) },
  { key: 'type', label: 'Loại câu', type: 'select', required: true, options: QTYPE_OPTS },
  { key: 'correctAnswer', label: 'Đáp án đúng (trắc nghiệm)', type: 'select', options: ['A', 'B', 'C', 'D'].map((k) => ({ value: k, label: k })) },
  { key: 'stem', label: 'Nội dung câu hỏi / đề bài', type: 'textarea', required: true, colSpan: 2 },
  { key: 'optA', label: 'Phương án A', type: 'text' },
  { key: 'optB', label: 'Phương án B', type: 'text' },
  { key: 'optC', label: 'Phương án C', type: 'text' },
  { key: 'optD', label: 'Phương án D', type: 'text', hint: 'Part 2 TOEIC chỉ có A–C' },
  { key: 'explanation', label: 'Giải thích đáp án', type: 'textarea', colSpan: 2 },
  { key: 'audioUrl', label: 'Link audio (câu Nghe)', type: 'text', placeholder: 'https://…' },
  { key: 'imageUrl', label: 'Link ảnh (nếu có)', type: 'text', placeholder: 'https://…' },
];

// ---------------- Đề kiểm tra ----------------
type TForm = AuthorTest & { durationMin?: number };
const tColumns: Column<TForm>[] = [
  {
    key: 'title',
    header: 'Đề kiểm tra',
    render: (r) => (
      <div className="max-w-md">
        <p className="truncate font-medium text-slate-900">{r.title}</p>
        <p className="text-xs text-slate-400">
          {r.examType} · {r.kind === 'QUIZ' ? 'Bài kiểm tra ngắn' : 'Đề rút gọn'} · {r.parts.join(', ') || 'chưa có Part'}
        </p>
      </div>
    ),
  },
  { key: 'totalQuestions', header: 'Số câu', align: 'center', render: (r) => <span className="tabular-nums">{r.totalQuestions}</span> },
  { key: 'durationMinutes', header: 'Thời gian', align: 'center', render: (r) => <span className="tabular-nums">{r.durationMinutes} phút</span> },
  { key: 'status', header: 'Trạng thái', render: (r) => <StatusCell status={r.status} note={r.reviewNote} /> },
];
const tFields: CrudField<TForm>[] = [
  { key: 'title', label: 'Tên đề', type: 'text', required: true, colSpan: 2, placeholder: 'VD: Kiểm tra Part 5 — tuần 3' },
  { key: 'examType', label: 'Kỳ thi', type: 'select', required: true, options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }], hint: 'Không đổi được khi đề đã có câu' },
  { key: 'kind', label: 'Loại đề', type: 'select', required: true, options: [{ value: 'MINI', label: 'Đề rút gọn (hiện trong kho đề sau khi duyệt)' }, { value: 'QUIZ', label: 'Bài kiểm tra ngắn (chỉ giao cho lớp)' }] },
  { key: 'durationMin', label: 'Thời gian (phút)', type: 'number', required: true },
  { key: 'level', label: 'Trình độ', type: 'text', placeholder: 'VD: 450–650, B1' },
];

export const TeacherAuthoringPage: React.FC = () => {
  useDocumentTitle('Học liệu của tôi');
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'tests' ? 'tests' : 'questions';
  const [composing, setComposing] = useState<{ id: string; title: string; examType: ExamType } | null>(null);
  const qs = useAuthorQuestions({ pageSize: 200 });
  const ts = useAuthorTests();
  const refresh = () => qc.invalidateQueries({ queryKey: tKeys.all });

  const qRows = useMemo(() => (qs.data?.items ?? []).map((q) => toForm(q as QuestionRow & { reviewNote?: string })), [qs.data]);
  const tRows = useMemo(() => (ts.data ?? []).map((t) => ({ ...t, durationMin: t.durationMinutes })), [ts.data]);
  const all = [...qRows.map((r) => r.status), ...tRows.map((r) => r.status)];
  const count = (s: string) => all.filter((x) => x === s).length;

  const act = async (fn: () => Promise<unknown>, ok: string, sub?: string) => {
    try {
      await fn();
      toast.success(ok, sub);
      await refresh();
    } catch (e) {
      toast.error('Không thực hiện được', errorMessage(e));
    }
  };
  const lifecycleActions = (kind: 'questions' | 'tests', row: { id: string; status: string }) => [
    ...(EDITABLE(row.status)
      ? [{ label: row.status === 'REJECTED' ? 'Gửi duyệt lại' : 'Gửi duyệt', icon: <Send />, onClick: () => void act(() => authoringApi.submit(kind, row.id), 'Đã gửi trưởng bộ môn duyệt', 'Bạn sẽ nhận thông báo khi có kết quả.') }]
      : []),
    ...(row.status === 'PENDING_REVIEW' ? [{ label: 'Rút lại để sửa', icon: <Undo2 />, onClick: () => void act(() => authoringApi.withdraw(kind, row.id), 'Đã rút lại', 'Nội dung trở về bản nháp.') }] : []),
  ];

  const source: TestQuestionsSource = {
    load: (id) => authoringApi.test(id),
    save: (id, ids) => authoringApi.setTestQuestions(id, ids),
    useBank: useAuthorBank,
    bankTitle: 'Câu đã duyệt + câu của bạn —',
    onSaved: () => void refresh(),
  };

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Bài tập', to: '/teacher/assignments' }, { label: 'Soạn câu hỏi & đề' }]}
        title="Học liệu của tôi"
        sub="Soạn câu hỏi và đề kiểm tra cho lớp. Nội dung được trưởng bộ môn duyệt mới xuất bản tới học viên và giao được cho lớp."
      />
      <Figures
        items={[
          { label: 'Bản nháp', value: count('DRAFT'), note: 'chưa gửi duyệt', icon: FilePenLine, tone: 'sky' },
          { label: 'Chờ duyệt', value: count('PENDING_REVIEW'), note: 'trưởng bộ môn đang xem', icon: Clock3, tone: 'amber' },
          { label: 'Cần sửa', value: count('REJECTED'), note: 'có góp ý của trưởng bộ môn', icon: MessageSquareWarning, tone: 'rose' },
          { label: 'Đã duyệt', value: count('PUBLISHED'), note: 'đã xuất bản, giao được', icon: CheckCircle2, tone: 'emerald' },
        ]}
      />
      <TTabs
        items={[
          { key: 'questions', label: 'Câu hỏi', count: qRows.length },
          { key: 'tests', label: 'Đề kiểm tra', count: tRows.length },
        ]}
        value={tab}
        onChange={(k) => setParams(k === 'tests' ? { tab: 'tests' } : {}, { replace: true })}
      />

      {tab === 'questions' ? (
        <CrudEditor<QForm>
          key="questions"
          rows={qRows}
          loading={qs.isLoading}
          columns={qColumns}
          fields={qFields}
          entityName="câu hỏi"
          createLabel="Soạn câu hỏi"
          idPrefix="q"
          pageSize={10}
          searchKeys={['stem']}
          filters={[
            { key: 'status', label: 'Trạng thái', options: (Object.keys(STATUS) as ContentStatus[]).filter((s) => s !== 'ARCHIVED').map((s) => ({ value: s, label: STATUS[s].label })) },
            { key: 'examType', label: 'Kỳ thi', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] },
          ]}
          defaultValues={{ examType: 'TOEIC', part: 'TOEIC_P5', type: 'SINGLE_CHOICE' } as Partial<QForm>}
          canEditRow={(r) => EDITABLE(r.status)}
          canDeleteRow={(r) => EDITABLE(r.status)}
          onCreate={async (v) => toForm(await authoringApi.createQuestion(toInput(v)))}
          onUpdate={async (row, v) => toForm(await authoringApi.updateQuestion(row.id, toInput({ ...row, ...v })))}
          onDelete={async (row) => {
            await authoringApi.deleteQuestion(row.id);
            await refresh();
          }}
          rowActions={(r) => lifecycleActions('questions', r)}
        />
      ) : (
        <CrudEditor<TForm>
          key="tests"
          rows={tRows}
          loading={ts.isLoading}
          columns={tColumns}
          fields={tFields}
          entityName="đề kiểm tra"
          createLabel="Tạo đề kiểm tra"
          idPrefix="t"
          pageSize={10}
          searchKeys={['title']}
          filters={[{ key: 'status', label: 'Trạng thái', options: (Object.keys(STATUS) as ContentStatus[]).filter((s) => s !== 'ARCHIVED').map((s) => ({ value: s, label: STATUS[s].label })) }]}
          defaultValues={{ examType: 'TOEIC', kind: 'MINI', durationMin: 20 } as Partial<TForm>}
          canEditRow={(r) => EDITABLE(r.status)}
          canDeleteRow={(r) => EDITABLE(r.status)}
          onCreate={async (v) => {
            const t = await authoringApi.createTest({ title: String(v.title ?? ''), examType: (v.examType ?? 'TOEIC') as ExamType, kind: (v.kind === 'QUIZ' ? 'QUIZ' : 'MINI'), durationMin: Number(v.durationMin) || 20, level: v.level || null });
            setComposing({ id: t.id, title: t.title, examType: t.examType });
            return { ...t, durationMin: t.durationMinutes };
          }}
          onUpdate={async (row, v) => {
            const t = await authoringApi.updateTest(row.id, { title: v.title, examType: v.examType as ExamType, kind: v.kind === 'QUIZ' ? 'QUIZ' : 'MINI', durationMin: v.durationMin ? Number(v.durationMin) : undefined, level: v.level || null });
            return { ...t, durationMin: t.durationMinutes };
          }}
          onDelete={async (row) => {
            await authoringApi.deleteTest(row.id);
            await refresh();
          }}
          rowActions={(r) => [
            ...(EDITABLE(r.status) ? [{ label: 'Câu hỏi trong đề', icon: <ListChecks />, onClick: () => setComposing({ id: r.id, title: r.title, examType: r.examType }) }] : []),
            ...lifecycleActions('tests', r),
          ]}
        />
      )}

      {tab === 'tests' && !tRows.length && !ts.isLoading && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <ClipboardList className="h-4 w-4" /> Đề kiểm tra ghép từ câu hỏi đã duyệt trong ngân hàng và câu hỏi bạn soạn; câu mới của bạn được duyệt cùng đề.
        </p>
      )}
      {tab === 'questions' && !qRows.length && !qs.isLoading && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <FileText className="h-4 w-4" /> Câu hỏi soạn xong ở trạng thái nháp; bấm "Gửi duyệt" ở menu từng dòng để gửi trưởng bộ môn.
        </p>
      )}

      <TestQuestionsDialog test={composing} onClose={() => setComposing(null)} source={source} />
    </div>
  );
};
