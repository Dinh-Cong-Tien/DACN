import React, { useState } from 'react';
import { ArrowRight, Database, Eye, EyeOff } from 'lucide-react';
import { Button, SectionTitle, Card, Badge, Switch } from '@/shared/components/ui';
import { Reveal, Stagger, CountUp } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { QUESTIONS_BY_PART, TOEIC_PART5, TOEIC_PART2, VSTEP_READING } from '@/shared/mocks';
import { QuestionRenderer } from '@/engines';
import { useDocumentTitle } from '@/shared/hooks';
import { cn } from '@/shared/utils';

const LABEL: Record<string, string> = { PART_1: 'Part 1 · Tranh', PART_2: 'Part 2 · Hỏi đáp', PART_3: 'Part 3 · Hội thoại', PART_4: 'Part 4 · Bài nói', PART_5: 'Part 5 · Câu', PART_6: 'Part 6 · Đoạn', PART_7: 'Part 7 · Đọc hiểu', VSTEP_READING: 'VSTEP Reading', VSTEP_LISTENING: 'VSTEP Listening' };
const SAMPLES = [TOEIC_PART5[0], TOEIC_PART2[0], VSTEP_READING[1]];

export const QuestionBankPage: React.FC = () => {
  useDocumentTitle('Ngân hàng câu hỏi');
  const [showExp, setShowExp] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const parts = Object.entries(QUESTIONS_BY_PART);
  const total = 12600;

  return (
    <div>
      <section className="bg-paper border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1fr_360px] gap-10 items-center">
          <div className="space-y-6">
            <SectionTitle align="left" eyebrow="Ngân hàng câu hỏi" title={<><CountUp value={total} suffix="+" /> câu hỏi được <span className="mark">giáo viên duyệt</span>.</>} description="Mỗi câu có lời giải, thẻ ngữ pháp/từ vựng và độ khó. Trưởng bộ môn phê duyệt trước khi xuất hiện trong đề." />
            <div className="flex flex-wrap gap-2">
              {parts.map(([k, qs]) => (
                <span key={k} className="px-3 py-1.5 rounded-xl bg-white border-2 border-slate-900 text-xs font-bold text-slate-800">
                  {LABEL[k] ?? k} <span className="text-violet-600">· {qs.length} mẫu</span>
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="photo-frame tilt-2">
              <Img src={PHOTOS.books} alt="" ratio="4/3" fallbackClass="bg-amber-200" />
            </div>
            <span className="sticker absolute -top-3 -left-3 tilt-1 !bg-indigo-100">
              <Database className="w-3.5 h-3.5" /> Chuẩn ETS
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
        <Reveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SectionTitle align="left" eyebrow="Thử ngay" title="Ba câu mẫu, không cần đăng nhập" />
          <div className="flex items-center gap-3 bg-white rounded-xl border-2 border-slate-900 px-4 py-2">
            {showExp ? <Eye className="w-4 h-4 text-indigo-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            <Switch checked={showExp} onChange={setShowExp} label="Hiện lời giải" />
          </div>
        </Reveal>
        <Stagger className="space-y-5">
          {SAMPLES.map((q) => (
            <QuestionRenderer key={q.id} question={q} selectedAnswer={answers[q.id]} onSelectAnswer={(k) => setAnswers((a) => ({ ...a, [q.id]: k }))} showExplanation={showExp} isReadOnly={showExp} allowFlagReport={false} />
          ))}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid md:grid-cols-3 gap-5">
        {[
          ['Độ khó 1–5', 'Mỗi câu gắn độ khó để lộ trình chọn đúng mức cho bạn.', 'bg-indigo-100'],
          ['Thẻ kiến thức', 'Word form, tense, paraphrase... để phân tích nguyên nhân sai.', 'bg-amber-200'],
          ['Báo lỗi 1 chạm', 'Thấy câu nghi vấn? Bấm cờ, trưởng bộ môn sẽ xem lại.', 'bg-violet-100'],
        ].map(([t, d, bg], i) => (
          <Reveal key={t} delay={i * 80}>
            <Card hard padding="lg" className={cn('h-full', bg)}>
              <p className="font-display text-5xl font-extrabold text-slate-900/20">0{i + 1}</p>
              <h3 className="font-display text-xl font-extrabold text-slate-900 mt-2">{t}</h3>
              <p className="text-sm text-slate-700 mt-2">{d}</p>
            </Card>
          </Reveal>
        ))}
        <Reveal className="md:col-span-3">
          <Badge tone="slate" className="mr-2">
            Guest
          </Badge>
          <span className="text-sm text-slate-600">
            Khách chỉ xem được câu mẫu. Đăng ký để luyện toàn bộ ngân hàng.{' '}
            <Button to="/auth/register" size="xs" variant="gradient" rightIcon={<ArrowRight className="w-3 h-3" />} className="ml-2">
              Đăng ký
            </Button>
          </span>
        </Reveal>
      </section>
    </div>
  );
};
