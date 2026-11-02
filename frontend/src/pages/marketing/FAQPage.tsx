import React, { useMemo, useState } from 'react';
import { Search, MessageCircle, ArrowRight } from 'lucide-react';
import { Accordion, Input, SectionTitle, Chip, EmptyState, Button } from '@/shared/components/ui';
import { Reveal } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { useFaqs } from '@/shared/api/cms';
import { SkeletonCard } from '@/shared/components/ui';
import { useDocumentTitle } from '@/shared/hooks';

export const FAQPage: React.FC = () => {
  useDocumentTitle('Câu hỏi thường gặp');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Tất cả');
  const { data: FAQS = [], isLoading } = useFaqs();
  const cats = ['Tất cả', ...Array.from(new Set(FAQS.map((f) => f.category)))];
  const list = useMemo(() => FAQS.filter((f) => (cat === 'Tất cả' || f.category === cat) && (f.question + f.answer).toLowerCase().includes(q.toLowerCase())), [q, cat, FAQS]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1fr_340px] gap-12 items-start">
      <div className="space-y-8">
        <Reveal className="space-y-6">
          <SectionTitle align="left" eyebrow="FAQ" title={<>Hỏi nhanh, <span className="mark">đáp gọn</span>.</>} description="Những câu chúng tôi nhận được nhiều nhất qua email và lớp học." />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm câu hỏi... (ví dụ: xếp lớp, VIP, lớp học)" leftIcon={<Search />} inputSize="lg" />
          <div className="flex gap-2 flex-wrap">
            {cats.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </Reveal>
        {isLoading ? <SkeletonCard lines={5} /> : list.length === 0 ? <EmptyState title="Không tìm thấy câu hỏi" description="Thử từ khoá ngắn hơn hoặc gửi câu hỏi cho chúng tôi." /> : <Accordion key={cat + q} defaultOpen={list[0]?.id} items={list.map((f) => ({ id: f.id, title: f.question, content: f.answer }))} />}
      </div>
      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="photo-frame tilt-2">
          <Img src={PHOTOS.team} alt="Đội ngũ hỗ trợ" ratio="4/3" fallbackClass="bg-amber-200" />
        </div>
        <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-hard p-5 space-y-3">
          <p className="font-display font-extrabold text-slate-900">Chưa thấy câu trả lời?</p>
          <p className="text-sm text-slate-600">Gửi câu hỏi cho đội hỗ trợ (8:00–22:00 mỗi ngày), phản hồi gửi về email của bạn.</p>
          <Button to="/contact" variant="gradient" size="sm" fullWidth leftIcon={<MessageCircle className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Gửi câu hỏi
          </Button>
        </div>
      </aside>
    </div>
  );
};
