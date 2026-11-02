import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Copy, Clock, FileText, Flame, Layers, PlayCircle, Crown, ListOrdered, Send, Undo2 } from 'lucide-react';
import { adminApi, useAdminInvalidate, useAdminTests, type AdminTestRow } from '@/shared/api/admin';
import { formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Column } from '@/shared/components/ui';
import { HBarChart } from '@/shared/components/charts/Charts';
import { Figures, Panel, TBtn, TPageHead } from '@/roles/teacher/components/TeacherKit';
import { Img } from '@/shared/components/media/Img';
import { CrudEditor, CrudField } from '@/engines';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { TestQuestionsDialog } from '../components/TestQuestionsDialog';

const STATUS: Record<string, [string, string]> = {
  PUBLISHED: ['bg-emerald-500', 'Công khai'],
  PENDING_REVIEW: ['bg-amber-500', 'Chờ duyệt'],
  DRAFT: ['bg-slate-400', 'Nháp'],
  REJECTED: ['bg-rose-500', 'Bị từ chối'],
  ARCHIVED: ['bg-slate-400', 'Lưu trữ'],
};

type MockTestSummary = AdminTestRow;

const columns: Column<MockTestSummary>[] = [
  {
    key: 'title',
    header: 'Đề thi',
    render: (t) => (
      <div className="flex items-center gap-3">
        {t.coverUrl && <Img src={t.coverUrl} alt={t.title} wrapperClass="w-14 h-10 rounded-lg overflow-hidden ring-1 ring-slate-200 shrink-0" fallbackClass="bg-indigo-200" />}
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{t.title}</p>
          <p className="text-xs text-slate-500">
            {t.year} · {t.slug}
          </p>
        </div>
      </div>
    ),
  },
  { key: 'examType', header: 'Kỳ thi', render: (t) => <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold text-white ${t.examType === 'TOEIC' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>{t.examType}</span> },
  { key: 'level', header: 'Cấp độ', render: (t) => <span className="whitespace-nowrap text-[13px] text-slate-700">{t.level}</span> },
  {
    key: 'durationMinutes',
    header: 'Thời gian',
    align: 'center',
    render: (t) => (
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] tabular-nums text-slate-700">
        <Clock className="w-3.5 h-3.5 text-slate-400" /> {t.durationMinutes} phút
      </span>
    ),
  },
  { key: 'totalQuestions', header: 'Số câu', align: 'center', render: (t) => <span className="font-semibold tabular-nums text-slate-900">{t.totalQuestions}</span> },
  { key: 'parts', header: 'Cấu trúc', render: (t) => <span className="text-xs text-slate-600">{t.parts.join(', ')}</span> },
  { key: 'attempts', header: 'Lượt làm', align: 'right', render: (t) => <span className="text-[13px] font-semibold tabular-nums text-slate-900">{formatNumber(t.attempts)}</span> },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (t) => (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-slate-700">
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS[t.status]?.[0] ?? 'bg-slate-400'}`} />
        {STATUS[t.status]?.[1] ?? t.status}
      </span>
    ),
  },
  {
    key: 'isFree',
    header: 'Quyền',
    render: (t) =>
      t.isFree ? (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Miễn phí</span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[11px] font-bold text-white"><Crown className="h-3 w-3" /> VIP</span>
      ),
  },
];

const fields: CrudField<MockTestSummary>[] = [
  { key: 'title', label: 'Tên đề thi', type: 'text', required: true, placeholder: 'ETS TOEIC 2025 — Test 2', colSpan: 2 },
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
  { key: 'level', label: 'Cấp độ', type: 'text', placeholder: '550–750' },
  { key: 'durationMinutes', label: 'Thời gian (phút)', type: 'number', required: true },
  { key: 'year', label: 'Năm', type: 'number' },
  { key: 'isFree', label: 'Miễn phí', type: 'toggle', hint: 'Tắt để chỉ tài khoản VIP được làm' },
];

export const AdminTestsPage: React.FC = () => {
  useDocumentTitle('Cấu hình đề thi');
  const navigate = useNavigate();
  const { data, isLoading } = useAdminTests();
  const refresh = useAdminInvalidate();
  const [editingQ, setEditingQ] = useState<MockTestSummary | null>(null);
  const closeQ = React.useCallback(() => setEditingQ(null), []);
  const run = (p: Promise<unknown>, ok: string, desc: string) =>
    p.then(() => { toast.success(ok, desc); void refresh(); }).catch((e) => toast.error('Không thực hiện được', errorMessage(e)));
  const testRows = useMemo<MockTestSummary[]>(() => data ?? [], [data]);
  const years = testRows.map((t) => t.year).filter(Boolean);
  const payload = (v: Partial<MockTestSummary>) => ({ title: v.title, examType: v.examType, level: v.level || undefined, durationMin: Number(v.durationMinutes) || 120, year: v.year ? Number(v.year) : undefined, isFree: !!v.isFree });
  const totalAttempts = testRows.reduce((a, t) => a + t.attempts, 0);
  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Nội dung · Ngân hàng đề"
        title="Cấu hình đề thi"
        sub="Đề thi thử học viên đang làm: thời lượng, cấu trúc Part và quyền truy cập Miễn phí / VIP. Đề mới cần Trưởng bộ môn duyệt trước khi công khai."
        actions={
          <TBtn to="/mock-tests" icon={<Eye />}>
            Xem như học viên
          </TBtn>
        }
      />
      <Figures
        items={[
          { label: 'Tổng đề thi', value: testRows.length, note: 'đang phát hành', icon: FileText, tone: 'indigo' },
          { label: 'Đề TOEIC', value: testRows.filter((t) => t.examType === 'TOEIC').length, note: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '—', icon: Layers, tone: 'violet' },
          { label: 'Đề VSTEP', value: testRows.filter((t) => t.examType === 'VSTEP').length, note: [...new Set(testRows.filter((t) => t.examType === 'VSTEP').map((t) => t.level).filter(Boolean))].join(' · ') || '—', icon: Layers, tone: 'emerald' },
          { label: 'Tổng lượt làm', value: formatNumber(totalAttempts), note: 'từ khi phát hành', icon: PlayCircle, tone: 'amber' },
        ]}
      />
      <Panel title="Đề được làm nhiều nhất" sub="Lượt làm bài từ khi phát hành" icon={Flame} tone="rose">
        {totalAttempts === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">Chưa có lượt làm bài nào.</p>
        ) : (
        <HBarChart
          ariaLabel="Lượt làm theo đề thi"
          labelWidth={150}
          format={(v) => formatNumber(v)}
          data={[...testRows].sort((x, y) => y.attempts - x.attempts).slice(0, 6).map((t) => ({ label: t.title, value: t.attempts }))}
        />
        )}
      </Panel>
      <CrudEditor<MockTestSummary>
        rows={testRows}
        loading={isLoading}
        onCreate={async (v) => {
          const t = await adminApi.createTest(payload(v));
          void refresh();
          return t;
        }}
        onUpdate={async (row, v) => {
          const t = await adminApi.updateTest(row.id, payload(v));
          void refresh();
          return t;
        }}
        onDelete={async (row) => {
          await adminApi.deleteTest(row.id);
          void refresh();
        }}
        columns={columns}
        fields={fields}
        entityName="đề thi"
        createLabel="Tạo đề thi"
        idPrefix="test"
        searchKeys={['title', 'slug']}
        filters={[
          {
            key: 'examType',
            label: 'Kỳ thi',
            options: [
              { value: 'TOEIC', label: 'TOEIC' },
              { value: 'VSTEP', label: 'VSTEP' },
            ],
          },
        ]}
        defaultValues={{ examType: 'TOEIC', level: '', durationMinutes: 120, isFree: true, year: new Date().getFullYear() }}
        rowActions={(t) => [
          { label: 'Câu hỏi trong đề', icon: <ListOrdered />, onClick: () => setEditingQ(t) },
          { label: 'Xem trước đề', icon: <Eye />, onClick: () => navigate(`/app/mock-tests/${t.slug}`) },
          ...(t.status === 'DRAFT' || t.status === 'REJECTED'
            ? [{ label: 'Gửi Trưởng bộ môn duyệt', icon: <Send />, onClick: () => void run(adminApi.updateTest(t.id, { status: 'PENDING_REVIEW' }), 'Đã gửi duyệt', `"${t.title}" nằm trong hàng chờ phê duyệt của Trưởng bộ môn.`) }]
            : []),
          ...(t.status === 'PUBLISHED' || t.status === 'PENDING_REVIEW'
            ? [{ label: 'Chuyển về nháp', icon: <Undo2 />, onClick: () => void run(adminApi.updateTest(t.id, { status: 'DRAFT' }), 'Đã chuyển về nháp', `"${t.title}" không còn hiển thị với học viên.`) }]
            : []),
          { label: 'Nhân bản', icon: <Copy />, onClick: () => void run(adminApi.duplicateTest(t.id), 'Đã nhân bản', `Bản sao của "${t.title}" (kèm ${t.totalQuestions} câu) ở trạng thái nháp.`) },
        ]}
      />
      <TestQuestionsDialog test={editingQ} onClose={closeQ} />
    </div>
  );
};
