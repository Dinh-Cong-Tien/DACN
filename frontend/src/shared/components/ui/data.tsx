import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useInView } from '@/shared/hooks';
import { EmptyState } from './layout';
import type { Tone } from './primitives';

// ============ TABS ============
export interface TabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}

export const Tabs: React.FC<{ items: TabItem[]; value: string; onChange: (k: string) => void; className?: string; variant?: 'underline' | 'pill' }> = ({ items, value, onChange, className, variant = 'underline' }) => {
  if (variant === 'pill') {
    return (
      <div className={cn('inline-flex p-1 rounded-2xl bg-slate-100 gap-1 overflow-x-auto no-scrollbar max-w-full', className)}>
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ease-spring flex items-center gap-1.5 [&>svg]:w-4 [&>svg]:h-4',
              value === it.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            {it.icon}
            {it.label}
            {it.count !== undefined && <span className={cn('px-1.5 rounded-md text-[10px]', value === it.key ? 'bg-indigo-50' : 'bg-slate-200/70')}>{it.count}</span>}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className={cn('flex gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar', className)}>
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={cn(
            'relative px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 [&>svg]:w-4 [&>svg]:h-4',
            value === it.key ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          )}
        >
          {it.icon}
          {it.label}
          {it.count !== undefined && <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">{it.count}</span>}
          <span className={cn('absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-indigo-600 transition-transform duration-300 origin-left', value === it.key ? 'scale-x-100' : 'scale-x-0')} />
        </button>
      ))}
    </div>
  );
};

// ============ SEGMENTED ============
export const Segmented: React.FC<{ options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; className?: string; size?: 'sm' | 'md' }> = ({ options, value, onChange, className, size = 'md' }) => (
  <div className={cn('inline-flex p-1 rounded-xl bg-slate-100 gap-0.5', className)}>
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={cn(
          'rounded-lg font-bold transition-all duration-300 ease-spring',
          size === 'sm' ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs',
          value === o.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

// ============ PROGRESS ============
const barTone: Record<Tone, string> = {
  indigo: 'from-indigo-500 to-violet-500',
  violet: 'from-violet-500 to-fuchsia-500',
  emerald: 'from-emerald-500 to-teal-400',
  amber: 'from-amber-400 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
  sky: 'from-sky-500 to-cyan-400',
  slate: 'from-slate-500 to-slate-700',
  teal: 'from-teal-500 to-emerald-400',
  orange: 'from-orange-500 to-amber-400',
  fuchsia: 'from-fuchsia-500 to-pink-500',
};

export const ProgressBar: React.FC<{ value: number; tone?: Tone; size?: 'xs' | 'sm' | 'md' | 'lg'; label?: string; showValue?: boolean; className?: string; striped?: boolean; animate?: boolean }> = ({
  value,
  tone = 'indigo',
  size = 'md',
  label,
  showValue,
  className,
  striped,
  animate = true,
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [w, setW] = useState(animate ? 0 : value);
  useEffect(() => {
    if (!animate) {
      setW(value);
      return;
    }
    if (inView) {
      const t = setTimeout(() => setW(value), 60);
      return () => clearTimeout(t);
    }
  }, [inView, value, animate]);
  const h = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }[size];
  return (
    <div ref={ref} className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5 text-xs">
          {label && <span className="font-semibold text-slate-600">{label}</span>}
          {showValue && <span className="font-bold text-slate-800">{Math.round(value)}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-slate-100 overflow-hidden', h)}>
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-1000 ease-spring', barTone[tone], striped && 'stripes animate-progress-stripes')}
          style={{ width: `${Math.min(100, Math.max(0, w))}%` }}
        />
      </div>
    </div>
  );
};

export const RingProgress: React.FC<{ value: number; size?: number; stroke?: number; tone?: Tone; children?: React.ReactNode; className?: string; trackClass?: string }> = ({
  value,
  size = 96,
  stroke = 9,
  tone = 'indigo',
  children,
  className,
  trackClass,
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setV(value), 80);
      return () => clearTimeout(t);
    }
  }, [inView, value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const colors: Record<Tone, string> = {
    indigo: '#4f46e5',
    violet: '#7c3aed',
    emerald: '#059669',
    amber: '#f59e0b',
    rose: '#e11d48',
    sky: '#0284c7',
    slate: '#475569',
    teal: '#0d9488',
    orange: '#ea580c',
    fuchsia: '#c026d3',
  };
  return (
    <div ref={ref} className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className={cn('fill-none stroke-slate-100', trackClass)} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke={colors[tone]}
          strokeLinecap="round"
          className="fill-none transition-[stroke-dashoffset] duration-1000 ease-spring"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, Math.max(0, v))) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children ?? <span className="font-black text-slate-900">{Math.round(value)}%</span>}</div>
    </div>
  );
};

