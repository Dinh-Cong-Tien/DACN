import React from 'react';
import { FileText, Eye, Copy } from 'lucide-react';
import { MOCK_TESTS } from '@/shared/mocks';
import type { MockTestSummary } from '@/shared/types';
import { formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Column, PageHeader, StatCard } from '@/shared/components/ui';
import { CrudEditor, CrudField } from '@/engines';
import { toast } from '@/shared/stores/uiStore';

const columns: Column<MockTestSummary>[] = [
  {
    key: 'title',
    header: 'Đề thi',
    render: (t) => (
      <div>
        <p className="font-semibold text-slate-900">{t.title}</p>
        <p className="text-[11px] text-slate-400">
          {t.year} · {t.slug}
        </p>
      </div>
    ),
  },
  { key: 'examType', header: 'Kỳ thi', render: (t) => <Badge tone={t.examType === 'TOEIC' ? 'indigo' : 'emerald'} solid size="xs">{t.examType}</Badge> },
  { key: 'level', header: 'Cấp độ', render: (t) => <span className="text-xs font-semibold text-slate-600">{t.level}</span> },
  { key: 'durationMinutes', header: 'Thời gian', align: 'center', render: (t) => <span className="text-xs">{t.durationMinutes} phút</span> },
  { key: 'totalQuestions', header: 'Số câu', align: 'center', render: (t) => <span className="font-bold text-slate-700">{t.totalQuestions}</span> },
  { key: 'parts', header: 'Cấu trúc', render: (t) => <span className="text-xs text-slate-500">{t.parts.join(', ')}</span> },
  { key: 'attempts', header: 'Lượt làm', align: 'right', render: (t) => <span className="text-xs font-semibold">{formatNumber(t.attempts)}</span> },
  { key: 'isFree', header: 'Quyền', render: (t) => <Badge tone={t.isFree ? 'emerald' : 'amber'} size="xs">{t.isFree ? 'Miễn phí' : 'VIP'}</Badge> },
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
      <PageHeader title="Cấu hình đề thi (Tests)" icon={<FileText />} description="Quản lý danh sách đề thi thử, thời lượng, cấu trúc Part và quyền truy cập Free/VIP." />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Tổng đề thi" value={MOCK_TESTS.length} tone="indigo" />
        <StatCard label="Đề TOEIC" value={MOCK_TESTS.filter((t) => t.examType === 'TOEIC').length} tone="violet" />
        <StatCard label="Đề VSTEP" value={MOCK_TESTS.filter((t) => t.examType === 'VSTEP').length} tone="emerald" />
        <StatCard label="Tổng lượt làm" value={totalAttempts} tone="amber" format={formatNumber} />
      </div>
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
