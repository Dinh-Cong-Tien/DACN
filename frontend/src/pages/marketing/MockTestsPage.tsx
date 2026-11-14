import React, { useMemo, useState } from 'react';
import { Timer, Volume2, Flag, ClipboardCheck } from 'lucide-react';
import { useTests } from '@/shared/api/catalog';
import { limitText, usePlans } from '@/shared/api/cms';
import type { MockTestSummary } from '@/shared/types';
import { useDocumentTitle, useGate, useParamState } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { Accent, PageHeader, Section, SectionHead, CtaStrip } from './shared/PageKit';
import { TestList } from './shared/TestList';

type Exam = 'TOEIC' | 'VSTEP';
type Kind = 'ALL' | 'FULL' | 'MINI' | 'FREE';

const isFull = (t: MockTestSummary) => t.totalQuestions >= 150 || t.parts.length >= 4;

const ROOM = [
  { icon: Timer, title: 'Đồng hồ đếm ngược', text: 'TOEIC 120 phút, VSTEP theo từng kỹ năng. Hết giờ tự nộp bài.' },
  { icon: Volume2, title: 'Audio phát một lần', text: 'Không tua, không dừng, đúng như phòng thi IIG và các trường tổ chức VSTEP.' },
  { icon: Flag, title: 'Đánh dấu để xem lại', text: 'Gắn cờ câu chưa chắc, bảng câu hỏi bên phải cho biết còn bao nhiêu câu bỏ trống.' },
  { icon: ClipboardCheck, title: 'Chấm ngay khi nộp', text: 'Có điểm quy đổi, giải thích từng câu; câu sai tự vào sổ tay lỗi sai.' },
];

/** Nội dung riêng của từng kỳ thi — đề thi thử nằm trong mục TOEIC / VSTEP trên menu */
const EXAM_INFO: Record<Exam, { home: string; lead: string }> = {
  TOEIC: { home: '/toeic', lead: 'Đề TOEIC full 200 câu theo format Listening & Reading và đề luyện theo từng Part. Làm trên máy như thi thật, nộp bài là có điểm quy đổi và giải thích.' },
  VSTEP: { home: '/vstep', lead: 'Đề VSTEP theo định dạng của Bộ GD&ĐT: Nghe, Đọc, Viết, Nói. Phần Nghe và Đọc chấm ngay khi nộp, Viết và Nói do giáo viên chấm.' },
};

export const MockTestsPage: React.FC = () => {
  const gate = useGate();
  const [exam] = useParamState<Exam>('exam', ['TOEIC', 'VSTEP'], 'TOEIC');
  useDocumentTitle(`Đề thi thử ${exam}`);
  const [kind, setKind] = useState<Kind>('ALL');
  const { data: testList = [], isLoading } = useTests();
  const { data: plans = [] } = usePlans();
  const freeMock = limitText(plans.find((p) => p.price === 0)?.entitlements?.MOCK_TEST, 'đề');
  const list = useMemo(
    () => testList.filter((t) => t.examType === exam).filter((t) => (kind === 'ALL' ? true : kind === 'FREE' ? t.isFree : kind === 'FULL' ? isFull(t) : !isFull(t))),
    [exam, kind, testList]
  );
  const mine = testList.filter((t) => t.examType === exam);
  // đổi kỳ thi qua menu → bỏ bộ lọc loại đề cũ
  React.useEffect(() => setKind('ALL'), [exam]);

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: exam, to: EXAM_INFO[exam].home }, { label: 'Đề thi thử' }]}
        eyebrow={exam}
        title={<>Đề thi thử <Accent>{exam}</Accent></>}
        lead={EXAM_INFO[exam].lead}
        facts={[
          { value: isLoading ? '…' : String(mine.length), label: `Đề ${exam}` },
          { value: isLoading ? '…' : String(mine.filter(isFull).length), label: 'Đề full test' },
          { value: freeMock ?? '…', label: 'Thi thử với tài khoản Free' },
        ]}
      />

      <Section innerClassName="pt-8 md:pt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-slate-500">
            Hiển thị {list.length} đề {exam} · sắp theo năm phát hành
          </p>
          {/* Lọc loại đề: nhóm nút liền (segmented) */}
          <div role="radiogroup" aria-label="Loại đề" className="inline-flex self-start rounded-lg border border-slate-300 p-0.5">
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

        <div className="mt-5" />
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
          <CtaStrip title="Lưu lại kết quả và câu sai" text="Tài khoản miễn phí giữ lịch sử điểm và tự lên lịch ôn lại các câu làm sai." action={{ label: 'Tạo tài khoản miễn phí', to: gate(`/app/mock-tests?exam=${exam}`, '/auth/register') }} />
        </div>
      </Section>
    </div>
  );
};
