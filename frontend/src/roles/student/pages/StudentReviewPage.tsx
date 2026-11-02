import React, { useMemo, useRef, useState } from 'react';
import { RotateCcw, CalendarDays, BookOpen, AlertTriangle, Play, Brain, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, PageHeader, StatCard, Timeline } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { PracticeEngine } from '@/engines';
import { MISTAKE_CAUSE_LABEL } from '@/shared/constants/student';
import { api, errorMessage } from '@/shared/api/client';
import { useMistakes, useMyWords, useReviewDue } from '@/shared/api/learner';
import { useQueryClient } from '@tanstack/react-query';
import { cn, formatDate } from '@/shared/utils';
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
  const qc = useQueryClient();
  const { data: due } = useReviewDue();
  const { data: openMistakes = [] } = useMistakes({ resolved: false });
  const { data: myWords = [] } = useMyWords();
  const dueMistakes = due?.mistakes ?? [];
  const dueVocab = due?.words ?? [];
  const wrongIds = useRef(new Set<string>());

  const upcoming = useMemo(() => {
    const days: { id: string; date: Date; mistakes: number; vocab: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      const end = d.getTime() + 86400000;
      const mk = openMistakes.filter((m) => new Date(m.nextReviewAt).getTime() >= d.getTime() && new Date(m.nextReviewAt).getTime() < end).length;
      const vc = myWords.filter((v) => new Date(v.nextReviewAt).getTime() >= d.getTime() && new Date(v.nextReviewAt).getTime() < end).length;
      days.push({ id: `d${i}`, date: d, mistakes: mk, vocab: vc });
    }
    return days;
  }, [openMistakes, myWords]);

  // Kết thúc phiên ôn câu sai: nhớ đúng → chất lượng 4, sai → 1 (SM-2)
  const finishReview = async (s: { correct: number; total: number }) => {
    try {
      for (const m of dueMistakes) await api.post('/learner/review', { mistakeId: m.id, quality: wrongIds.current.has(m.question.id) ? 1 : 4 });
      wrongIds.current.clear();
      ['review', 'mistakes', 'progress'].forEach((k) => qc.invalidateQueries({ queryKey: ['learner', k] }));
      toast.success('Hoàn thành phiên ôn', `${s.total - (s.total - s.correct)}/${s.total} câu nhớ đúng. SM-2 đã cập nhật lịch.`);
    } catch (e) {
      toast.error('Chưa lưu được kết quả ôn', errorMessage(e));
    }
  };

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
          onMistakeRecorded={(qid) => wrongIds.current.add(qid)}
          onFinishPractice={(s) => void finishReview({ correct: s.total - wrongIds.current.size, total: s.total })}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={<RotateCcw />}
        title={
          <>
            Lịch ôn <span className="mark">ngắt quãng</span>
          </>
        }
        description="Thuật toán SM-2 nhắc bạn ôn đúng thời điểm sắp quên — ít thời gian hơn, nhớ lâu hơn."
      />

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" step={70}>
        <StatCard label="Cần ôn hôm nay" value={dueMistakes.length + dueVocab.length} icon={<RotateCcw />} tone="violet" />
        <StatCard label="Câu sai" value={dueMistakes.length} icon={<AlertTriangle />} tone="amber" />
        <StatCard label="Từ vựng" value={dueVocab.length} icon={<BookOpen />} tone="indigo" />
        <StatCard label="7 ngày tới" value={due?.upcoming7d ?? upcoming.reduce((a, d) => a + d.mistakes + d.vocab, 0)} icon={<CalendarDays />} tone="sky" />
      </Stagger>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-5">
          <Card hard tone="teal" padding="none" className="overflow-hidden animate-fade-up">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px]">
              <div className="p-6 space-y-3">
                <span className="sticker tilt-1 !bg-amber-300">Hôm nay · {formatDate(new Date().toISOString())}</span>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold leading-tight">{dueMistakes.length + dueVocab.length} mục đang chờ bạn</h2>
                <p className="text-sm text-indigo-100">Ước tính {Math.max(5, Math.round((dueMistakes.length + dueVocab.length) * 1.5))} phút. Hoàn thành để giữ chuỗi chuyên cần.</p>
                <div className="flex gap-2 flex-wrap pt-1">
                  <Button variant="white" leftIcon={<Play className="w-4 h-4" />} disabled={dueMistakes.length === 0} onClick={() => setReviewing(true)}>
                    Ôn câu sai
                  </Button>
                  <Button variant="ink" to="/app/vocabulary/flashcards">
                    Ôn từ vựng
                  </Button>
                </div>
              </div>
              <div className="relative min-h-[160px] border-t-2 md:border-t-0 md:border-l-2 border-slate-900">
                <Img src={PHOTOS.notes} alt="Ôn tập" wrapperClass="absolute inset-0" fallbackClass="bg-indigo-500" />
              </div>
            </div>
          </Card>

          <Card hard className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <CardHeader title="Danh sách ôn hôm nay" icon={<AlertTriangle />} />
            <div className="space-y-2">
              {dueMistakes.length + dueVocab.length === 0 && <p className="text-sm text-slate-500">Hôm nay không có mục nào cần ôn. Câu sai và từ đang học sẽ xuất hiện ở đây đúng ngày đến hạn.</p>}
              {dueMistakes.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-slate-900 hover:bg-amber-50 transition animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="w-8 h-8 rounded-lg bg-violet-500 border-2 border-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-display font-extrabold">{i + 1}</span>
                  <p className="text-sm font-bold text-slate-900 flex-1 line-clamp-1">{m.question.stem}</p>
                  <Badge tone={MISTAKE_CAUSE_LABEL[m.cause].tone} size="xs">
                    {MISTAKE_CAUSE_LABEL[m.cause].label}
                  </Badge>
                </div>
              ))}
              {dueVocab.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-slate-900 hover:bg-indigo-50 transition animate-fade-in" style={{ animationDelay: `${(dueMistakes.length + i) * 40}ms` }}>
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 border-2 border-slate-900 text-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <p className="text-sm font-bold text-slate-900 flex-1">
                    {v.word} <span className="text-slate-500 font-medium">· {v.meaningVi}</span>
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
          <Card hard className="animate-slide-in-right">
            <CardHeader title="7 ngày tới" icon={<CalendarDays />} />
            <Timeline
              items={upcoming.map((d) => ({
                id: d.id,
                title: formatDate(d.date.toISOString(), { weekday: 'short', day: '2-digit', month: '2-digit' }),
                description: d.mistakes + d.vocab === 0 ? 'Không có mục nào' : `${d.mistakes} câu sai · ${d.vocab} từ vựng`,
                tone: d.mistakes + d.vocab === 0 ? 'slate' : d.mistakes + d.vocab >= 3 ? 'violet' : 'indigo',
              }))}
            />
          </Card>
          <Card hard tone="cream" className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <CardHeader title="SM-2 hoạt động thế nào?" icon={<Brain />} />
            <ol className="space-y-2">
              {SM2_STEPS.map((s, i) => (
                <li key={s.d} className="flex items-center gap-3 text-xs">
                  <span className={cn('w-16 shrink-0 text-center py-1 rounded-lg border-2 border-slate-900 font-display font-extrabold', i === 0 ? 'bg-violet-500 text-white' : i < 3 ? 'bg-amber-300 text-slate-900' : 'bg-indigo-600 text-white')}>{s.d}</span>
                  <span className="text-slate-700 font-semibold">{s.desc}</span>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-slate-500 mt-3 font-semibold">Nhớ sai → quay về mốc 1 ngày. Nhớ dễ → giãn cách nhanh hơn theo hệ số dễ (ease factor).</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
