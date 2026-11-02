import React, { useMemo, useState } from 'react';
import { usePartsInfo, usePracticeSet, useTests } from '@/shared/api/catalog';
import { QuestionRenderer } from '@/engines';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils';
import { Accent, PageHeader, Section, ActionLink } from './shared/PageKit';

/** 3 câu mẫu lấy ngẫu nhiên từ ngân hàng: Part 5, Part 2 và VSTEP Đọc */
const SAMPLE_SETS = [
  { part: 'PART_5', limit: 1 },
  { part: 'PART_2', limit: 1 },
  { part: 'VSTEP_READING', limit: 1 },
];

export const QuestionBankPage: React.FC = () => {
  useDocumentTitle('Ngân hàng câu hỏi');
  const gate = useGate();
  const [showExp, setShowExp] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { data: toeic = [] } = usePartsInfo('TOEIC');
  const { data: vstep = [] } = usePartsInfo('VSTEP');
  const { data: tests = [] } = useTests();
  const { data: sampleRaw = [], isLoading: samplesLoading } = usePracticeSet(SAMPLE_SETS);
  // mỗi nhóm có thể trả cả bài đọc nhiều câu → lấy câu đầu của từng phần
  const SAMPLES = useMemo(() => SAMPLE_SETS.map((s) => sampleRaw.find((q) => q.partOrSkill === s.part)).filter((q): q is NonNullable<typeof q> => !!q), [sampleRaw]);
  const DISTRIBUTION: [string, string, number][] = [
    ...toeic.map((p) => [p.name, p.nameVi, p.bankCount ?? 0] as [string, string, number]),
    ...vstep.filter((p) => (p.bankCount ?? 0) > 0).map((p) => ['VSTEP', p.nameVi.replace('Kỹ năng ', ''), p.bankCount ?? 0] as [string, string, number]),
  ];
  const TOTAL = DISTRIBUTION.reduce((a, [, , n]) => a + n, 0);

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Công cụ' }, { label: 'Ngân hàng câu hỏi' }]}
        eyebrow="Ngân hàng câu hỏi"
        title={<><Accent>{TOTAL ? `${formatNumber(TOTAL)} câu hỏi` : 'Câu hỏi'}</Accent> TOEIC và VSTEP</>}
        lead="Mỗi câu có lời giải, độ khó từ 1 đến 5 và thẻ kiến thức (thì, từ loại, paraphrase...). Câu mới chỉ được dùng trong đề sau khi trưởng bộ môn duyệt."
        facts={[
          { value: formatNumber(TOTAL), label: 'Câu hỏi đã duyệt' },
          { value: String(DISTRIBUTION.length), label: 'Phần thi' },
          { value: String(tests.length), label: 'Đề thi thử' },
        ]}
      />

      <Section innerClassName="pt-10 md:pt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Câu mẫu */}
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Làm thử 3 câu mẫu</h2>
                <p className="mt-0.5 text-sm text-slate-500">Không cần đăng nhập. Chọn đáp án rồi bật lời giải để kiểm tra.</p>
              </div>
              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={showExp} onChange={(e) => setShowExp(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />
                Hiện lời giải
              </label>
            </div>
            <div className="space-y-5">
              {samplesLoading && <p className="text-sm text-slate-500">Đang tải câu mẫu…</p>}
              {SAMPLES.map((q, i) => (
                <QuestionRenderer key={q.id} variant="plain" index={i} question={q} selectedAnswer={answers[q.id]} onSelectAnswer={(k) => setAnswers((a) => ({ ...a, [q.id]: k }))} showExplanation={showExp} isReadOnly={showExp} allowFlagReport={false} />
              ))}
            </div>
          </div>

          {/* Thông tin ngân hàng */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Số câu theo phần</h2>
              <table className="mt-3 w-full text-sm">
                <tbody className="divide-y divide-slate-200 border-y border-slate-200">
                  {DISTRIBUTION.map(([part, name, n]) => (
                    <tr key={part + name}>
                      <td className="py-2 pr-2 text-slate-900">{part}</td>
                      <td className="py-2 pr-2 text-slate-500">{name}</td>
                      <td className="py-2 text-right tabular-nums text-slate-700">{formatNumber(n)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="pt-2.5 font-medium text-slate-900">
                      Tổng
                    </td>
                    <td className="pt-2.5 text-right font-medium tabular-nums text-slate-900">{formatNumber(TOTAL)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="text-[15px] leading-relaxed text-slate-600">
              <h2 className="text-base font-semibold text-slate-900">Quy trình duyệt câu hỏi</h2>
              <ol className="mt-3 space-y-2">
                <li>1. Giáo viên soạn câu, gắn độ khó và thẻ kiến thức.</li>
                <li>2. Trưởng bộ môn kiểm tra đáp án, lời giải rồi duyệt.</li>
                <li>3. Học viên thấy câu sai đề có thể báo lỗi ngay trong bài làm.</li>
              </ol>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <p className="font-medium text-slate-900">Luyện toàn bộ ngân hàng</p>
              <p className="mt-1 text-sm text-slate-600">Khách chỉ xem được câu mẫu. Tài khoản miễn phí luyện được theo Part và độ khó.</p>
              <ActionLink to={gate('/app/practice', '/auth/register')} className="mt-4 w-full">
                Tạo tài khoản miễn phí
              </ActionLink>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
};
