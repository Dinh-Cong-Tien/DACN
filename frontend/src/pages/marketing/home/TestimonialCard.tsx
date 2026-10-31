import React from 'react';
import { cn } from '@/shared/utils';
import { useInView } from '@/shared/hooks';
import { CountUp } from '@/shared/components/motion';
import type { Testimonial } from '@/shared/types';
import './TestimonialCard.css';

// indigo/violet đã được đổi sang teal/coral trong tailwind.config
const DOME = { TOEIC: 'from-indigo-400 to-indigo-600', VSTEP: 'from-violet-400 to-violet-600' } as const;
const LABEL = { TOEIC: 'text-indigo-300', VSTEP: 'text-violet-300' } as const;

/** Thẻ vinh danh học viên: ảnh người tách nền đứng trước khối màu nửa bầu dục, điểm lớn + bài thi + tên, 3 chỉ số bên dưới */
export const TestimonialCard: React.FC<{ item: Testimonial }> = ({ item: t }) => {
  const stats = [
    { label: 'Đầu vào', value: t.before },
    { label: 'Thời gian', value: `${t.weeks} tuần` },
    { label: 'Ngày thi', value: t.examDate },
  ];
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.25 });
  return (
    <figure ref={ref} className={cn('testi-card group h-full flex flex-col text-center', inView && 'is-in')}>
      <div className="relative h-72 md:h-80">
        <div aria-hidden className={cn('testi-card__dome absolute inset-x-6 bottom-0 h-[60%] rounded-[50%_50%_0_0/100%_100%_0_0] bg-gradient-to-b', DOME[t.exam])} />
        {t.avatar && <img src={t.avatar} alt={t.name} loading="lazy" className="testi-card__person relative mx-auto h-full w-auto object-contain object-bottom [filter:drop-shadow(0_10px_18px_rgba(0,0,0,0.35))]" />}
      </div>
      <figcaption className="testi-card__info flex-1 flex flex-col pt-6">
        {/* điểm dạng số thì đếm tăng dần khi cuộn tới */}
        <p className="font-display text-6xl md:text-7xl font-extrabold leading-none tracking-tight text-amber-400 tabular-nums">{/^\d+$/.test(t.after) ? <CountUp value={Number(t.after)} duration={1400} format={String} /> : t.after}</p>
        <p className={cn('mt-2 text-sm font-semibold', LABEL[t.exam])}>{t.test}</p>
        <p className="mt-3 font-display text-xl font-bold text-white">{t.name}</p>
        <p className="text-sm text-slate-400">{t.role}</p>
        <dl className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.03] py-3">
          {stats.map((s) => (
            <div key={s.label} className="px-2">
              <dt className="text-[11px] text-slate-500">{s.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-100 tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-slate-500">
          Thi tại {t.venue}
          {t.certificateId && <> · Số phiếu {t.certificateId}</>}
        </p>
      </figcaption>
    </figure>
  );
};
