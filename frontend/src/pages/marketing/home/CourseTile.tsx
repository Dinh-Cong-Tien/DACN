import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Img } from '@/shared/components/media/Img';
import { RevealPhoto } from '@/shared/components/motion';
import { cn } from '@/shared/utils';
import { courseHref } from '@/shared/mocks';
import type { Course } from '@/shared/types';

/** Thẻ khoá học kiểu trang LMS: ảnh bìa + thời lượng, tên, giáo viên, đánh giá, số bài, giá */
export const CourseTile: React.FC<{ course: Course }> = ({ course: c }) => (
  <Link to={courseHref(c)} className="group flex flex-col h-full overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition-colors hover:border-white/25 light:border-slate-200 light:bg-white light:hover:border-slate-300">
    <div className="relative overflow-hidden">
      <RevealPhoto>
        <Img src={c.coverUrl} alt={c.title} ratio="video" fallbackClass="bg-slate-800" className="transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
      </RevealPhoto>
      <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums">{c.durationHours} giờ</span>
    </div>
    <div className="flex-1 flex flex-col p-4">
      <p className="text-xs font-semibold text-indigo-300 light:text-indigo-700">
        {c.sections.length} chặng · {c.level}
      </p>
      <h3 className="mt-1.5 font-semibold text-white light:text-slate-900 leading-snug line-clamp-2 group-hover:underline underline-offset-2 decoration-white/40 light:decoration-slate-400">{c.title}</h3>
      <p className="mt-1 text-sm text-slate-400 light:text-slate-500">{c.teacherName}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm">
        <b className="text-amber-300">{c.rating.toFixed(1)}</b>
        <span className="flex text-amber-300" aria-hidden>
          {[0, 1, 2, 3, 4].map((k) => (
            <Star key={k} className={cn('w-3.5 h-3.5', k < Math.round(c.rating) ? 'fill-current' : 'opacity-30')} />
          ))}
        </span>
        <span className="text-slate-500">({c.studentsCount.toLocaleString('vi-VN')} học viên)</span>
      </p>
      <div className="mt-auto pt-3 flex items-center justify-between text-sm">
        <span className="text-slate-400 light:text-slate-500">{c.lessonsCount} bài học</span>
        <span className={cn('font-bold', c.isFree ? 'text-emerald-300 light:text-emerald-700' : 'text-white light:text-slate-900')}>{c.isFree ? 'Miễn phí' : 'Gói VIP'}</span>
      </div>
    </div>
  </Link>
);
