import React, { useId } from 'react';
import type { Achievement } from '@/shared/types';
import { cn } from '@/shared/utils';
import { NamedIcon } from './named-icon';

/** Chất liệu huy chương theo độ hiếm: đồng → bạc → vàng → bạch kim; ruy băng mỗi bậc một màu */
const METAL: Record<Achievement['rarity'], { rim: [string, string, string]; face: [string, string]; ribbon: [string, string] }> = {
  COMMON: { rim: ['#f6c79b', '#c27a45', '#7c4321'], face: ['#d99560', '#8a4b23'], ribbon: ['#3b82f6', '#1d4ed8'] },
  RARE: { rim: ['#ffffff', '#b8c2d0', '#6b7789'], face: ['#d5dce6', '#7d8899'], ribbon: ['#14b8a6', '#0f766e'] },
  EPIC: { rim: ['#fff3c4', '#e0a83a', '#8f5a0c'], face: ['#f3c14d', '#a86a0f'], ribbon: ['#8b5cf6', '#6d28d9'] },
  LEGENDARY: { rim: ['#f0fdff', '#8fd3e8', '#2b6f86'], face: ['#b5e6f2', '#3c8aa3'], ribbon: ['#e11d48', '#9f1239'] },
};

/**
 * Huy chương kim loại (SVG) cho huy hiệu: vành sáng–tối tạo khối, mặt lõm, vạch răng cưa quanh vành,
 * dải ruy băng phía dưới, icon lucide khắc nổi ở giữa.
 */
export const AchievementMedal: React.FC<{ icon?: string | null; rarity?: Achievement['rarity']; size?: number; className?: string; locked?: boolean }> = ({ icon, rarity = 'COMMON', size = 56, className, locked }) => {
  const uid = useId().replace(/:/g, '');
  const m = METAL[rarity];
  const h = Math.round(size * 1.18);
  return (
    <span className={cn('relative inline-block shrink-0', locked && 'opacity-50 grayscale', className)} style={{ width: size, height: h }}>
      <svg viewBox="0 0 64 76" width={size} height={h} aria-hidden className="absolute inset-0 overflow-visible">
        <defs>
          <linearGradient id={`rim${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={m.rim[0]} />
            <stop offset="0.45" stopColor={m.rim[1]} />
            <stop offset="1" stopColor={m.rim[2]} />
          </linearGradient>
          <linearGradient id={`face${uid}`} x1="1" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={m.face[0]} />
            <stop offset="1" stopColor={m.face[1]} />
          </linearGradient>
          <linearGradient id={`rib${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={m.ribbon[1]} />
            <stop offset="1" stopColor={m.ribbon[0]} />
          </linearGradient>
        </defs>
        {/* Ruy băng: hai dải chéo, đuôi cắt chữ V */}
        <path d="M20 44 L30 46 L26 74 L21.5 69.5 L16 72 Z" fill={`url(#rib${uid})`} />
        <path d="M44 44 L34 46 L38 74 L42.5 69.5 L48 72 Z" fill={`url(#rib${uid})`} />
        <path d="M30 46 L26 74 L21.5 69.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        {/* Vành */}
        <circle cx="32" cy="30" r="27" fill={`url(#rim${uid})`} />
        <circle cx="32" cy="30" r="27" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
        {/* Vạch răng cưa quanh vành */}
        <circle cx="32" cy="30" r="24.2" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.6" strokeDasharray="1.2 2.2" />
        {/* Mặt lõm */}
        <circle cx="32" cy="30" r="21" fill={`url(#face${uid})`} />
        <circle cx="32" cy="30" r="21" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
        {/* Ánh sáng phản chiếu góc trên */}
        <path d="M14 22 A20 20 0 0 1 36 10.4" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="absolute inset-x-0 flex items-center justify-center" style={{ top: 0, height: (size * 60) / 64 }}>
        <span style={{ width: size * 0.36, height: size * 0.36 }}>
          <NamedIcon name={icon} fallback="Award" className="h-full w-full text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]" />
        </span>
      </span>
    </span>
  );
};
