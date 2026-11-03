import React, { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/shared/utils';
import './charts.css';

/**
 * Biểu đồ SVG dùng chung cho các trang thống kê (giáo viên, giáo viên bậc cao, quản trị):
 * cột dọc, cột ngang, đường, thanh tỷ lệ (cột chồng 100%). Nét mảnh, đầu cột bo 4px, lưới mờ, tooltip khi rê chuột,
 * chú thích khi có từ 2 chuỗi trở lên. Một trục y duy nhất.
 */

type Slot = 1 | 2;
const SERIES_VAR: Record<Slot, string> = { 1: 'var(--viz-series-1)', 2: 'var(--viz-series-2)' };
const fmtDefault = (v: number) => v.toLocaleString('vi-VN');

/** Đo bề rộng khung để vẽ SVG đúng pixel (không méo chữ khi co giãn) */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Mốc trục y "đẹp" (0, 25, 50…); `exact` = mốc trên cùng đúng bằng max; số đếm thì bước tối thiểu 1 */
function niceTicks(max: number, count = 4, opts: { exact?: boolean; integer?: boolean } = {}) {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const cands = [1, 1.25, 2, 2.5, 5, 10].map((m) => m * mag).filter((s) => !opts.integer || (s >= 1 && Number.isInteger(s)));
  const fit = opts.exact ? cands.find((s) => s >= raw * 0.75 && Math.abs(max / s - Math.round(max / s)) < 1e-9) : undefined;
  const step = fit ?? cands.find((s) => s >= raw) ?? Math.max(raw, opts.integer ? 1 : raw);
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

const Tooltip: React.FC<{ x: number; y: number; w: number; children: React.ReactNode }> = ({ x, y, w, children }) => (
  <div className="pointer-events-none absolute z-10 -translate-y-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] shadow-lg" style={{ left: Math.min(Math.max(x, 70), w - 70), top: y - 8, transform: 'translate(-50%, -100%)' }}>
    {children}
  </div>
);

const Legend: React.FC<{ items: { name: string; slot: Slot }[] }> = ({ items }) => (
  <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
    {items.map((s) => (
      <span key={s.name} className="inline-flex items-center gap-1.5 text-[12px] text-slate-600">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SERIES_VAR[s.slot] }} />
        {s.name}
      </span>
    ))}
  </div>
);

/** Cột dọc một chuỗi: phân bố, so sánh giữa các nhóm */
export const BarChart: React.FC<{ data: { label: string; value: number }[]; height?: number; max?: number; unit?: string; format?: (v: number) => string; highlight?: string; className?: string; ariaLabel: string }> = ({ data, height = 220, max, unit = '', format = fmtDefault, highlight, className, ariaLabel }) => {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 36, r: 8, t: 12, b: 28 };
  const ticks = niceTicks(max ?? Math.max(...data.map((d) => d.value), 1), 4, { exact: max !== undefined, integer: data.every((d) => Number.isInteger(d.value)) });
  const top = ticks[ticks.length - 1];
  const iw = Math.max(0, w - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const band = iw / data.length;
  const bw = Math.min(44, band * 0.6);
  const y = (v: number) => pad.t + ih - (v / top) * ih;

  return (
    <div ref={ref} className={cn('viz relative', className)}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={ariaLabel}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)'} />
              <text x={pad.l - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-400 text-[11px] tabular-nums">
                {format(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = pad.l + band * i + (band - bw) / 2;
            const h = Math.max(0, y(0) - y(d.value));
            const dim = (highlight && d.label !== highlight) || (hover !== null && hover !== i);
            return (
              <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect x={pad.l + band * i} y={pad.t} width={band} height={ih} fill="transparent" />
                {d.value > 0 && <path d={`M${x},${y(0)} v${-Math.max(0, h - 4)} q0,-4 4,-4 h${bw - 8} q4,0 4,4 v${Math.max(0, h - 4)} z`} fill="var(--viz-series-1)" opacity={dim ? 0.45 : 1} />}
                <text x={pad.l + band * i + band / 2} y={height - 8} textAnchor="middle" className="fill-slate-500 text-[11px]">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && w > 0 && (
        <Tooltip x={pad.l + band * hover + band / 2} y={y(data[hover].value)} w={w}>
          <span className="text-slate-500">{data[hover].label}</span> <span className="font-semibold tabular-nums text-slate-900">{format(data[hover].value)}{unit}</span>
        </Tooltip>
      )}
    </div>
  );
};

/** Cột ngang có nhãn bên trái, giá trị bên phải: xếp hạng, tỷ lệ theo mục */
export const HBarChart: React.FC<{ data: { label: string; value: number; note?: string }[]; max?: number; unit?: string; format?: (v: number) => string; labelWidth?: number; action?: (d: { label: string; value: number }, i: number) => React.ReactNode; className?: string; ariaLabel: string }> = ({ data, max, unit = '', format = fmtDefault, labelWidth = 150, action, className, ariaLabel }) => {
  const top = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn('viz', className)} role="img" aria-label={ariaLabel}>
      <ul className="space-y-2">
        {data.map((d, i) => (
          <li key={d.label} className="group grid items-center gap-3 text-sm" style={{ gridTemplateColumns: `${labelWidth}px 1fr 52px${action ? ' auto' : ''}` }} title={`${d.label}: ${format(d.value)}${unit}`}>
            <span className="truncate text-slate-700">{d.label}</span>
            <span className="relative h-5 rounded bg-slate-100">
              <span className="absolute inset-y-0 left-0 rounded transition-opacity group-hover:opacity-80" style={{ width: `${(d.value / top) * 100}%`, background: 'var(--viz-series-1)' }} />
            </span>
            <span className="text-right font-semibold tabular-nums text-slate-900">
              {format(d.value)}
              {unit}
            </span>
            {action && <span>{action(d, i)}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Đường theo thời gian, 1–2 chuỗi cùng đơn vị; rê chuột hiện đường dóng và tooltip */
export const LineChart: React.FC<{ labels: string[]; series: { name: string; values: number[]; slot?: Slot }[]; height?: number; min?: number; max?: number; unit?: string; format?: (v: number) => string; className?: string; ariaLabel: string }> = ({ labels, series, height = 220, min = 0, max, unit = '', format = fmtDefault, className, ariaLabel }) => {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 40, r: 26, t: 12, b: 28 };
  const ticks = niceTicks((max ?? Math.max(...series.flatMap((s) => s.values), 1)) - min, 4, { exact: max !== undefined }).map((t) => t + min);
  const top = ticks[ticks.length - 1];
  const iw = Math.max(0, w - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length > 1 ? (iw * i) / (labels.length - 1) : iw / 2);
  const y = (v: number) => pad.t + ih - ((v - min) / (top - min || 1)) * ih;
  const withSlot = series.map((s, i) => ({ ...s, slot: s.slot ?? ((i + 1) as Slot) }));

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left - pad.l) / (iw || 1)) * (labels.length - 1));
    setHover(Math.min(labels.length - 1, Math.max(0, i)));
  };

  return (
    <div ref={ref} className={cn('viz relative', className)}>
      {withSlot.length > 1 && <Legend items={withSlot} />}
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={ariaLabel} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke={t === min ? 'var(--viz-axis)' : 'var(--viz-grid)'} />
              <text x={pad.l - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-400 text-[11px] tabular-nums">
                {format(t)}
              </text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={l} x={x(i)} y={height - 8} textAnchor="middle" className="fill-slate-500 text-[11px]">
              {l}
            </text>
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="var(--viz-axis)" strokeDasharray="3 3" />}
          {withSlot.map((s) => (
            <g key={s.name}>
              <path d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')} fill="none" stroke={SERIES_VAR[s.slot]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 5 : 3.5} fill={SERIES_VAR[s.slot]} stroke="var(--viz-surface)" strokeWidth={2} />
              ))}
            </g>
          ))}
        </svg>
      )}
      {hover !== null && w > 0 && (
        <Tooltip x={x(hover)} y={Math.min(...withSlot.map((s) => y(s.values[hover])))} w={w}>
          <p className="mb-0.5 text-slate-500">{labels[hover]}</p>
          {withSlot.map((s) => (
            <p key={s.name} className="flex items-center gap-1.5 whitespace-nowrap">
              {withSlot.length > 1 && <span className="h-2 w-2 rounded-sm" style={{ background: SERIES_VAR[s.slot] }} />}
              {withSlot.length > 1 && <span className="text-slate-600">{s.name}</span>}
              <span className="font-semibold tabular-nums text-slate-900">
                {format(s.values[hover])}
                {unit}
              </span>
            </p>
          ))}
        </Tooltip>
      )}
    </div>
  );
};

