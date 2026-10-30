import React, { useLayoutEffect, useState } from 'react';
import './LoopConnector.css';

/**
 * Đường cong nét đứt ngắn nối mép dưới ảnh bước i với mép trên ảnh bước i+1 (chỉ desktop).
 * Đồng bộ với hiệu ứng từng mục: khi hàng bước i+1 hiện ra thì đoạn nối tự vẽ từ ảnh trên xuống ảnh dưới,
 * chấm đến bật lên ở cuối; khi hàng đó ẩn thì đoạn nối thu lại.
 */
export const LoopConnector: React.FC<{ containerRef: React.RefObject<HTMLDivElement>; photoRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; rowsOn: boolean[]; dark?: boolean }> = ({ containerRef, photoRefs, rowsOn, dark }) => {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [paths, setPaths] = useState<{ d: string; a: [number, number]; b: [number, number] }[]>([]);
  useLayoutEffect(() => {
    const box = containerRef.current;
    if (!box) return;
    // offsetLeft/Top bỏ qua transform của hiệu ứng xuất hiện nên vị trí ổn định
    const pos = (el: HTMLElement) => {
      let x = 0;
      let y = 0;
      let n: HTMLElement | null = el;
      while (n && n !== box) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight };
    };
    const calc = () => {
      setSize({ w: box.offsetWidth, h: box.offsetHeight });
      const els = photoRefs.current.filter(Boolean) as HTMLDivElement[];
      const out: { d: string; a: [number, number]; b: [number, number] }[] = [];
      for (let i = 0; i < els.length - 1; i++) {
        const p = pos(els[i]);
        const q = pos(els[i + 1]);
        const a: [number, number] = [p.x + p.w / 2, p.y + p.h + 26];
        const b: [number, number] = [q.x + q.w / 2, q.y - 26];
        const dy = b[1] - a[1];
        out.push({ d: `M ${a[0]} ${a[1]} C ${a[0]} ${a[1] + dy * 0.75}, ${b[0]} ${b[1] - dy * 0.75}, ${b[0]} ${b[1]}`, a, b });
      }
      setPaths(out);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(box);
    return () => ro.disconnect();
  }, [containerRef, photoRefs]);

  const ink = dark ? '#0B0F1C' : '#141A2B';
  const pop = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  return (
    <svg aria-hidden className="hidden md:block absolute inset-0 pointer-events-none" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}>
      {paths.map((p, i) => {
        const on = Boolean(rowsOn[i + 1]); // hiện cùng lúc với hàng bước kế tiếp
        const mid = `loop-mask-${i}`;
        const gid = `loop-grad-${i}`;
        return (
          <g key={i}>
            <defs>
              <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={p.a[0]} y1={p.a[1]} x2={p.b[0]} y2={p.b[1]}>
                <stop offset="0%" stopColor="#FA5330" />
                <stop offset="100%" stopColor="#FFD24D" />
              </linearGradient>
              {/* Mặt nạ vẽ dần: nét đứt giữ nguyên nhịp, chỉ phần đã "mở" mới thấy */}
              <mask id={mid} maskUnits="userSpaceOnUse" x={0} y={0} width={size.w} height={size.h}>
                <path d={p.d} fill="none" stroke="#fff" strokeWidth="24" pathLength={1} strokeDasharray="1" strokeDashoffset={on ? 0 : 1} style={{ transition: `stroke-dashoffset ${on ? '0.9s' : '0.5s'} cubic-bezier(0.65, 0, 0.35, 1) ${on ? '0.15s' : '0s'}` }} />
              </mask>
            </defs>
            <g mask={`url(#${mid})`}>
              {/* rãnh mờ liền bên dưới: đường đọc liền mạch, nét đứt nổi lên trên */}
              <path d={p.d} fill="none" stroke={dark ? '#ffffff' : '#141A2B'} strokeOpacity={dark ? 0.07 : 0.06} strokeWidth="14" strokeLinecap="round" />
              {/* nét đứt chính: gradient cam → vàng, trôi theo chiều đi */}
              <path d={p.d} fill="none" stroke={`url(#${gid})`} strokeWidth="7" strokeLinecap="round" strokeDasharray="10 18" className="loop-dash" />
            </g>
            {/* nút đi: vòng cam viền tối, tâm sáng */}
            <g className="loop-dot" style={{ transform: `scale(${on ? 1 : 0})`, transition: `transform 0.4s ${pop}` }}>
              <circle cx={p.a[0]} cy={p.a[1]} r="12" fill="#FA5330" stroke={ink} strokeWidth="4" />
              <circle cx={p.a[0]} cy={p.a[1]} r="4" fill="#ffffff" />
            </g>
            {/* nút đến: bật lên khi nét vừa vẽ tới, vành sáng nhịp nhẹ */}
            <g className="loop-dot" style={{ transform: `scale(${on ? 1 : 0})`, transition: `transform 0.45s ${pop} ${on ? '0.95s' : '0s'}` }}>
              <circle cx={p.b[0]} cy={p.b[1]} r="24" fill="#FFD24D" fillOpacity="0.16" className={on ? 'loop-pin' : undefined} />
              <circle cx={p.b[0]} cy={p.b[1]} r="12" fill="#FFD24D" stroke={ink} strokeWidth="4" />
              <circle cx={p.b[0]} cy={p.b[1]} r="4" fill={ink} />
            </g>
          </g>
        );
      })}
    </svg>
  );
};
