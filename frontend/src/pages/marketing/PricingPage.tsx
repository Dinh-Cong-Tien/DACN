import React, { useState } from 'react';
import { Check, Minus, ChevronDown } from 'lucide-react';
import { PRICING_PLANS, FAQS } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';
import { PageHeader, Section, SectionHead, ActionLink } from './shared/PageKit';

type Cycle = 'term' | 'year';

const vnd = (n: number) => `${formatNumber(n)}đ`;
/** Số ngày của một chu kỳ, đọc từ chuỗi "/ 30 ngày" */
const daysOf = (period: string) => Number(period.match(/\d+/)?.[0] ?? 30);

/** Bảng so sánh tính năng: [nhóm, tính năng, Free, VIP TOEIC, VSTEP Master] (true/false hoặc chuỗi) */
const COMPARE: [string, string, boolean | string, boolean | string, boolean | string][] = [
  ['Luyện tập', 'Bài xếp lớp và lộ trình cá nhân', true, true, true],
  ['Luyện tập', 'Đề thi thử', '3 đề / tuần', 'Không giới hạn (TOEIC)', 'Không giới hạn'],
  ['Luyện tập', 'Kho đề ETS 2025', false, true, true],
  ['Luyện tập', 'Đề VSTEP 4 kỹ năng', false, false, true],
  ['Luyện tập', 'Luyện điểm yếu, nghe chép chính tả', 'Giới hạn', true, true],
  ['Ghi nhớ', 'Sổ tay lỗi sai', 'Cơ bản', 'Đầy đủ', 'Đầy đủ'],
  ['Ghi nhớ', 'Flashcard ôn ngắt quãng', '200 từ', 'Không giới hạn', 'Không giới hạn'],
  ['Ghi nhớ', 'Tra từ điển', '50 lượt / ngày', 'Không giới hạn', 'Không giới hạn'],
  ['Giáo viên', 'Chấm Writing', false, false, '4 bài / tháng'],
  ['Giáo viên', 'Chấm Speaking', false, false, '2 bài / tháng'],
  ['Giáo viên', 'Lớp học online', false, false, true],
  ['Hỗ trợ', 'Báo cáo tiến độ hằng tuần qua email', false, false, true],
  ['Hỗ trợ', 'Hỗ trợ ưu tiên 8:00–22:00', false, false, true],
];

const Cell: React.FC<{ v: boolean | string }> = ({ v }) =>
  typeof v === 'string' ? <span className="text-slate-800">{v}</span> : v ? <Check className="mx-auto h-4 w-4 text-indigo-700" aria-label="Có" /> : <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="Không" />;

export const PricingPage: React.FC = () => {
  useDocumentTitle('Bảng giá');
  const [cycle, setCycle] = useState<Cycle>('term');
  const faqs = FAQS.filter((f) => f.category === 'Thanh toán' || f.id === 'f-2');

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Bảng giá' }]}
        title="Bảng giá"
        lead="Dùng miễn phí không giới hạn thời gian. Nâng cấp khi cần thêm đề, flashcard hoặc giáo viên chấm bài. Không tự động gia hạn."
      />

      <Section innerClassName="pt-8 md:pt-10">
        {/* Chu kỳ thanh toán */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div role="radiogroup" aria-label="Chu kỳ thanh toán" className="inline-flex rounded-lg border border-slate-300 p-0.5">
            {(
              [
                ['term', 'Theo chu kỳ gói'],
                ['year', 'Trả trước 12 tháng'],
              ] as [Cycle, string][]
            ).map(([k, l]) => (
              <button key={k} role="radio" aria-checked={cycle === k} onClick={() => setCycle(k)} className={cn('rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors', cycle === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900')}>
                {l}
              </button>
            ))}
          </div>
          <span className="text-sm text-slate-500">Trả trước 12 tháng giảm 20%.</span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PRICING_PLANS.map((p) => {
            const days = daysOf(p.period);
            const yearPrice = Math.round(((p.price * 365) / days) * 0.8 / 1000) * 1000;
            const price = cycle === 'year' ? yearPrice : p.price;
            const perMonth = Math.round((cycle === 'year' ? yearPrice / 12 : (p.price * 30) / days) / 1000) * 1000;
            return (
              <div key={p.id} className={cn('flex flex-col rounded-xl bg-white p-6', p.highlight ? 'border-2 border-indigo-600' : 'border border-slate-200')}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">{p.name}</h2>
                  {p.highlight && <span className="text-[12px] font-medium text-indigo-700">Được chọn nhiều nhất</span>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{p.description}</p>
                <p className="mt-6">
                  <span className="text-[2rem] font-semibold tracking-tight tabular-nums text-slate-900">{p.price === 0 ? '0đ' : vnd(price)}</span>
                  <span className="ml-1 text-sm text-slate-500">{p.price === 0 ? 'không thời hạn' : cycle === 'year' ? '/ 12 tháng' : p.period}</span>
                </p>
                <p className="mt-1 h-5 text-[13px] text-slate-500">{p.price > 0 && `Khoảng ${vnd(perMonth)} mỗi tháng`}</p>
                <ActionLink to="/auth/register" variant={p.highlight ? 'primary' : 'secondary'} className="mt-5 w-full">
                  {p.price === 0 ? 'Tạo tài khoản miễn phí' : `Chọn ${p.name}`}
                </ActionLink>
                <ul className="mt-6 space-y-2.5 border-t border-slate-200 pt-5 text-sm">
                  {p.features
                    .filter((f) => f.included)
                    .map((f) => (
                      <li key={f.text} className="flex gap-2.5 text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" />
                        {f.text}
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-[13px] text-slate-500">Giá đã gồm VAT. Thanh toán chuyển khoản hoặc ví điện tử. Hoàn tiền trong 7 ngày nếu chưa làm quá 3 đề.</p>
      </Section>

      {/* So sánh chi tiết */}
      <Section muted>
        <SectionHead title="So sánh chi tiết các gói" />
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="w-[40%] px-5 py-3.5 font-medium text-slate-500">Tính năng</th>
                {PRICING_PLANS.map((p) => (
                  <th key={p.id} className="px-4 py-3.5 text-center font-semibold text-slate-900">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([group, name, a, b, c], i) => (
                <React.Fragment key={name}>
                  {(i === 0 || COMPARE[i - 1][0] !== group) && (
                    <tr className="bg-[#F6F7F9]">
                      <td colSpan={4} className="px-5 py-2 text-[12px] font-medium uppercase tracking-wide text-slate-500">
                        {group}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-slate-200">
                    <td className="px-5 py-3 text-slate-700">{name}</td>
                    {[a, b, c].map((v, j) => (
                      <td key={j} className="px-4 py-3 text-center">
                        <Cell v={v} />
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Câu hỏi thường gặp */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="font-display text-2xl md:text-[2rem] font-bold tracking-tight text-slate-900">Câu hỏi về thanh toán</h2>
            <p className="mt-2 text-slate-600">
              Cần xuất hoá đơn hoặc mua cho cả lớp? Gửi email tới{' '}
              <a href="mailto:hello@orbilingo.vn" className="font-medium text-indigo-700 hover:underline">
                hello@orbilingo.vn
              </a>
              .
            </p>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((f) => (
              <details key={f.id} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
};
