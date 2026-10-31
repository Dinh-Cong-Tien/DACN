import React, { useMemo, useState } from 'react';
import { Timer, Volume2, Flag, ClipboardCheck } from 'lucide-react';
import { MOCK_TESTS } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { Accent, PageHeader, Section, SectionHead, UnderlineTabs, CtaStrip } from './shared/PageKit';
import { TestList } from './shared/TestList';

type Exam = 'TOEIC' | 'VSTEP';
type Kind = 'ALL' | 'FULL' | 'MINI' | 'FREE';

const isFull = (t: (typeof MOCK_TESTS)[number]) => t.totalQuestions >= 150 || t.parts.length >= 4;

const ROOM = [
  { icon: Timer, title: 'Đồng hồ đếm ngược', text: 'TOEIC 120 phút, VSTEP theo từng kỹ năng. Hết giờ tự nộp bài.' },
  { icon: Volume2, title: 'Audio phát một lần', text: 'Không tua, không dừng, đúng như phòng thi IIG và các trường tổ chức VSTEP.' },
  { icon: Flag, title: 'Đánh dấu để xem lại', text: 'Gắn cờ câu chưa chắc, bảng câu hỏi bên phải cho biết còn bao nhiêu câu bỏ trống.' },
  { icon: ClipboardCheck, title: 'Chấm ngay khi nộp', text: 'Có điểm quy đổi, giải thích từng câu; câu sai tự vào sổ tay lỗi sai.' },
];

export const MockTestsPage: React.FC = () => {
  useDocumentTitle('Đề thi thử');
  const gate = useGate();
  const [exam, setExam] = useState<Exam>('TOEIC');
  const [kind, setKind] = useState<Kind>('ALL');
  const list = useMemo(
    () => MOCK_TESTS.filter((t) => t.examType === exam).filter((t) => (kind === 'ALL' ? true : kind === 'FREE' ? t.isFree : kind === 'FULL' ? isFull(t) : !isFull(t))),
    [exam, kind]
  );

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Đề thi thử' }]}
        eyebrow="Thi thử"
        title={<>Đề thi thử <Accent>TOEIC và VSTEP</Accent></>}
        lead="Đề TOEIC theo format ETS mới nhất và đề VSTEP theo định dạng của Bộ GD&ĐT. Làm trên máy như thi thật, nộp bài là có điểm và giải thích."
        facts={[
          { value: '96', label: 'Đề TOEIC' },
          { value: '87', label: 'Đề VSTEP' },
          { value: '3 đề / tuần', label: 'Miễn phí với tài khoản Free' },
        ]}
      />

      <Section innerClassName="pt-8 md:pt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <UnderlineTabs
            className="md:flex-1"
            value={exam}
            onChange={(v) => {
              setExam(v);
              setKind('ALL');
            }}
            items={[
              { value: 'TOEIC', label: 'TOEIC', count: MOCK_TESTS.filter((t) => t.examType === 'TOEIC').length },
              { value: 'VSTEP', label: 'VSTEP', count: MOCK_TESTS.filter((t) => t.examType === 'VSTEP').length },
            ]}
          />
          {/* Lọc loại đề: nhóm nút liền (segmented) */}
          <div role="radiogroup" aria-label="Loại đề" className="inline-flex self-start rounded-lg border border-slate-300 p-0.5 md:mb-1">
            {(
              [
                ['ALL', 'Tất cả'],
                ['FULL', 'Full test'],
                ['MINI', 'Theo kỹ năng / Part'],
                ['FREE', 'Miễn phí'],
              ] as [Kind, string][]
            ).map(([k, l]) => (
              <button
                key={k}
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={cn('rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors', kind === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900')}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 mb-3 text-[13px] text-slate-500">
          Hiển thị {list.length} đề · sắp theo năm phát hành
        </p>
        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center text-sm text-slate-500">Chưa có đề thuộc loại này.</div>
        ) : (
          <TestList tests={[...list].sort((a, b) => b.year - a.year)} />
        )}
      </Section>

      <Section muted>
        <SectionHead title="Phòng thi thử hoạt động thế nào" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ROOM.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon className="h-5 w-5 text-indigo-700" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <CtaStrip title="Lưu lại kết quả và câu sai" text="Tài khoản miễn phí giữ lịch sử điểm và tự lên lịch ôn lại các câu làm sai." action={{ label: 'Tạo tài khoản miễn phí', to: gate('/app/mock-tests', '/auth/register') }} />
        </div>
      </Section>
    </div>
  );
};
