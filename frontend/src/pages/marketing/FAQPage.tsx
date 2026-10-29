import React, { useMemo, useState } from 'react';
import { HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { Accordion, Button, Card, EmptyState, SearchInput, SectionTitle, Chip } from '@/shared/components/ui';
import { Reveal } from '@/shared/components/motion';
import { FAQS } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';

export const FAQPage: React.FC = () => {
  useDocumentTitle('Câu hỏi thường gặp');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Tất cả');
  const cats = ['Tất cả', ...Array.from(new Set(FAQS.map((f) => f.category)))];
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return FAQS.filter((f) => (cat === 'Tất cả' || f.category === cat) && (!s || f.question.toLowerCase().includes(s) || f.answer.toLowerCase().includes(s)));
  }, [q, cat]);
  const groups = Array.from(new Set(list.map((f) => f.category)));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-8">
      <Reveal>
        <SectionTitle eyebrow="FAQ" title="Câu hỏi thường gặp" description="Không tìm thấy câu trả lời? Liên hệ đội ngũ hỗ trợ của chúng tôi." />
      </Reveal>
      <div className="space-y-3 animate-fade-up">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm câu hỏi, ví dụ: thi xếp lớp, gói VIP..." inputSize="lg" />
        <div className="flex flex-wrap gap-2 justify-center">
          {cats.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>
      {groups.length === 0 ? (
        <EmptyState icon={<HelpCircle />} title="Không tìm thấy câu hỏi phù hợp" description="Thử từ khoá khác hoặc gửi câu hỏi cho chúng tôi." />
      ) : (
        groups.map((g, gi) => (
          <Reveal key={g} delay={gi * 60}>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 mb-3">{g}</h2>
            <Accordion items={list.filter((f) => f.category === g).map((f) => ({ id: f.id, title: f.question, content: f.answer, icon: <HelpCircle /> }))} defaultOpen={gi === 0 ? list.find((f) => f.category === g)?.id : undefined} />
          </Reveal>
        ))
      )}
      <Reveal animation="scale-in">
        <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigo-50/60 border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Vẫn còn thắc mắc?</p>
              <p className="text-xs text-slate-500">Đội ngũ hỗ trợ phản hồi trong vòng 24 giờ.</p>
            </div>
          </div>
          <Button to="/contact" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Liên hệ hỗ trợ
          </Button>
        </Card>
      </Reveal>
    </div>
  );
};
