import React, { useEffect, useLayoutEffect, useState } from 'react';
import './LoopConnector.css';

/**
 * Trục thời gian cho 5 bước: một đường thẳng mảnh chạy dọc (giữa 2 cột trên máy tính, mép trái trên điện thoại),
 * mỗi bước một nút tròn nhỏ. Bước đã cuộn tới (nút qua giữa màn hình) thì nút và đoạn đường phía trên được tô màu nhấn.
 */
export const LoopConnector: React.FC<{ containerRef: React.RefObject<HTMLDivElement>; rowRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; dark?: boolean }> = ({ containerRef, rowRefs, dark }) => {
  const [geo, setGeo] = useState<{ w: number; h: number; x: number; ys: number[] }>({ w: 0, h: 0, x: 0, ys: [] });
  const [reached, setReached] = useState(-1);

  useLayoutEffect(() => {
    const box = containerRef.current;
    if (!box) return;
    const calc = () => {
      const desktop = window.matchMedia('(min-width: 768px)').matches;
      const top = box.getBoundingClientRect().top;
      const ys = (rowRefs.current.filter(Boolean) as HTMLDivElement[]).map((el) => {
        const r = el.getBoundingClientRect();
        // máy tính: giữa hàng (2 cột căn giữa) · điện thoại: ngang số bước ở đầu hàng
        return desktop ? r.top - top + r.height / 2 : r.top - top + 34;
      });
      setGeo({ w: box.offsetWidth, h: box.offsetHeight, x: desktop ? box.offsetWidth / 2 : 14, ys });
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(box);
    return () => ro.disconnect();
  }, [containerRef, rowRefs]);

  // Bước đã tới = nút cuối cùng nằm trên 60% chiều cao màn hình (gộp theo khung hình)
  useEffect(() => {
    const box = containerRef.current;
    if (!box || !geo.ys.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const top = box.getBoundingClientRect().top;
      const line = window.innerHeight * 0.6;
      let r = -1;
      geo.ys.forEach((y, i) => top + y <= line && (r = i));
      setReached(r);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [containerRef, geo.ys]);

  const { w, h, x, ys } = geo;
  if (ys.length < 2) return null;
  const first = ys[0];
  const last = ys[ys.length - 1];
  const ratio = reached >= 0 ? (ys[reached] - first) / (last - first || 1) : 0;
  const track = dark ? 'rgba(255,255,255,0.12)' : 'rgba(20,26,43,0.12)';
  const accent = '#F97316';
  const bg = dark ? '#0f1424' : '#faf7f1';

  return (
    <svg aria-hidden className="loop-axis pointer-events-none absolute inset-0" width={w} height={h} viewBox={`0 0 ${w || 1} ${h || 1}`}>
      <line x1={x} y1={first} x2={x} y2={last} stroke={track} strokeWidth="2" />
      <rect x={x - 1} y={first} width="2" height={last - first} fill={accent} className="loop-axis__fill" style={{ transform: `scaleY(${ratio})`, transformOrigin: `${x}px ${first}px` }} />
      {ys.map((y, i) => {
        const on = i <= reached;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="9" fill={bg} stroke={on ? accent : track} strokeWidth="2" className="loop-axis__node" />
            <circle cx={x} cy={y} r="3.5" fill={accent} className="loop-axis__dot" style={{ opacity: on ? 1 : 0 }} />
          </g>
        );
      })}
    </svg>
  );
};
