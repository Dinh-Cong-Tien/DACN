import React, { useState } from 'react';
import { Volume2, RotateCw, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import { calculateNextSrsReview } from '@toeic-vstep/shared';
import type { VocabWord } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Badge, Button, Card, ProgressBar } from '@/shared/components/ui';

interface VocabFlashcardEngineProps {
  cards: VocabWord[];
  onCompleteSession: (stats: { again: number; hard: number; good: number; easy: number }) => void;
  onSubmitReview?: (cardId: string, quality: number, newIntervalDays: number) => void;
  exitTo?: string;
}

const RATINGS = [
  { q: 1, label: 'Quên', hint: '< 1 ngày', cls: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
  { q: 3, label: 'Khó', hint: '~ 1 ngày', cls: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { q: 4, label: 'Nhớ', hint: '~ 3 ngày', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { q: 5, label: 'Dễ', hint: '~ 7 ngày', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
];

/** Engine flashcard SRS (SM-2) với hiệu ứng lật 3D */
export const VocabFlashcardEngine: React.FC<VocabFlashcardEngineProps> = ({ cards, onCompleteSession, onSubmitReview, exitTo = '/app/vocabulary' }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [finished, setFinished] = useState(false);

  const card = cards[index];
  const total = cards.length;

  const speak = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!card) return;
    try {
      const u = new SpeechSynthesisUtterance(card.word);
      u.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  };

  const rate = (q: number) => {
    if (!card) return;
    const interval = calculateNextSrsReview({ quality: q, repetitions: card.repetitions, currentInterval: card.intervalDays, easeFactor: card.easeFactor }).intervalDays;
    onSubmitReview?.(card.id, q, interval);
    const key = q < 3 ? 'again' : q === 3 ? 'hard' : q === 4 ? 'good' : 'easy';
    const nextStats = { ...stats, [key]: stats[key] + 1 };
    setStats(nextStats);
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      setFlipped(false);
      if (index + 1 < total) setIndex((i) => i + 1);
      else {
        setFinished(true);
        onCompleteSession(nextStats);
      }
    }, 320);
  };

  if (finished || !card) {
    const learned = stats.good + stats.easy;
    return (
      <Card className="max-w-md mx-auto text-center space-y-5 animate-scale-in" padding="lg">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-pop">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">Hoàn thành phiên ôn!</h3>
          <p className="text-sm text-slate-500 mt-1">
            Bạn đã ôn {total} thẻ · nhớ tốt {learned} thẻ. Lịch ôn tiếp theo đã được SM-2 tính toán tự động.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            ['Quên', stats.again, 'text-rose-600 bg-rose-50'],
            ['Khó', stats.hard, 'text-amber-600 bg-amber-50'],
            ['Nhớ', stats.good, 'text-emerald-600 bg-emerald-50'],
            ['Dễ', stats.easy, 'text-indigo-600 bg-indigo-50'],
          ].map(([l, v, c]) => (
            <div key={l as string} className={cn('rounded-xl p-2.5', c as string)}>
              <p className="text-lg font-black">{v as number}</p>
              <p className="text-[10px] font-bold uppercase opacity-70">{l as string}</p>
            </div>
          ))}
        </div>
        <Button fullWidth to={exitTo} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Quay lại kho từ vựng
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between animate-fade-down">
        <Badge tone="indigo" size="md">
          Thẻ {index + 1}/{total}
        </Badge>
        <Badge tone="slate">{card.topic}</Badge>
      </div>
      <ProgressBar value={(index / total) * 100} size="sm" />

      <div className={cn('flip-card h-[340px] cursor-pointer select-none transition-all duration-300', leaving && 'opacity-0 -translate-x-8 scale-95')} onClick={() => setFlipped((f) => !f)}>
        <div className={cn('flip-inner relative w-full h-full', flipped && 'is-flipped')}>
          {/* Front */}
          <div className="flip-face absolute inset-0 rounded-3xl bg-white border border-slate-200 shadow-card flex flex-col items-center justify-center p-8 text-center">
            <Sparkles className="w-5 h-5 text-indigo-300 absolute top-5 left-5" />
            <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{card.word}</p>
            <p className="text-indigo-600 font-mono mt-2">{card.ipa}</p>
            <p className="text-xs italic text-slate-400 mt-1">{card.pos}</p>
            <button onClick={speak} className="mt-6 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 hover:scale-110 transition-transform">
              <Volume2 className="w-5 h-5" />
            </button>
            <p className="absolute bottom-5 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <RotateCw className="w-3 h-3" /> Nhấn để lật thẻ
            </p>
          </div>
          {/* Back */}
          <div className="flip-face flip-back absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 text-white shadow-lift flex flex-col justify-center p-8">
            <div aria-hidden className="absolute inset-0 bg-grid opacity-10 rounded-3xl" />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-black">{card.word}</p>
                <button onClick={speak} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xl font-bold text-amber-200">{card.meaningVi}</p>
              {card.meaningEn && <p className="text-sm text-indigo-100">{card.meaningEn}</p>}
              <div className="pt-3 border-t border-white/15">
                <p className="text-sm italic leading-relaxed">"{card.example}"</p>
                {card.exampleVi && <p className="text-xs text-indigo-200 mt-1">{card.exampleVi}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cn('transition-all duration-300', flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none')}>
        <p className="text-center text-xs font-semibold text-slate-500 mb-2">Bạn nhớ từ này tới mức nào?</p>
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button key={r.q} onClick={() => rate(r.q)} className={cn('rounded-2xl border py-3 transition-all duration-200 active:scale-95 hover:-translate-y-0.5', r.cls)}>
              <p className="font-black text-sm">{r.label}</p>
              <p className="text-[10px] opacity-70 font-semibold">{r.hint}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
