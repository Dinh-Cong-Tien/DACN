import React from 'react';
import { cn } from '@/shared/utils';

/** Bảng màu bìa theo bộ đề (nền đậm + màu nhấn) — cùng bộ đề cùng màu, các bộ khác nhau dễ phân biệt */
const PALETTES = {
  TOEIC: [
    { bg: '#0f3b3a', via: '#14504d', accent: '#5eead4' },
    { bg: '#1b2a4a', via: '#243a66', accent: '#93c5fd' },
    { bg: '#3a1f3d', via: '#4f2a53', accent: '#f0abfc' },
    { bg: '#3b2a12', via: '#543c19', accent: '#fcd34d' },
  ],
  VSTEP: [
    { bg: '#14361f', via: '#1d4a2b', accent: '#86efac' },
    { bg: '#2b1d47', via: '#3a2862', accent: '#c4b5fd' },
    { bg: '#40191c', via: '#5a2328', accent: '#fda4af' },
  ],
} as const;

const hash = (s: string) => Array.from(s).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Bìa đề thi khi chưa có ảnh bìa: nền màu theo bộ đề, hoạ tiết đường kẻ, số đề lớn — mọi chữ lấy từ dữ liệu đề */
export const TestCover: React.FC<{ examType: string; title: string; totalQuestions?: number; durationMinutes?: number; year?: number | string; level?: string; className?: string }> = ({
  examType,
  title,
  totalQuestions,
  durationMinutes,
  year,
  level,
  className,
}) => {
  const m = title.match(/(.*?)[\s—–-]*\bTest\s*(\d+)\s*$/i);
  const series = (m ? m[1] : title).trim() || examType;
  const num = m ? m[2] : null;
  const list = examType === 'VSTEP' ? PALETTES.VSTEP : PALETTES.TOEIC;
  const p = list[hash(series) % list.length];
  const meta = [totalQuestions && `${totalQuestions} câu`, durationMinutes && `${durationMinutes} phút`, level].filter(Boolean).join(' · ');

  return (
    <div className={cn('absolute inset-0 overflow-hidden text-white', className)} style={{ background: `linear-gradient(135deg, ${p.bg} 0%, ${p.via} 100%)` }}>
      {/* Hoạ tiết: lưới mảnh + vòng cung đồng tâm góc phải */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.10]" aria-hidden>
        <defs>
          <pattern id="tc-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="#fff" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tc-grid)" />
      </svg>
      <svg className="absolute -right-16 -top-20 h-[260px] w-[260px]" viewBox="0 0 200 200" aria-hidden>
        {[95, 78, 61, 44].map((r, i) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke={p.accent} strokeOpacity={0.14 + i * 0.06} strokeWidth="1.2" />
        ))}
      </svg>

      {/* Số đề lớn dạng chữ viền */}
      {num && (
        <span className="pointer-events-none absolute -bottom-6 right-3 select-none font-display text-[128px] font-extrabold leading-none tabular-nums" style={{ color: 'transparent', WebkitTextStroke: `1.5px ${p.accent}`, opacity: 0.45 }} aria-hidden>
          {num.padStart(2, '0')}
        </span>
      )}

      <div className="relative flex h-full flex-col justify-end p-4 pr-28">
        <span className="mb-2 h-0.5 w-8 rounded-full" style={{ background: p.accent }} />
        <p className="line-clamp-1 text-[12px] font-semibold uppercase tracking-wider" style={{ color: p.accent }}>
          {series}
        </p>
        <p className="font-display text-[28px] font-extrabold leading-tight">{num ? `Test ${num}` : examType}</p>
        {(meta || year) && (
          <p className="mt-1 text-[12px] font-medium text-white/70">
            {meta}
            {year ? `${meta ? ' · ' : ''}${year}` : ''}
          </p>
        )}
      </div>
    </div>
  );
};
