import React, { useState } from 'react';
import { Check, X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Accordion, Badge, Button, Card, SectionTitle, Segmented } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { PRICING_PLANS, FAQS } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { cn, formatCurrency } from '@/shared/utils';

export const PricingPage: React.FC = () => {
  useDocumentTitle('Bảng giá');
  const [cycle, setCycle] = useState('month');
  const yearly = cycle === 'year';
  const faqs = FAQS.filter((f) => f.category === 'Thanh toán').concat(FAQS.filter((f) => f.id === 'f-2')).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-12">
      <Reveal>
        <SectionTitle eyebrow="Bảng giá" title="Bắt đầu miễn phí, nâng cấp khi cần" description="Mọi tính năng cốt lõi đều miễn phí. Gói VIP mở khoá kho đề mới nhất và giáo viên chấm bài." />
      </Reveal>
      <div className="flex flex-col items-center gap-2 animate-fade-up">
        <Segmented
          value={cycle}
          onChange={setCycle}
          options={[
            { value: 'month', label: 'Theo gói' },
            { value: 'year', label: 'Theo năm · -20%' },
          ]}
        />
        {yearly && <Badge tone="emerald">Tiết kiệm 20% khi thanh toán theo năm</Badge>}
      </div>

      <Stagger className="grid md:grid-cols-3 gap-6 items-stretch" step={120}>
        {PRICING_PLANS.map((p) => {
          const price = yearly && p.price > 0 ? Math.round((p.price * 12 * 0.8) / 1000) * 1000 : p.price;
          return (
            <Card key={p.id} padding="lg" className={cn('relative flex flex-col transition-all duration-300', p.highlight && 'md:scale-105 border-indigo-400 shadow-lift ring-4 ring-indigo-100 z-10')}>
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge tone="indigo" solid icon={<Sparkles className="w-3 h-3" />}>
                    {p.badge}
                  </Badge>
                </span>
              )}
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                <p className="text-sm text-slate-500">{p.description}</p>
                <div className="pt-2">
                  <span className={cn('text-3xl md:text-4xl font-black', p.highlight ? 'text-gradient' : 'text-slate-900')}>{formatCurrency(price)}</span>
                  {p.price > 0 && <span className="text-sm text-slate-400 ml-1">{yearly ? '/ năm' : p.period}</span>}
                </div>
              </div>
              <ul className="space-y-2.5 mt-6 flex-1">
                {p.features.map((f) => (
                  <li key={f.text} className={cn('flex items-start gap-2 text-sm', f.included ? 'text-slate-700' : 'text-slate-400 line-through')}>
                    {f.included ? <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <X className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />}
                    {f.text}
                  </li>
                ))}
              </ul>
              <Button to="/auth/register" variant={p.highlight ? 'gradient' : 'outline'} fullWidth size="lg" className={cn('mt-8', p.highlight && 'shine')} rightIcon={<ArrowRight className="w-4 h-4" />}>
                {p.price === 0 ? 'Bắt đầu miễn phí' : 'Chọn gói này'}
              </Button>
            </Card>
          );
        })}
      </Stagger>

      <Reveal>
        <div className="flex items-center justify-center gap-6 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Không tự động gia hạn
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Hoàn tiền trong 7 ngày
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Chuyển khoản / Ví điện tử
          </span>
        </div>
      </Reveal>

      <Reveal>
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-xl font-black text-slate-900 text-center">Câu hỏi về thanh toán</h2>
          <Accordion items={faqs.map((f) => ({ id: f.id, title: f.question, content: f.answer }))} defaultOpen={faqs[0]?.id} />
        </div>
      </Reveal>
    </div>
  );
};