// ============ MINI CHARTS (CSS/SVG thuần, không thư viện) ============
export const MiniBars: React.FC<{ data: { label: string; value: number; tone?: Tone }[]; max?: number; height?: number; className?: string; showLabels?: boolean }> = ({
  data,
  max,
  height = 120,
  className,
  showLabels = true,
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const m = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div ref={ref} className={cn('w-full', className)}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={d.label + i} className="flex-1 flex flex-col items-center justify-end h-full group">
            <div className="relative w-full flex items-end justify-center h-full">
              <span className="absolute -top-6 text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">{d.value}</span>
              <div
                className={cn('w-full max-w-[36px] rounded-t-lg bg-gradient-to-t transition-[height] duration-1000 ease-spring', barTone[d.tone ?? 'indigo'])}
                style={{ height: inView ? `${(d.value / m) * 100}%` : '0%', transitionDelay: `${i * 60}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="flex gap-2 mt-2">
          {data.map((d, i) => (
            <div key={d.label + i} className="flex-1 text-center text-[10px] font-semibold text-slate-400 truncate">
              {d.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sparkline: React.FC<{ data: number[]; width?: number; height?: number; tone?: Tone; className?: string; fill?: boolean }> = ({ data, width = 160, height = 48, tone = 'indigo', className, fill = true }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const colors: Record<Tone, string> = { indigo: '#4f46e5', violet: '#7c3aed', emerald: '#059669', amber: '#f59e0b', rose: '#e11d48', sky: '#0284c7', slate: '#64748b', teal: '#0d9488', orange: '#ea580c', fuchsia: '#c026d3' };
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const pts = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * (height - 6) - 3;
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;
  const id = React.useId();
  return (
    <div ref={ref} className={cn('inline-block', className)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={`sg-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={colors[tone]} stopOpacity="0.35" />
            <stop offset="100%" stopColor={colors[tone]} stopOpacity="0" />
          </linearGradient>
        </defs>
        {fill && <path d={area} fill={`url(#sg-${id})`} className={cn('transition-opacity duration-700', inView ? 'opacity-100' : 'opacity-0')} />}
        <path
          d={path}
          fill="none"
          stroke={colors[tone]}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 1000, strokeDashoffset: inView ? 0 : 1000, transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)' }}
        />
        {pts.length > 0 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={colors[tone]} className={cn(inView ? 'animate-pop' : 'opacity-0')} />}
      </svg>
    </div>
  );
};

export const RadarChart: React.FC<{ data: { label: string; value: number }[]; size?: number; tone?: Tone; className?: string }> = ({ data, size = 220, tone = 'indigo', className }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const colors: Record<Tone, string> = { indigo: '#4f46e5', violet: '#7c3aed', emerald: '#059669', amber: '#f59e0b', rose: '#e11d48', sky: '#0284c7', slate: '#64748b', teal: '#0d9488', orange: '#ea580c', fuchsia: '#c026d3' };
  const c = size / 2;
  const r = size / 2 - 28;
  const n = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, v: number) => [c + r * v * Math.cos(angle(i)), c + r * v * Math.sin(angle(i))] as const;
  const poly = (v: number) =>
    data
      .map((_, i) => point(i, v))
      .map(([x, y]) => `${x},${y}`)
      .join(' ');
  const dataPoly = data.map((d, i) => point(i, inView ? d.value / 100 : 0)).map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <div ref={ref} className={cn('inline-block', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[0.25, 0.5, 0.75, 1].map((v) => (
          <polygon key={v} points={poly(v)} className="fill-none stroke-slate-200" strokeWidth="1" />
        ))}
        {data.map((_, i) => {
          const [x, y] = point(i, 1);
          return <line key={i} x1={c} y1={c} x2={x} y2={y} className="stroke-slate-200" strokeWidth="1" />;
        })}
        <polygon points={dataPoly} fill={colors[tone]} fillOpacity="0.25" stroke={colors[tone]} strokeWidth="2.5" strokeLinejoin="round" style={{ transition: 'all 1s cubic-bezier(0.16,1,0.3,1)' }} />
        {data.map((d, i) => {
          const [x, y] = point(i, inView ? d.value / 100 : 0);
          return <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke={colors[tone]} strokeWidth="2.5" style={{ transition: 'all 1s cubic-bezier(0.16,1,0.3,1)' }} />;
        })}
        {data.map((d, i) => {
          const [x, y] = point(i, 1.22);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-slate-600 text-[10px] font-bold">
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export const Heatmap: React.FC<{ weeks?: number; data: Record<string, number>; className?: string }> = ({ weeks = 16, data, className }) => {
  const days: string[] = [];
  const today = new Date();
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const level = (v: number) => (v === 0 ? 'bg-slate-100' : v < 15 ? 'bg-indigo-200' : v < 30 ? 'bg-indigo-400' : v < 60 ? 'bg-indigo-600' : 'bg-indigo-800');
  return (
    <div className={cn('flex gap-1 overflow-x-auto no-scrollbar', className)}>
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={w} className="flex flex-col gap-1">
          {days.slice(w * 7, w * 7 + 7).map((d, i) => (
            <div key={d} title={`${d}: ${data[d] ?? 0} phút`} className={cn('w-3 h-3 rounded-[3px] transition-transform hover:scale-125 animate-scale-in', level(data[d] ?? 0))} style={{ animationDelay: `${(w * 7 + i) * 6}ms` }} />
          ))}
        </div>
      ))}
    </div>
  );
};

// ============ DATA TABLE ============
export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription,
  className,
  dense,
  selectable,
  selected,
  onToggle,
  loading,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  dense?: boolean;
  selectable?: boolean;
  selected?: Set<string>;
  onToggle?: (id: string) => void;
  loading?: boolean;
}) {
  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-slate-200 bg-white', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
            {selectable && <th className="w-10 px-4" />}
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={cn('px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap', c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left', c.className)}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {selectable && <td className="px-4 py-3" />}
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      <div className="skeleton h-3.5 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn('border-b border-slate-100 last:border-0 transition-colors animate-fade-in', onRowClick && 'cursor-pointer hover:bg-indigo-50/40', selected?.has(row.id) && 'bg-indigo-50/60')}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {selectable && (
                    <td className="px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggle?.(row.id)}
                        className={cn('w-4.5 h-4.5 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition', selected?.has(row.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300')}
                      >
                        {selected?.has(row.id) && <Check className="w-3 h-3 text-white" />}
                      </button>
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-4 text-slate-700', dense ? 'py-2' : 'py-3.5', c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left', c.className)}>
                      {c.render ? c.render(row, i) : String((row as Record<string, unknown>)[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && <EmptyState title={emptyTitle} description={emptyDescription} compact />}
    </div>
  );
}

export const Pagination: React.FC<{ page: number; totalPages: number; onChange: (p: number) => void; className?: string; total?: number; pageSize?: number }> = ({ page, totalPages, onChange, className, total, pageSize }) => {
  if (totalPages <= 1 && !total) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);
  return (
    <div className={cn('flex items-center justify-between gap-3 flex-wrap', className)}>
      {total !== undefined && pageSize && (
        <span className="text-xs text-slate-500">
          Hiển thị <b className="text-slate-800">{Math.min(total, (page - 1) * pageSize + 1)}–{Math.min(total, page * pageSize)}</b> / {total}
        </span>
      )}
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-slate-400">…</span>}
            <button onClick={() => onChange(p)} className={cn('w-9 h-9 rounded-xl text-xs font-bold transition', p === page ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:bg-slate-50')}>
              {p}
            </button>
          </React.Fragment>
        ))}
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============ ACCORDION ============
export const Accordion: React.FC<{ items: { id: string; title: React.ReactNode; content: React.ReactNode; icon?: React.ReactNode }[]; className?: string; defaultOpen?: string }> = ({ items, className, defaultOpen }) => {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  return (
    <div className={cn('space-y-2', className)}>
      {items.map((it) => {
        const isOpen = open === it.id;
        return (
          <div key={it.id} className={cn('rounded-2xl border bg-white transition-all duration-300', isOpen ? 'border-indigo-200 shadow-soft' : 'border-slate-200')}>
            <button onClick={() => setOpen(isOpen ? null : it.id)} className="w-full flex items-center gap-3 px-5 py-4 text-left">
              {it.icon && <span className="text-indigo-600 [&>svg]:w-5 [&>svg]:h-5">{it.icon}</span>}
              <span className="flex-1 font-bold text-sm text-slate-900">{it.title}</span>
              <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-300', isOpen && 'rotate-180 text-indigo-600')} />
            </button>
            <div className={cn('grid transition-[grid-template-rows] duration-300 ease-spring', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{it.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============ STEPPER ============
export const Stepper: React.FC<{ steps: { label: string; description?: string }[]; current: number; className?: string; compact?: boolean }> = ({ steps, current, className, compact }) => (
  <ol className={cn('flex items-center w-full', className)}>
    {steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <li key={s.label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all duration-500 ease-spring',
                done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white shadow-glow scale-110' : 'bg-slate-100 text-slate-400'
              )}
            >
              {done ? <Check className="w-4 h-4" /> : i + 1}
            </span>
            {!compact && (
              <div className="hidden sm:block">
                <p className={cn('text-xs font-bold leading-tight', active ? 'text-indigo-700' : done ? 'text-slate-700' : 'text-slate-400')}>{s.label}</p>
                {s.description && <p className="text-[10px] text-slate-400">{s.description}</p>}
              </div>
            )}
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-3 bg-slate-100 rounded overflow-hidden">
              <div className={cn('h-full bg-emerald-500 transition-all duration-700 ease-spring', done ? 'w-full' : 'w-0')} />
            </div>
          )}
        </li>
      );
    })}
  </ol>
);

// ============ TIMELINE ============
export const Timeline: React.FC<{ items: { id: string; title: React.ReactNode; description?: React.ReactNode; time?: string; tone?: Tone; icon?: React.ReactNode }[]; className?: string }> = ({ items, className }) => {
  const dot: Record<Tone, string> = { indigo: 'bg-indigo-500', violet: 'bg-violet-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500', sky: 'bg-sky-500', slate: 'bg-slate-400', teal: 'bg-teal-500', orange: 'bg-orange-500', fuchsia: 'bg-fuchsia-500' };
  return (
    <ol className={cn('relative border-l-2 border-slate-100 ml-3 space-y-5', className)}>
      {items.map((it, i) => (
        <li key={it.id} className="pl-6 relative animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
          <span className={cn('absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-white flex items-center justify-center text-white [&>svg]:w-2.5 [&>svg]:h-2.5', dot[it.tone ?? 'indigo'])}>{it.icon}</span>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">{it.title}</p>
              {it.description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{it.description}</p>}
            </div>
            {it.time && <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{it.time}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
};
