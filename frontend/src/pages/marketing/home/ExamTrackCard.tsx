import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { useInView } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import type { ExamTrack } from '@/shared/types';

// indigo/violet đã được đổi sang teal/coral trong tailwind.config
const ACCENT = {
  toeic: { line: 'bg-indigo-400', text: 'text-indigo-300', bar: 'bg-indigo-400', soft: 'bg-indigo-400/15 text-indigo-200 border-indigo-400/40' },
  vstep: { line: 'bg-violet-400', text: 'text-violet-300', bar: 'bg-violet-400', soft: 'bg-violet-400/15 text-violet-200 border-violet-400/40' },
} as const;

/** Thẻ giới thiệu một kỳ thi kèm phiếu điểm thi thử mẫu (dữ liệu từ HOME_EXAM_TRACKS) */
export const ExamTrackCard: React.FC<{ track: ExamTrack }> = ({ track: t }) => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const a = ACCENT[t.id];
  const r = t.report;
  const grow = 'transition-[width,height] duration-1000 ease-out';
  return (
    <div ref={ref} className="relative h-full flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
      <span aria-hidden className={cn('absolute inset-x-0 top-0 h-[3px]', a.line)} />

      <p className={cn('text-xs font-bold uppercase tracking-[0.14em]', a.text)}>{t.code}</p>
      <h3 className="font-display text-3xl md:text-4xl font-extrabold text-white mt-2">{t.title}</h3>
      <p className="mt-2 text-sm text-slate-400">
        {t.meta.join(' · ')} — {t.desc}
      </p>

      {/* Phiếu điểm thi thử mẫu */}
      <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/60">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 text-xs text-slate-400">
          <span className="truncate">
            Phiếu điểm · <span className="text-slate-200">{r.test}</span>
          </span>
          <span className="shrink-0 tabular-nums">{r.date}</span>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{r.learner}</p>
              <p className="font-display text-4xl font-extrabold text-white tabular-nums leading-none mt-1">
                {r.total}
                {r.totalMax && <span className="ml-1 text-base font-semibold text-slate-500">{r.totalMax}</span>}
              </p>
            </div>
            {r.totalNote && <span className={cn('shrink-0 rounded-md border px-2 py-1 text-xs font-semibold', a.soft)}>{r.totalNote}</span>}
          </div>

          <div className="space-y-2">
            {r.skills.map((s, i) => (
              <div key={s.label} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-3 text-xs">
                <span className="text-slate-400">{s.label}</span>
                <span className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <span className={cn('block h-full rounded-full', a.bar, grow)} style={{ width: inView ? `${(s.value / s.max) * 100}%` : '0%', transitionDelay: `${i * 90}ms` }} />
                </span>
                <span className="text-right font-semibold text-slate-200 tabular-nums">{s.display}</span>
              </div>
            ))}
          </div>

          {r.parts && (
            <div>
              <p className="text-[11px] text-slate-500 mb-1.5">Tỉ lệ đúng theo Part (trục từ 40%)</p>
              <div className="grid grid-cols-7 gap-1.5">
                {r.parts.map((p) => {
                  const weak = p.pct === Math.min(...r.parts!.map((x) => x.pct));
                  return (
                    <div key={p.label} className="text-center">
                      <div className="h-12 flex items-end rounded bg-white/[0.04]">
                        <span className={cn('block w-full rounded', weak ? 'bg-amber-400' : cn(a.bar, 'opacity-70'), grow)} style={{ height: inView ? `${Math.max(8, ((p.pct - 40) / 60) * 100)}%` : '0%' }} />
                      </div>
                      <p className={cn('mt-1 text-[11px] font-semibold tabular-nums', weak ? 'text-amber-300' : 'text-slate-300')}>{p.pct}%</p>
                      <p className={cn('text-[10px]', weak ? 'text-amber-300/80' : 'text-slate-500')}>{p.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {r.levels && (
            <div>
              <p className="text-[11px] text-slate-500 mb-1.5">Quy đổi bậc</p>
              <div className="grid grid-cols-3 gap-1.5">
                {r.levels.map((l) => (
                  <div key={l.label} className={cn('rounded-md border px-2 py-1.5 text-center', l.active ? a.soft : 'border-white/10 text-slate-500')}>
                    <p className="text-sm font-bold">{l.label}</p>
                    <p className="text-[10px] tabular-nums">{l.range}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="border-t border-white/10 pt-3 text-xs text-slate-400">{r.note}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-2 text-sm text-slate-300">
        {t.items.map((l) => (
          <li key={l} className="flex items-start gap-2">
            <Check className={cn('w-4 h-4 mt-0.5 shrink-0', a.text)} /> {l}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <Button to={t.to} variant="white" rightIcon={<ArrowRight className="w-4 h-4" />}>
          {t.cta}
        </Button>
      </div>
    </div>
  );
};
