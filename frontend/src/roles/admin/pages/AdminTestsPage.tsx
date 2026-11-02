import React from 'react';
import { Eye, Copy, Clock, FileText, Flame, Layers, PlayCircle, Crown } from 'lucide-react';
import { MOCK_TESTS } from '@/shared/mocks';
import type { MockTestSummary } from '@/shared/types';
import { formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Column } from '@/shared/components/ui';
import { HBarChart } from '@/shared/components/charts/Charts';
import { Figures, Panel, TBtn, TPageHead } from '@/roles/teacher/components/TeacherKit';
import { Img } from '@/shared/components/media/Img';
import { CrudEditor, CrudField } from '@/engines';
import { toast } from '@/shared/stores/uiStore';

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
  { key: 'totalQuestions', label: 'Tổng số câu', type: 'number', required: true },
  { key: 'year', label: 'Năm', type: 'number' },
  { key: 'isFree', label: 'Miễn phí', type: 'toggle', hint: 'Tắt để chỉ tài khoản VIP được làm' },
];

export const AdminTestsPage: React.FC = () => {
  useDocumentTitle('Cấu hình đề thi');
  const totalAttempts = MOCK_TESTS.reduce((a, t) => a + t.attempts, 0);
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
          { label: 'Tổng đề thi', value: MOCK_TESTS.length, note: 'đang phát hành', icon: FileText, tone: 'indigo' },
          { label: 'Đề TOEIC', value: MOCK_TESTS.filter((t) => t.examType === 'TOEIC').length, note: 'ETS 2023–2025', icon: Layers, tone: 'violet' },
          { label: 'Đề VSTEP', value: MOCK_TESTS.filter((t) => t.examType === 'VSTEP').length, note: 'B1 · B2 · C1', icon: Layers, tone: 'emerald' },
          { label: 'Tổng lượt làm', value: formatNumber(totalAttempts), note: '+11% tháng này', icon: PlayCircle, tone: 'amber' },
        ]}
      />
      <Panel title="Đề được làm nhiều nhất" sub="Lượt làm bài từ khi phát hành" icon={Flame} tone="rose">
        <HBarChart
          ariaLabel="Lượt làm theo đề thi"
          labelWidth={150}
          format={(v) => formatNumber(v)}
          data={[...MOCK_TESTS].sort((x, y) => y.attempts - x.attempts).slice(0, 6).map((t) => ({ label: t.title, value: t.attempts }))}
        />
      </Panel>
      <CrudEditor<MockTestSummary>
        rows={MOCK_TESTS}
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
        defaultValues={{ examType: 'TOEIC', level: '550+', durationMinutes: 120, totalQuestions: 200, parts: ['Part 1–7'], attempts: 0, isFree: true, year: new Date().getFullYear(), slug: '', tags: [] }}
        rowActions={(t) => [
          { label: 'Xem trước đề', icon: <Eye />, onClick: () => toast.info('Xem trước đề', `Mở "${t.title}" ở chế độ xem thử (demo).`) },
          { label: 'Nhân bản', icon: <Copy />, onClick: () => toast.success('Đã nhân bản', `Bản sao của "${t.title}" đã được tạo ở trạng thái nháp.`) },
        ]}
      />
    </div>
  );
};
