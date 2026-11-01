import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils';

/**
 * Bộ khung giao diện khu vực giáo viên: phẳng, mật độ cao, màu trung tính — giống phần mềm quản lý lớp học.
 * Không dùng nút 3D, nhãn in hoa, thẻ màu đậm hay ảnh trang trí.
 */

type Crumb = { label: string; to?: string };

export const TPageHead: React.FC<{ title: React.ReactNode; sub?: React.ReactNode; crumbs?: Crumb[]; actions?: React.ReactNode }> = ({ title, sub, crumbs, actions }) => (
  <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-1.5 flex flex-wrap items-center gap-1 text-[13px] text-slate-500">
          {crumbs.map((c, i) => (
            <React.Fragment key={c.label}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
              {c.to ? (
                <Link to={c.to} className="hover:text-slate-900 hover:underline underline-offset-2">
                  {c.label}
                </Link>
              ) : (
                <span className="text-slate-700">{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <h1 className="text-[1.6rem] font-semibold leading-tight tracking-tight text-slate-900">{title}</h1>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
);

type BtnProps = { variant?: 'primary' | 'default' | 'ghost'; size?: 'sm' | 'md'; icon?: React.ReactNode; to?: string; className?: string; children: React.ReactNode } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export const TBtn: React.FC<BtnProps> = ({ variant = 'default', size = 'md', icon, to, className, children, type = 'button', ...rest }) => {
  const cls = cn(
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4',
    size === 'sm' ? 'h-8 px-2.5 text-[13px]' : 'h-9 px-3.5 text-sm',
    variant === 'primary' && 'bg-indigo-600 text-white hover:bg-indigo-700',
    variant === 'default' && 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
    variant === 'ghost' && 'text-slate-600 hover:bg-slate-900/[0.05] hover:text-slate-900',
    className
  );
  return to ? (
    <Link to={to} className={cls}>
      {icon}
      {children}
    </Link>
  ) : (
    <button type={type} className={cls} {...rest}>
      {icon}
      {children}
    </button>
  );
};

/** Khung nội dung có tiêu đề; `flush` bỏ padding để đặt bảng sát viền */
export const Panel: React.FC<{ title?: React.ReactNode; sub?: React.ReactNode; action?: React.ReactNode; flush?: boolean; className?: string; children: React.ReactNode }> = ({ title, sub, action, flush, className, children }) => (
  <section className={cn('overflow-hidden rounded-lg border border-slate-200 bg-white', className)}>
    {(title || action) && (
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="min-w-0">
          {title && <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>}
          {sub && <p className="mt-0.5 text-[13px] text-slate-500">{sub}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
    )}
    <div className={flush ? undefined : 'p-4'}>{children}</div>
  </section>
);

export const PanelLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className="inline-flex items-center gap-0.5 text-[13px] font-medium text-indigo-700 hover:underline underline-offset-2">
    {children} <ChevronRight className="h-3.5 w-3.5" />
  </Link>
);

/** Dải số liệu trong một khung, các ô ngăn bằng đường kẻ */
export const Figures: React.FC<{ items: { label: string; value: React.ReactNode; note?: React.ReactNode }[]; className?: string }> = ({ items, className }) => (
  <dl className={cn('grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white', items.length >= 4 ? 'lg:grid-cols-4' : 'sm:grid-cols-3', className)}>
    {items.map((f, i) => (
      <div key={f.label} className={cn('px-4 py-3.5', i > 0 && 'border-l border-slate-200', i >= 2 && 'max-lg:border-t', i === 2 && 'max-lg:border-l-0')}>
        <dt className="text-[13px] text-slate-500">{f.label}</dt>
        <dd className="mt-1 text-[1.4rem] font-semibold leading-tight tabular-nums text-slate-900">{f.value}</dd>
        {f.note && <dd className="mt-0.5 text-xs text-slate-500">{f.note}</dd>}
      </div>
    ))}
  </dl>
);

export type StatusTone = 'green' | 'amber' | 'red' | 'gray' | 'blue';
const DOT: Record<StatusTone, string> = { green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-rose-500', gray: 'bg-slate-400', blue: 'bg-sky-500' };

/** Trạng thái dạng chấm màu + chữ, không dùng nhãn viên thuốc */
export const Status: React.FC<{ tone: StatusTone; children: React.ReactNode; className?: string }> = ({ tone, children, className }) => (
  <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-slate-700', className)}>
    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT[tone])} />
    {children}
  </span>
);

/** Tab gạch chân */
export const TTabs: React.FC<{ items: { key: string; label: string; count?: number }[]; value: string; onChange: (k: string) => void; className?: string }> = ({ items, value, onChange, className }) => (
  <div role="tablist" className={cn('flex gap-5 overflow-x-auto border-b border-slate-200 no-scrollbar', className)}>
    {items.map((t) => (
      <button
        key={t.key}
        type="button"
        role="tab"
        aria-selected={value === t.key}
        onClick={() => onChange(t.key)}
        className={cn('-mb-px shrink-0 border-b-2 pb-2.5 pt-1 text-sm transition-colors', value === t.key ? 'border-indigo-600 font-medium text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800')}
      >
        {t.label}
        {t.count !== undefined && <span className="ml-1.5 tabular-nums text-slate-400">{t.count}</span>}
      </button>
    ))}
  </div>
);

/** Thanh tiến độ mảnh, một màu */
export const Meter: React.FC<{ value: number; tone?: 'indigo' | 'red' | 'amber'; className?: string }> = ({ value, tone = 'indigo', className }) => (
  <div className={cn('h-1.5 overflow-hidden rounded-full bg-slate-200', className)}>
    <div className={cn('h-full rounded-full', tone === 'red' ? 'bg-rose-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-indigo-600')} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

/** Class dùng chung cho bảng */
export const tbl = {
  table: 'w-full text-left text-sm',
  thead: 'border-b border-slate-200 bg-slate-50 text-[13px] text-slate-500',
  th: 'px-4 py-2.5 font-medium',
  tr: 'border-b border-slate-100 last:border-0 hover:bg-slate-50/70',
  td: 'px-4 py-2.5 align-middle',
};

export const inputCls = 'h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export const DAY_NAME: Record<string, string> = { T2: 'Thứ Hai', T3: 'Thứ Ba', T4: 'Thứ Tư', T5: 'Thứ Năm', T6: 'Thứ Sáu', T7: 'Thứ Bảy', CN: 'Chủ nhật' };

/** Tách lịch dạng 'T2 – T4 – T6 · 19:00' thành các buổi trong tuần, sắp theo thứ (T2 → CN) rồi giờ */
export function weekSessions<T extends { schedule: string }>(classes: T[]): { day: string; time: string; cls: T }[] {
  const order = (d: string) => (d === 'CN' ? 7 : Number(d.slice(1)));
  return classes
    .flatMap((cls) => {
      const [days, time = ''] = cls.schedule.split('·').map((x) => x.trim());
      return (days.match(/T[2-7]|CN/g) ?? []).map((day) => ({ day, time, cls }));
    })
    .sort((a, b) => order(a.day) - order(b.day) || a.time.localeCompare(b.time));
}

export const todayCode = () => DAYS[new Date().getDay()];
