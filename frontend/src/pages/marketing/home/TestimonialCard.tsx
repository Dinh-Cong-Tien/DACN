import React from 'react';
import { cn } from '@/shared/utils';
import type { Testimonial } from '@/shared/types';

// indigo/violet đã được đổi sang teal/coral trong tailwind.config
const BLOCK = { TOEIC: 'bg-indigo-500', VSTEP: 'bg-violet-500' } as const;
const LABEL = { TOEIC: 'text-indigo-300', VSTEP: 'text-violet-300' } as const;

/** Thẻ vinh danh học viên: ảnh người tách nền đứng trước khối màu nửa bầu dục, điểm lớn + bài thi + tên bên dưới */
export const TestimonialCard: React.FC<{ item: Testimonial }> = ({ item: t }) => (
  <figure className="h-full flex flex-col text-center">
    <div className="relative h-72 md:h-80">
      <div aria-hidden className={cn('absolute inset-x-3 bottom-0 h-[62%] rounded-[50%_50%_0_0/100%_100%_0_0]', BLOCK[t.exam])} />
      {t.avatar && <img src={t.avatar} alt={t.name} loading="lazy" className="relative mx-auto h-full w-auto object-contain object-bottom" />}
    </div>
    <figcaption className="flex-1 flex flex-col pt-5">
      <p className="font-display text-6xl md:text-7xl font-extrabold leading-none tracking-tight text-amber-400 tabular-nums">{t.after}</p>
      <p className={cn('mt-2 text-sm font-semibold', LABEL[t.exam])}>{t.test}</p>
      <p className="mt-1 font-display text-xl font-bold text-white">{t.name}</p>
      <p className="text-sm text-slate-400">{t.role}</p>
      <p className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-400">
        Đầu vào <span className="text-slate-200 tabular-nums">{t.before}</span> · {t.weeks} tuần · thi {t.examDate}, {t.venue}
      </p>
    </figcaption>
  </figure>
);
