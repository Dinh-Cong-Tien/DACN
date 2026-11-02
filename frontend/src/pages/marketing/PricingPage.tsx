import React, { useState } from 'react';
import { Check, Minus, ChevronDown } from 'lucide-react';
import { limitText, useFaqs, usePlans, type PlanDto } from '@/shared/api/cms';
import { useCreateOrder } from '@/shared/api/learner';
import { errorMessage } from '@/shared/api/client';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';
import { Accent, PageHeader, Section, SectionHead, ActionLink, ActionButton } from './shared/PageKit';

const vnd = (n: number) => `${formatNumber(n)}đ`;
/** Số ngày của một chu kỳ, đọc từ chuỗi "/ 30 ngày" */
const daysOf = (period: string) => Number(period.match(/\d+/)?.[0] ?? 30);

/** Bảng so sánh: dựng từ entitlements của từng gói trong CSDL */
const COMPARE_ROWS: { group: string; name: string; value: (p: PlanDto) => boolean | string }[] = [
  { group: 'Luyện tập', name: 'Bài xếp lớp, lộ trình, luyện theo Part', value: () => true },
  { group: 'Luyện tập', name: 'Đề thi thử', value: (p) => limitText(p.entitlements?.MOCK_TEST, 'đề') ?? false },
  { group: 'Luyện tập', name: 'Đề thi VIP', value: (p) => (p.entitlements?.MOCK_TEST_VIP && p.entitlements.MOCK_TEST_VIP.limit !== 0 ? (p.entitlements.MOCK_TEST_VIP.exam ? `Đề ${p.entitlements.MOCK_TEST_VIP.exam}` : true) : false) },
  { group: 'Ghi nhớ', name: 'Sổ tay lỗi sai', value: () => true },
  { group: 'Ghi nhớ', name: 'Flashcard ôn ngắt quãng', value: (p) => limitText(p.entitlements?.SRS_WORDS, 'từ') ?? false },
  { group: 'Ghi nhớ', name: 'Tra từ điển', value: (p) => limitText(p.entitlements?.DICTIONARY, 'lượt') ?? false },
  { group: 'Giáo viên', name: 'Giáo viên chấm Viết / Nói', value: (p) => limitText(p.entitlements?.TEACHER_GRADING, 'bài') ?? false },
];

const Cell: React.FC<{ v: boolean | string }> = ({ v }) =>
  typeof v === 'string' ? <span className="text-slate-800">{v}</span> : v ? <Check className="mx-auto h-4 w-4 text-indigo-700" aria-label="Có" /> : <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="Không" />;

export const PricingPage: React.FC = () => {
  useDocumentTitle('Bảng giá');
  const user = useAuthStore((s) => s.user);
  const createOrder = useCreateOrder();
  const [ordering, setOrdering] = useState<string | null>(null);
  const buy = (p: PlanDto) => {
    if (!p.code) return;
    setOrdering(p.id);
    createOrder
      .mutateAsync({ planCode: p.code, method: 'BANK' })
      .then((o) => toast.success(`Đã tạo đơn ${o.orderCode}`, `Chuyển khoản ${vnd(o.amount)} với nội dung ${o.orderCode}. Gói được kích hoạt khi quản trị viên xác nhận giao dịch.`))
      .catch((e) => toast.error('Chưa tạo được đơn', errorMessage(e)))
      .finally(() => setOrdering(null));
  };
  const { data: PRICING_PLANS = [] } = usePlans();
  const { data: FAQS = [] } = useFaqs();
  const faqs = FAQS.filter((f) => f.category === 'Thanh toán');

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Bảng giá' }]}
        eyebrow="Bảng giá"
        title={<>Bắt đầu miễn phí. <Accent>Nâng cấp khi cần.</Accent></>}
        lead="Dùng miễn phí không giới hạn thời gian. Nâng cấp khi cần thêm đề, flashcard hoặc giáo viên chấm bài. Không tự động gia hạn."
      />

      <Section innerClassName="pt-8 md:pt-10">
        <div className="grid gap-5 md:grid-cols-3">
          {PRICING_PLANS.map((p) => {
            const days = daysOf(p.period);
            const price = p.price;
            const perMonth = Math.round((p.price * 30) / days / 1000) * 1000;
            return (
              <div key={p.id} className={cn('flex flex-col rounded-xl bg-white p-6', p.highlight ? 'border-2 border-indigo-600' : 'border border-slate-200')}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">{p.name}</h2>
                  {(p.badge || p.highlight) && <span className="text-[12px] font-medium text-indigo-700">{p.badge ?? 'Đề xuất'}</span>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{p.description}</p>
                <p className="mt-6">
                  <span className="text-[2rem] font-semibold tracking-tight tabular-nums text-slate-900">{p.price === 0 ? '0đ' : vnd(price)}</span>
                  <span className="ml-1 text-sm text-slate-500">{p.price === 0 ? 'không thời hạn' : p.period}</span>
                </p>
                <p className="mt-1 h-5 text-[13px] text-slate-500">{p.price > 0 && `Khoảng ${vnd(perMonth)} mỗi tháng`}</p>
                {p.price > 0 && user?.role === 'STUDENT' ? (
                  <ActionButton type="button" onClick={() => buy(p)} disabled={ordering === p.id} variant={p.highlight ? 'primary' : 'secondary'} className="mt-5 w-full">
                    {ordering === p.id ? 'Đang tạo đơn…' : `Chọn ${p.name}`}
                  </ActionButton>
                ) : (
                  <ActionLink to={user ? '/app/settings' : '/auth/register'} variant={p.highlight ? 'primary' : 'secondary'} className="mt-5 w-full">
                    {p.price === 0 ? (user ? 'Đang dùng gói miễn phí' : 'Tạo tài khoản miễn phí') : user ? 'Dành cho tài khoản học viên' : `Đăng ký để chọn ${p.name}`}
                  </ActionLink>
                )}
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
        <p className="mt-6 text-[13px] text-slate-500">Thanh toán bằng chuyển khoản theo mã đơn. Gói được kích hoạt sau khi quản trị viên xác nhận giao dịch và không tự động gia hạn.</p>
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
              {COMPARE_ROWS.map(({ group, name, value }, i) => (
                <React.Fragment key={name}>
                  {(i === 0 || COMPARE_ROWS[i - 1].group !== group) && (
                    <tr className="bg-slate-100/60">
                      <td colSpan={4} className="px-5 py-2 text-[12px] font-medium uppercase tracking-wide text-slate-500">
                        {group}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-slate-200">
                    <td className="px-5 py-3 text-slate-700">{name}</td>
                    {PRICING_PLANS.map((p) => value(p)).map((v, j) => (
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
