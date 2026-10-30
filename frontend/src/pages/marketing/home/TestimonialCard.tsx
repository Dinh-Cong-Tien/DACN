import React from 'react';
import { cn } from '@/shared/utils';
import type { Testimonial } from '@/shared/types';

// indigo/violet đã được đổi sang teal/coral trong tailwind.config
const RING = { TOEIC: 'from-indigo-400/70 to-indigo-700/30', VSTEP: 'from-violet-400/70 to-violet-700/30' } as const;

/** Thẻ vinh danh học viên: ảnh người đã tách nền đứng trên vòng tròn màu, thông tin điểm bên dưới */
export const TestimonialCard: React.FC<{ item: Testimonial }> = ({ item: t }) => (
  <figure className="h-full flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
    <div className="relative h-80 md:h-[22rem] overflow-hidden bg-gradient-to-b from-slate-800/60 to-slate-900">
      <div aria-hidden className={cn('absolute left-1/2 top-10 -translate-x-1/2 w-64 h-64 md:w-72 md:h-72 rounded-full bg-gradient-to-br', RING[t.exam])} />
      {t.avatar && <img src={t.avatar} alt={t.name} loading="lazy" className="absolute inset-x-0 bottom-0 mx-auto h-full w-auto object-contain object-bottom [filter:drop-shadow(0_16px_28px_rgba(0,0,0,0.45))]" />}
    </div>
    <figcaption className="flex-1 flex flex-col border-t border-white/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-white">{t.name}</p>
          <p className="text-sm text-slate-400">{t.role}</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block font-display text-4xl font-extrabold leading-none text-white tabular-nums">{t.after}</span>
          <span className="text-xs font-semibold text-slate-400">{t.exam}</span>
        </p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-4 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Đầu vào</dt>
          <dd className="text-slate-200 tabular-nums">{t.before}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Thời gian học</dt>
          <dd className="text-slate-200">{t.weeks} tuần</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-slate-500">Ngày thi</dt>
          <dd className="text-slate-200">
            {t.examDate} · {t.venue}
          </dd>
        </div>
      </dl>
    </figcaption>
  </figure>
);
