import React from 'react';
import { initials } from '@/shared/utils';
import type { Testimonial } from '@/shared/types';

/** Nhận xét học viên: điểm sau là trọng tâm, kèm điểm đầu vào, số tuần học, ngày và nơi thi */
export const TestimonialCard: React.FC<{ item: Testimonial }> = ({ item: t }) => (
  <figure className="h-full flex flex-col rounded-2xl border border-white/10 bg-slate-900 p-6 md:p-7">
    <div className="flex items-baseline gap-3">
      <span className="font-display text-5xl font-extrabold text-white tabular-nums leading-none">{t.after}</span>
      <span className="text-sm text-slate-400">
        {t.exam} · từ <span className="text-slate-200">{t.before}</span> sau {t.weeks} tuần
      </span>
    </div>
    <p className="mt-1.5 text-xs text-slate-500">
      Thi ngày {t.examDate} tại {t.venue}
    </p>

    <blockquote className="mt-5 flex-1 text-slate-300 leading-relaxed">{t.quote}</blockquote>

    <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
      <span aria-hidden className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-slate-700 text-sm font-semibold text-slate-200">
        {initials(t.name)}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{t.name}</span>
        <span className="block text-xs text-slate-400 truncate">{t.role}</span>
      </span>
    </figcaption>
  </figure>
);
