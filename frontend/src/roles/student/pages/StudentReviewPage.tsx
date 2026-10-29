import React, { useMemo, useState } from 'react';
import { RotateCcw, CalendarDays, BookOpen, AlertTriangle, Play, Brain, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, PageHeader, StatCard, Timeline, GradientPanel } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { PracticeEngine } from '@/engines';
import { MOCK_MISTAKES, MOCK_VOCAB, MISTAKE_CAUSE_LABEL } from '@/shared/mocks';
import { formatDate } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';

const SM2_STEPS = [
  { d: '1 ngày', desc: 'Lần ôn đầu tiên sau khi sai' },
  { d: '3 ngày', desc: 'Nhớ đúng → giãn cách' },
  { d: '7 ngày', desc: 'Củng cố trí nhớ dài hạn' },
  { d: '14 ngày', desc: 'Kiểm tra trước khi "mastered"' },
  { d: '30 ngày', desc: 'Ôn duy trì' },
];

export const StudentReviewPage: React.FC = () => {
  useDocumentTitle('Lịch ôn ngắt quãng');
  const [reviewing, setReviewing] = useState(false);
  const now = Date.now();
  const dueMistakes = useMemo(() => MOCK_MISTAKES.filter((m) => !m.isResolved && new Date(m.nextReviewAt).getTime() <= now), [now]);
  const dueVocab = useMemo(() => MOCK_VOCAB.filter((v) => new Date(v.nextReviewAt).getTime() <= now), [now]);

  const upcoming = useMemo(() => {
    const days: { id: string; date: Date; mistakes: number; vocab: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      const end = d.getTime() + 86400000;
      const mk = MOCK_MISTAKES.filter((m) => !m.isResolved && new Date(m.nextReviewAt).getTime() >= d.getTime() && new Date(m.nextReviewAt).getTime() < end).length;
      const vc = MOCK_VOCAB.filter((v) => new Date(v.nextReviewAt).getTime() >= d.getTime() && new Date(v.nextReviewAt).getTime() < end).length;
      days.push({ id: `d${i}`, date: d, mistakes: mk, vocab: vc });
    }
    return days;
  }, []);

  if (reviewing) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setReviewing(false)}>
          Về lịch ôn
        </Button>
        <PracticeEngine
          title="Ôn tập câu sai hôm nay"
          questions={dueMistakes.map((m) => m.question)}
          exitTo="/app/review"
          onFinishPractice={(s) => toast.success('Hoàn thành phiên ôn', `${s.correct}/${s.total} câu nhớ đúng. SM-2 đã cập nhật lịch.`)}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader icon={<RotateCcw />} title="Lịch ôn ngắt quãng" description="Thuật toán SM-2 nhắc bạn ôn đúng thời điểm sắp quên — ít thời gian hơn, nhớ lâu hơn." />

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" step={70}>
        <StatCard label="Cần ôn hôm nay" value={dueMistakes.length + dueVocab.length} icon={<RotateCcw />} tone="rose" />
        <StatCard label="Câu sai" value={dueMistakes.length} icon={<AlertTriangle />} tone="amber" />
        <StatCard label="Từ vựng" value={dueVocab.length} icon={<BookOpen />} tone="indigo" />
        <StatCard label="7 ngày tới" value={upcoming.reduce((a, d) => a + d.mistakes + d.vocab, 0)} icon={<CalendarDays />} tone="sky" />
      </Stagger>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-5">
          <GradientPanel className="animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Badge className="!bg-white/15 !text-white !border-white/20 mb-2">Hôm nay · {formatDate(new Date().toISOString())}</Badge>
                <h2 className="text-xl font-black">{dueMistakes.length + dueVocab.length} mục đang chờ bạn</h2>
                <p className="text-sm text-indigo-100 mt-1">Ước tính {Math.max(5, (dueMistakes.length + dueVocab.length) * 1.5)} phút. Hoàn thành để giữ chuỗi chuyên cần.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" className="!bg-white !text-indigo-700 hover:!bg-indigo-50" leftIcon={<Play className="w-4 h-4" />} disabled={dueMistakes.length === 0} onClick={() => setReviewing(true)}>
                  Ôn câu sai
                </Button>
                <Button variant="outline" className="!bg-transparent !border-white/40 !text-white hover:!bg-white/10" to="/app/vocabulary/flashcards">
                  Ôn từ vựng
                </Button>
              </div>
            </div>
          </GradientPanel>

          <Card className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <CardHeader title="Danh sách ôn hôm nay" icon={<AlertTriangle />} />
            <div className="space-y-2">
              {dueMistakes.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 transition animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 text-xs font-black">{i + 1}</span>
                  <p className="text-sm font-semibold text-slate-800 flex-1 line-clamp-1">{m.question.stem}</p>
                  <Badge tone={MISTAKE_CAUSE_LABEL[m.cause].tone} size="xs">
                    {MISTAKE_CAUSE_LABEL[m.cause].label}
                  </Badge>
                </div>
              ))}
              {dueVocab.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition animate-fade-in" style={{ animationDelay: `${(dueMistakes.length + i) * 40}ms` }}>
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <p className="text-sm font-semibold text-slate-800 flex-1">
                    {v.word} <span className="text-slate-400 font-normal">· {v.meaningVi}</span>
                  </p>
                  <Badge tone={v.status === 'LEARNING' ? 'amber' : 'indigo'} size="xs">
                    {v.status === 'LEARNING' ? 'Đang học' : 'Ôn lại'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="animate-slide-in-right">
            <CardHeader title="7 ngày tới" icon={<CalendarDays />} />
            <Timeline
              items={upcoming.map((d) => ({
                id: d.id,
                title: formatDate(d.date.toISOString(), { weekday: 'short', day: '2-digit', month: '2-digit' }),
                description: d.mistakes + d.vocab === 0 ? 'Không có mục nào' : `${d.mistakes} câu sai · ${d.vocab} từ vựng`,
                tone: d.mistakes + d.vocab === 0 ? 'slate' : d.mistakes + d.vocab >= 3 ? 'rose' : 'indigo',
              }))}
            />
          </Card>
          <Card className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <CardHeader title="SM-2 hoạt động thế nào?" icon={<Brain />} />
            <ol className="space-y-2">
              {SM2_STEPS.map((s, i) => (
                <li key={s.d} className="flex items-center gap-3 text-xs">
                  <span className="w-14 shrink-0 text-center py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black">{s.d}</span>
                  <span className="text-slate-600">{s.desc}</span>
                  {i < SM2_STEPS.length - 1 && <span className="sr-only">→</span>}
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-slate-400 mt-3">Nhớ sai → quay về mốc 1 ngày. Nhớ dễ → giãn cách nhanh hơn theo hệ số dễ (ease factor).</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
