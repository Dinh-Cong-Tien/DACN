import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Languages, ScrollText } from 'lucide-react';
import type { TranscriptLine } from '@/shared/types';
import { Card } from '@/shared/components/ui';
import { cn, formatClock } from '@/shared/utils';
import './lesson-transcript.css';

const PREF = 'orbi.lesson.script';
const readPref = (): { open: boolean; vi: boolean } => {
  try {
    return { open: true, vi: true, ...JSON.parse(localStorage.getItem(PREF) ?? '{}') };
  } catch {
    return { open: true, vi: true };
  }
};
const writePref = (p: { open: boolean; vi: boolean }) => {
  try {
    localStorage.setItem(PREF, JSON.stringify(p));
  } catch {
    /* trình duyệt chặn lưu trữ */
  }
};

/** Câu cuối cùng đã bắt đầu tại thời điểm t (tìm nhị phân, lines đã sắp theo start) */
const lineAt = (lines: TranscriptLine[], t: number) => {
  let lo = 0;
  let hi = lines.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].start <= t) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
};

/**
 * Script của video, chạy theo đúng thời điểm video đang phát:
 * câu đang nói được tô sáng + thanh tiến độ trong câu, tự cuộn theo; bấm câu để tua tới đó, bấm từ để tra nghĩa.
 * Nút Ẩn / Hiện script (nhớ lựa chọn trên trình duyệt).
 */
export const LessonTranscript: React.FC<{
  lines: TranscriptLine[];
  now: () => number;
  onSeek: (sec: number) => void;
  onWord?: (e: React.MouseEvent, word: string) => void;
}> = ({ lines, now, onSeek, onWord }) => {
  const [pref, setPref] = useState(readPref);
  const [active, setActive] = useState(-1);
  const [speaking, setSpeaking] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLSpanElement>(null);
  const userScrollAt = useRef(0);
  const hasVi = lines.some((l) => l.textVi);

  const update = (p: Partial<typeof pref>) =>
    setPref((x) => {
      const n = { ...x, ...p };
      writePref(n);
      return n;
    });

  // theo dõi thời điểm video mỗi khung hình (chỉ khi script đang mở)
  useEffect(() => {
    if (!pref.open) return;
    let raf = 0;
    let last = -2;
    let lastSpeaking: boolean | null = null;
    const loop = () => {
      const t = now();
      const i = lineAt(lines, t);
      const on = i >= 0 && t < lines[i].end;
      if (i !== last) setActive((last = i));
      if (on !== lastSpeaking) setSpeaking((lastSpeaking = on));
      if (bar.current && i >= 0) {
        const l = lines[i];
        bar.current.style.transform = `scaleX(${Math.min(1, Math.max(0, (t - l.start) / Math.max(0.001, l.end - l.start)))})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pref.open, lines, now]);

  // tự cuộn câu đang nói lên khoảng 1/3 khung — tạm dừng 4 giây khi người học tự cuộn
  useEffect(() => {
    const b = box.current;
    const el = rows.current[active];
    if (!b || !el || Date.now() - userScrollAt.current < 4000) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    b.scrollTo({ top: Math.max(0, el.offsetTop - b.clientHeight / 3), behavior: reduce ? 'auto' : 'smooth' });
  }, [active, pref.open]);

  const markUserScroll = () => (userScrollAt.current = Date.now());

  return (
    <Card padding="none" className="ls-card animate-fade-up">
      <div className="ls-head">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="ls-head__icon">
            <ScrollText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">Script</p>
            <p className="truncate text-[11px] text-slate-500">{pref.open ? 'Chạy theo video · bấm câu để tua tới đó · bấm từ để tra nghĩa' : `${lines.length} câu thoại`}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {pref.open && hasVi && (
            <button type="button" className={cn('ls-btn', pref.vi && 'ls-btn--on')} aria-pressed={pref.vi} onClick={() => update({ vi: !pref.vi })}>
              <Languages className="h-3.5 w-3.5" /> Song ngữ
            </button>
          )}
          <button type="button" className="ls-btn" aria-expanded={pref.open} onClick={() => update({ open: !pref.open })}>
            {pref.open ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {pref.open ? 'Ẩn script' : 'Hiện script'}
          </button>
        </div>
      </div>
      {pref.open && (
        <div ref={box} className="ls-body" onWheel={markUserScroll} onTouchMove={markUserScroll}>
          {lines.map((l, i) => {
            const isActive = i === active && speaking;
            return (
              <div
                key={i}
                ref={(el) => (rows.current[i] = el)}
                className={cn('ls-line', isActive && 'ls-line--active', i < active && 'ls-line--past')}
                onClick={() => {
                  userScrollAt.current = 0;
                  onSeek(l.start);
                }}
              >
                <button type="button" className="ls-time" aria-label={`Tua tới ${formatClock(l.start)}`} onClick={(e) => (e.stopPropagation(), (userScrollAt.current = 0), onSeek(l.start))}>
                  {formatClock(l.start)}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="ls-text">
                    {l.text.split(/(\s+)/).map((w, k) =>
                      /\S/.test(w) ? (
                        <span key={k} className="ls-word" onClick={(e) => onWord?.(e, w)}>
                          {w}
                        </span>
                      ) : (
                        w
                      )
                    )}
                  </p>
                  {pref.vi && l.textVi && <p className="ls-vi">{l.textVi}</p>}
                  {isActive && (
                    <span className="ls-progress" aria-hidden>
                      <span ref={bar} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
