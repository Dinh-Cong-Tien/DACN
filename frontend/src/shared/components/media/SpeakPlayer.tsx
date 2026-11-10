import React, { useEffect, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { cn } from '@/shared/utils';

/** Phát lời đọc bằng giọng đọc của trình duyệt (câu nghe chưa có tệp audio). Đổi câu → dừng đọc. */
export const SpeakPlayer: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const [rate, setRate] = useState(1);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    setPlays(0);
    return () => {
      if (supported) window.speechSynthesis.cancel();
      setPlaying(false);
    };
  }, [text, supported]);

  const play = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    u.onend = u.onerror = () => setPlaying(false);
    setPlaying(true);
    setPlays((n) => n + 1);
    window.speechSynthesis.speak(u);
  };
  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

  if (!supported) return <p className={cn('text-sm text-amber-700', className)}>Trình duyệt không hỗ trợ đọc câu nghe. Hãy dùng Chrome hoặc Edge.</p>;
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5', className)}>
      <button
        type="button"
        onClick={playing ? stop : play}
        aria-label={playing ? 'Dừng' : plays ? 'Nghe lại' : 'Nghe'}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {playing ? <Square className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{playing ? 'Đang phát…' : plays ? 'Nghe lại' : 'Nghe đoạn ghi âm'}</p>
        <p className="text-xs text-slate-500">{plays ? `Đã nghe ${plays} lần` : 'Bấm để nghe rồi chọn đáp án'}</p>
      </div>
      <div role="radiogroup" aria-label="Tốc độ đọc" className="inline-flex rounded-lg border border-slate-200 p-0.5">
        {[0.75, 1].map((r) => (
          <button key={r} type="button" role="radio" aria-checked={rate === r} onClick={() => setRate(r)} className={cn('rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors', rate === r ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900')}>
            {r}×
          </button>
        ))}
      </div>
    </div>
  );
};
