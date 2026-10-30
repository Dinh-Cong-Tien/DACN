import React from 'react';
import { Img } from '@/shared/components/media/Img';
import type { Testimonial } from '@/shared/types';

/** Thẻ vinh danh học viên: ảnh người đứng, điểm đạt được, điểm đầu vào, số tuần, ngày + nơi thi */
export const TestimonialCard: React.FC<{ item: Testimonial }> = ({ item: t }) => (
  <figure className="h-full flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
    <Img src={t.avatar ?? ''} alt={t.name} ratio="3/4" fallbackClass="bg-slate-800" />
    <figcaption className="flex-1 flex flex-col p-5">
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