/** Màu đoạn của thanh tỷ lệ: 4 slot phân loại (đã kiểm tra CVD) hoặc màu trạng thái */
export type SegmentColor = 'series-1' | 'series-2' | 'series-3' | 'series-4' | 'good' | 'warn' | 'serious' | 'bad' | 'neutral';

/**
 * Thanh tỷ lệ (cột chồng 100%): cơ cấu của một tổng — ít nhóm (≤ 5).
 * Khe 2px giữa các đoạn, đầu thanh bo 4px; chú thích luôn có nhãn + số + % (màu không mang nghĩa một mình).
 */
export const StackedBar: React.FC<{ data: { label: string; value: number; color: SegmentColor }[]; unit?: string; format?: (v: number) => string; className?: string; ariaLabel: string }> = ({ data, unit = '', format = fmtDefault, className, ariaLabel }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const [hover, setHover] = useState<number | null>(null);
  const pct = (v: number) => (total ? Math.round((v / total) * 1000) / 10 : 0);
  return (
    <div className={cn('viz', className)} role="img" aria-label={`${ariaLabel}: ${data.map((d) => `${d.label} ${format(d.value)}${unit}`).join(', ')}`}>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded bg-slate-100">
        {data
          .map((d, i) => ({ d, i }))
          .filter(({ d }) => d.value > 0)
          .map(({ d, i }) => (
            <span
              key={d.label}
              className="h-full first:rounded-l last:rounded-r transition-opacity"
              style={{ width: `${pct(d.value)}%`, background: `var(--viz-${d.color})`, opacity: hover !== null && hover !== i ? 0.45 : 1 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              title={`${d.label}: ${format(d.value)}${unit} (${pct(d.value)}%)`}
            />
          ))}
      </div>
      <ul className="mt-3 grid gap-y-1.5">
        {data.map((d, i) => (
          <li key={d.label} className={cn('flex items-center gap-2 text-[13px] transition-opacity', hover !== null && hover !== i && 'opacity-50')} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: `var(--viz-${d.color})` }} />
            <span className="min-w-0 flex-1 truncate text-slate-600">{d.label}</span>
            <span className="font-semibold tabular-nums text-slate-900">
              {format(d.value)}
              {unit}
            </span>
            <span className="w-11 text-right tabular-nums text-slate-500">{pct(d.value)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
