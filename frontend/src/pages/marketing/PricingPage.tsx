import React, { useState } from 'react';
import { Check, X, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Button, SectionTitle, Segmented, Accordion, Badge } from '@/shared/components/ui';
import { Reveal, Stagger, Doodles } from '@/shared/components/motion';
import { Img, PHOTOS, pravatar } from '@/shared/components/media/Img';
import { PRICING_PLANS, FAQS } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { cn, formatCurrency } from '@/shared/utils';

export const PricingPage: React.FC = () => {
  useDocumentTitle('Bảng giá');
  const [cycle, setCycle] = useState('month');
  const discount = cycle === 'year' ? 0.8 : 1;

  return (
    <div>
      <section className="relative bg-paper border-b-2 border-slate-900 overflow-hidden">
        <Doodles />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 text-center space-y-6">
          <SectionTitle eyebrow="Bảng giá" title={<>Miễn phí để bắt đầu. <span className="mark-coral mark">Trả tiền</span> khi bạn cần nhiều hơn.</>} description="Không tự động gia hạn. Không ràng buộc. Gói VIP mở kho đề 2025, flashcard không giới hạn và giáo viên chấm bài." />
          <div className="flex items-center justify-center gap-3">
            <Segmented
              value={cycle}
              onChange={setCycle}
              options={[
                { value: 'month', label: 'Theo chu kỳ' },
                { value: 'year', label: 'Trả trước 1 năm' },
              ]}
            />
            <Badge tone="emerald" solid className={cn('transition', cycle === 'year' ? 'opacity-100' : 'opacity-0')}>
              Tiết kiệm 20%
            </Badge>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Stagger className="grid md:grid-cols-3 gap-6 items-start">
          {PRICING_PLANS.map((p) => (
            <div key={p.id} className={cn('relative rounded-3xl border-2 border-slate-900 p-7 flex flex-col', p.highlight ? 'bg-slate-900 text-white shadow-hard-lg md:-translate-y-4' : 'bg-white shadow-hard')}>
              {p.badge && (
                <span className="sticker tilt-2 absolute -top-4 right-6 !bg-amber-300">
                  <Sparkles className="w-3.5 h-3.5" /> {p.badge}
                </span>
              )}
              <p className="font-display text-xl font-extrabold">{p.name}</p>
              <p className={cn('text-sm mt-1', p.highlight ? 'text-slate-300' : 'text-slate-600')}>{p.description}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="font-display text-4xl font-extrabold">{p.price === 0 ? '0đ' : formatCurrency(Math.round((p.price * discount) / 1000) * 1000)}</span>
                <span className={cn('text-sm mb-1.5', p.highlight ? 'text-slate-400' : 'text-slate-500')}>{p.period}</span>
              </div>
              <Button to="/auth/register" fullWidth size="lg" variant={p.highlight ? 'gradient' : 'outline'} className="mt-6" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {p.price === 0 ? 'Bắt đầu miễn phí' : 'Chọn gói này'}
              </Button>
              <ul className="mt-7 space-y-2.5 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f.text} className={cn('flex items-start gap-2.5', !f.included && (p.highlight ? 'text-slate-500' : 'text-slate-400'))}>
                    <span className={cn('w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5', f.included ? 'bg-emerald-200 text-emerald-800' : p.highlight ? 'bg-white/10' : 'bg-slate-100')}>{f.included ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3" />}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Stagger>
        <p className="text-center text-xs text-slate-500 mt-8 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Thanh toán chuyển khoản hoặc ví điện tử · Hoàn tiền trong 7 ngày nếu chưa dùng quá 3 đề
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid lg:grid-cols-[1fr_420px] gap-10 items-start">
        <Reveal className="space-y-6">
          <SectionTitle align="left" eyebrow="Câu hỏi về thanh toán" title="Trước khi nâng cấp" />
          <Accordion items={FAQS.filter((f) => f.category === 'Thanh toán' || f.id === 'f-2').map((f) => ({ id: f.id, title: f.question, content: f.answer }))} />
        </Reveal>
        <Reveal delay={100} className="space-y-4">
          <div className="photo-frame tilt-2">
            <Img src={PHOTOS.campus} alt="" ratio="4/3" fallbackClass="bg-amber-200" />
          </div>
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-hard p-5 flex gap-4">
            <img src={pravatar(16)} alt="" className="w-12 h-12 rounded-full border-2 border-slate-900 object-cover shrink-0" />
            <div>
              <p className="text-sm text-slate-700 leading-relaxed">"Mua gói VSTEP Master 3 tháng trước kỳ thi. Được chấm 4 bài Writing, biết chính xác mình mất điểm ở Coherence."</p>
              <p className="text-xs font-bold text-slate-900 mt-2">Đỗ Thị Mai · B1 → C1</p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
