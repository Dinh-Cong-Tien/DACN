import React, { useId } from 'react';

/** Biểu tượng thương hiệu: quả địa cầu + bong bóng hội thoại + sách mở (vector, nét rõ ở mọi kích thước) */
export const BrandMark: React.FC<{ className?: string }> = ({ className }) => {
  const id = useId().replace(/:/g, '');
  const blue = `bm-blue-${id}`;
  const orange = `bm-orange-${id}`;
  return (
    <svg viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <defs>
        <linearGradient id={blue} x1="6" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2F86E0" />
          <stop offset="1" stopColor="#1A4FA0" />
        </linearGradient>
        <linearGradient id={orange} x1="24" y1="6" x2="38" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFA53A" />
          <stop offset="1" stopColor="#F26B1D" />
        </linearGradient>
      </defs>
      {/* quả địa cầu */}
      <g stroke={`url(#${blue})`} strokeWidth="2.2">
        <circle cx="19" cy="20" r="13" />
        <path d="M19 7c-5 4-5 22 0 26M19 7c5 4 5 22 0 26M6.5 16.5h25M6.5 23.5h25" />
      </g>
      {/* bong bóng hội thoại */}
      <path d="M26 8.5h10a4 4 0 0 1 4 4v4.5a4 4 0 0 1-4 4h-5l-4 3.2v-3.2h-1a4 4 0 0 1-4-4v-4.5a4 4 0 0 1 4-4z" fill={`url(#${orange})`} stroke="#fff" strokeWidth="1.6" />
      <g fill="#fff">
        <circle cx="27.5" cy="14.8" r="1.25" />
        <circle cx="31" cy="14.8" r="1.25" />
        <circle cx="34.5" cy="14.8" r="1.25" />
      </g>
      {/* tia sáng */}
      <path d="M43 4.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="#FFB020" />
      {/* sách mở */}
      <path d="M24 29.5c-4.5-3-11-3.5-17-1.5v12c6-2 12.5-1.5 17 1.5 4.5-3 11-3.5 17-1.5v-12c-6-2-12.5-1.5-17 1.5z" fill="#fff" stroke={`url(#${blue})`} strokeWidth="2.2" />
      <path d="M24 29.5v12" stroke={`url(#${blue})`} strokeWidth="2" />
      <path d="M10.5 31.5c3.5-.6 7 0 10 1.6M27.5 33.1c3-1.6 6.5-2.2 10-1.6" stroke="#9CC3EE" strokeWidth="1.4" />
      <path d="M4 42.5c7-2.4 14-2 20 1.5 6-3.5 13-3.9 20-1.5" stroke={`url(#${orange})`} strokeWidth="2.4" />
    </svg>
  );
};
