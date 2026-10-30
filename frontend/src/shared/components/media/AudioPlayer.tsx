import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, Lock, RotateCcw } from 'lucide-react';
import { cn, formatClock } from '@/shared/utils';

interface AudioPlayerProps {
  src: string;
  /** Chế độ thi: không cho tua, chỉ phát 1 lần */
  examMode?: boolean;
  autoPlay?: boolean;
  className?: string;
  compact?: boolean;
  onEnded?: () => void;
}

/** Trình phát audio tuỳ biến: hỗ trợ chống tua lùi trong chế độ thi */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, examMode, autoPlay, className, compact, onEnded }) => {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      setPlayed(true);
      onEnded?.();
    };
    const onErr = () => setError(true);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onErr);
    if (autoPlay) a.play().then(() => setPlaying(true)).catch(() => undefined);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('error', onErr);
    };
  }, [src, autoPlay, onEnded]);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (examMode && played) return;
    if (playing) {
      if (examMode) return; // không cho tạm dừng khi thi
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setError(true));
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (examMode) return;
    const a = ref.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    a.currentTime = p * duration;
  };

  const restart = () => {
    const a = ref.current;
    if (!a || examMode) return;
    a.currentTime = 0;
    a.play().then(() => setPlaying(true)).catch(() => undefined);
  };

  const pct = duration ? (time / duration) * 100 : 0;
  const locked = examMode && played;

  return (
    <div className={cn('flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5', locked ? 'border-slate-300 bg-slate-50' : 'border-slate-900', className)}>
      <audio ref={ref} src={src} preload="metadata" />
      <button
        onClick={toggle}
        disabled={locked || error}
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 transition-all active:scale-95 disabled:opacity-50',
          locked ? 'bg-slate-400 border-2 border-slate-900' : 'bg-violet-500 border-2 border-slate-900 shadow-hard-sm'
        )}
        aria-label={playing ? 'Tạm dừng' : 'Phát'}
      >
        {locked ? <Lock className="w-4 h-4" /> : playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        {!compact && (
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1">
              {playing ? (
                <span className="inline-flex items-end gap-[2px] h-3.5 w-4">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="eq-bar w-[3px] h-full rounded-sm bg-indigo-600" />
                  ))}
                </span>
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              {examMode ? (locked ? 'Đã phát — không thể nghe lại' : 'Audio chỉ phát 1 lần, không tua') : 'Audio'}
            </span>
            <span className="font-mono">
              {formatClock(Math.floor(time))} / {formatClock(Math.floor(duration))}
            </span>
          </div>
        )}
        <div onClick={seek} className={cn('h-2 rounded-full bg-slate-100 overflow-hidden', !examMode && 'cursor-pointer')}>
          <div className="h-full rounded-full bg-indigo-600 transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
        {error && <p className="text-[10px] text-rose-500 mt-1">Không tải được audio mẫu (cần kết nối mạng).</p>}
      </div>
      {!examMode && (
        <button onClick={restart} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition" aria-label="Phát lại">
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
