import React, { useEffect } from 'react';

const COLORS = ['#118A72', '#FA5330', '#FFD24D', '#0ea5e9', '#8F7BFF', '#ffffff'];

/** Bắn confetti bằng DOM thuần (không thư viện). Gọi ở bất kỳ đâu. */
export function fireConfetti(opts: { count?: number; originY?: number; spread?: number } = {}) {
  if (typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const { count = 110, originY = 0.35, spread = 1 } = opts;
  const layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(layer);
  const W = window.innerWidth;
  const H = window.innerHeight;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    const size = 6 + Math.random() * 8;
    const x = W / 2 + (Math.random() - 0.5) * W * 0.3 * spread;
    const y = H * originY;
    const dx = (Math.random() - 0.5) * W * 0.9 * spread;
    const dy = H * (0.5 + Math.random() * 0.6);
    const rot = Math.random() * 720 - 360;
    const dur = 1400 + Math.random() * 1200;
    el.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size * (Math.random() > 0.5 ? 0.5 : 1)}px;background:${COLORS[i % COLORS.length]};border-radius:${Math.random() > 0.6 ? '50%' : '2px'};opacity:1;will-change:transform,opacity`;
    layer.appendChild(el);
    el.animate(
      [
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1, offset: 0 },
        { transform: `translate(${dx * 0.6}px, ${-H * 0.25}px) rotate(${rot / 2}deg) scale(1.1)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.8)`, opacity: 0, offset: 1 },
      ],
      { duration: dur, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'forwards' }
    );
  }
  setTimeout(() => layer.remove(), 2800);
}

/** Bắn confetti một lần khi mount (hoặc khi `when` chuyển true) */
export const Confetti: React.FC<{ when?: boolean; delay?: number; count?: number }> = ({ when = true, delay = 300, count }) => {
  useEffect(() => {
    if (!when) return;
    const t = setTimeout(() => fireConfetti({ count }), delay);
    return () => clearTimeout(t);
  }, [when, delay, count]);
  return null;
};
