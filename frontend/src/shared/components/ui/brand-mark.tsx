import React, { useId } from 'react';
import './brand-mark.css';

/**
 * Biểu tượng thương hiệu OrbiLingo: chữ "O" là một vòng quỹ đạo, khe hở có "vệ tinh" màu cam.
 * Vector phẳng, hình học, rõ từ 16px; màu đổi theo chế độ sáng/tối qua brand-mark.css.
 */
export const BrandMark: React.FC<{ className?: string }> = ({ className }) => {
  const id = useId().replace(/:/g, '');
  const ring = `bm-ring-${id}`;
  const dot = `bm-dot-${id}`;
  return (
    <svg viewBox="0 0 48 48" fill="none" className={['brand-mark', className].filter(Boolean).join(' ')} aria-hidden>
      <defs>
        <linearGradient id={ring} x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" className="brand-mark__ring-a" />
          <stop offset="1" className="brand-mark__ring-b" />
        </linearGradient>
        <linearGradient id={dot} x1="31" y1="8" x2="40" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      {/* vòng quỹ đạo — chữ O, chừa khe ở góc trên phải */}
      <circle cx="24" cy="24" r="16.5" stroke={`url(#${ring})`} strokeWidth="7.5" strokeLinecap="round" strokeDasharray="82.36 21.31" transform="rotate(-8 24 24)" />
      {/* vệ tinh */}
      <circle cx="35.67" cy="12.33" r="4.9" fill={`url(#${dot})`} />
    </svg>
  );
};
