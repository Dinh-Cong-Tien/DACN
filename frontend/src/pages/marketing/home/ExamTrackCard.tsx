import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Img } from '@/shared/components/media/Img';
import { cn } from '@/shared/utils';
import type { ExamTrack } from '@/shared/types';

// indigo/violet đã được đổi sang teal/coral trong tailwind.config
const LINK = { toeic: 'text-indigo-300 hover:text-indigo-200', vstep: 'text-violet-300 hover:text-violet-200' } as const;

/** Thẻ giới thiệu một kỳ thi: ảnh, mô tả ngắn, bảng thông tin thực tế (dữ liệu từ HOME_EXAM_TRACKS) */
export const ExamTrackCard: React.FC<{ track: ExamTrack }> = ({ track: t }) => (
  <article className="group h-full flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
    <div className="overflow-hidden">
      <Img src={t.photo} alt={t.photoAlt} ratio="video" fallbackClass="bg-slate-800" className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
    </div>
    <div className="flex-1 flex flex-col p-6 md:p-8">
      <h3 className="font-display text-2xl md:text-[1.75rem] font-bold text-white">{t.name}</h3>
      <p className="mt-2 text-slate-400 leading-relaxed">{t.desc}</p>
      <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
        {t.facts.map((f) => (
          <div key={f.label} className="grid grid-cols-[6rem_1fr] sm:grid-cols-[7.5rem_1fr] gap-4 py-3">
            <dt className="text-slate-500">{f.label}</dt>
            <dd className="text-slate-200">{f.value}</dd>
          </div>
        ))}
      </dl>
      <Link to={t.to} className={cn('mt-auto pt-6 inline-flex items-center gap-1.5 self-start font-semibold transition-colors', LINK[t.id])}>
        {t.cta}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  </article>
);
