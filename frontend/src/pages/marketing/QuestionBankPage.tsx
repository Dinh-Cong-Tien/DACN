import React, { useState } from 'react';
import { Database, Eye, EyeOff, ArrowRight, Shuffle } from 'lucide-react';
import { Button, Card, GradientPanel, SectionTitle, Switch } from '@/shared/components/ui';
import { CountUp, Reveal, Stagger } from '@/shared/components/motion';
import { QUESTIONS_BY_PART, TOEIC_PART5, TOEIC_PART2 } from '@/shared/mocks';
import { QuestionRenderer } from '@/engines';
import { useDocumentTitle } from '@/shared/hooks';

const LABEL: Record<string, string> = {
  PART_1: 'Part 1 · Mô tả tranh',
  PART_2: 'Part 2 · Hỏi đáp',
  PART_3: 'Part 3 · Hội thoại',
  PART_4: 'Part 4 · Bài nói',
  PART_5: 'Part 5 · Hoàn thành câu',
  PART_6: 'Part 6 · Hoàn thành đoạn',
  PART_7: 'Part 7 · Đọc hiểu',
  VSTEP_READING: 'VSTEP · Reading',
  VSTEP_LISTENING: 'VSTEP · Listening',
};

const SAMPLES = [TOEIC_PART5[0], TOEIC_PART5[2], TOEIC_PART2[0]];

export const QuestionBankPage: React.FC = () => {
  useDocumentTitle('Ngân hàng câu hỏi');
  const [showExp, setShowExp] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const q = SAMPLES[idx];
  const totalBank = 12600;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-12">
      <Reveal>
        <SectionTitle eyebrow="Ngân hàng câu hỏi" title="Hơn 12.000 câu hỏi được phân loại theo Part & kỹ năng" description="Mỗi câu kèm lời giải, thẻ ngữ pháp/từ vựng và độ khó, phục vụ lộ trình thích ứng." />
      </Reveal>
      <Reveal>
        <Card className="text-center" padding="lg">
          <Database className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <p className="text-4xl font-black text-slate-900">
            <CountUp value={totalBank} suffix="+" />
          </p>
          <p className="text-sm text-slate-500">câu hỏi chuẩn ETS & Bộ GD&ĐT, cập nhật hàng tuần</p>
        </Card>
      </Reveal>
      <Stagger className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3" step={50}>
        {Object.entries(QUESTIONS_BY_PART).map(([k, qs]) => (
          <Card key={k} padding="sm" hover className="text-center">
            <p className="text-[11px] font-bold text-slate-500">{LABEL[k]}</p>
            <p className="text-xl font-black text-slate-900 mt-1">{qs.length * 180}+</p>
            <p className="text-[10px] text-slate-400">{qs.length} câu mẫu công khai</p>
          </Card>
        ))}
      </Stagger>

      <section className="space-y-5">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">Thử sức với câu hỏi mẫu</h2>
              <p className="text-sm text-slate-500">Chọn đáp án rồi bật "Xem giải thích" để thấy cách OrbiLingo giải thích từng câu.</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={showExp} onChange={setShowExp} label={showExp ? 'Đang hiện giải thích' : 'Xem giải thích'} />
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Shuffle className="w-4 h-4" />}
                onClick={() => {
                  setIdx((i) => (i + 1) % SAMPLES.length);
                  setShowExp(false);
                }}
              >
                Câu khác
              </Button>
            </div>
          </div>
        </Reveal>
        <div key={q.id} className="max-w-3xl mx-auto animate-slide-in-right">
          <QuestionRenderer question={q} index={idx} selectedAnswer={answers[q.id]} onSelectAnswer={(k) => setAnswers((a) => ({ ...a, [q.id]: k }))} showExplanation={showExp} isReadOnly={showExp} allowFlagReport={false} />
        </div>
        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          {showExp ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} Giải thích {showExp ? 'đang hiển thị' : 'đang ẩn'}
        </p>
      </section>

      <Reveal animation="scale-in">
        <GradientPanel tone="indigo" className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black">Luyện toàn bộ ngân hàng câu hỏi</h3>
            <p className="text-indigo-100 text-sm mt-1">Lọc theo Part, độ khó, chủ điểm ngữ pháp. Câu sai tự động vào Sổ tay lỗi sai.</p>
          </div>
          <Button to="/auth/register" variant="secondary" size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 shrink-0" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Đăng ký miễn phí
          </Button>
        </GradientPanel>
      </Reveal>
    </div>
  );
};
