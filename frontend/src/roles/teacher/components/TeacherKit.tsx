import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useT } from '@/shared/i18n';

/**
 * Bộ khung giao diện khu vực giáo viên: tiêu đề lớn font display như trang học viên, khung bo tròn có bóng nhẹ,
 * ô số liệu kèm icon màu. Không dùng nút 3D, viền đen dày hay nhãn viên thuốc.
 */

type Crumb = { label: string; to?: string };

export type Tone = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
const TONE: Record<Tone, string> = {
  indigo: 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_6px_14px_-6px_rgba(99,102,241,0.7)]',
  emerald: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_6px_14px_-6px_rgba(16,185,129,0.7)]',
  amber: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_6px_14px_-6px_rgba(245,158,11,0.7)]',
  rose: 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-[0_6px_14px_-6px_rgba(244,63,94,0.7)]',
  sky: 'bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-[0_6px_14px_-6px_rgba(14,165,233,0.7)]',
  violet: 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_6px_14px_-6px_rgba(139,92,246,0.7)]',
};

/** Ô icon tròn màu nhạt */
export const IconTile: React.FC<{ icon: React.ElementType; tone?: Tone; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ icon: Icon, tone = 'indigo', size = 'md', className }) => (
  <span className={cn('flex shrink-0 items-center justify-center rounded-xl', TONE[tone], size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10', className)}>
    <Icon className={size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} />
  </span>
);

/** Tiêu đề kiểu trang học viên: từ cuối tô chữ chuyển màu */
export const GradientTail: React.FC<{ text: string }> = ({ text: raw }) => {
  // dịch cả câu trước khi tách từ cuối (tách rồi mới dịch thì từng mảnh không còn nghĩa)
  const t = useT();
  const text = t(raw);
  const i = text.lastIndexOf(' ');
  return i < 0 ? <span className="hero-gradient-text">{text}</span> : (
    <>
      {text.slice(0, i)} <span className="hero-gradient-text">{text.slice(i + 1)}</span>
    </>
  );
};

export const TPageHead: React.FC<{ title: React.ReactNode; sub?: React.ReactNode; eyebrow?: string; crumbs?: Crumb[]; actions?: React.ReactNode }> = ({ title, sub, eyebrow, crumbs, actions }) => (
  <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-[13px] text-slate-500">
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
      {eyebrow && !crumbs && <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-amber-600">{eyebrow}</p>}
      <h1 className="font-display text-[2rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 text-balance md:text-[2.6rem]">{typeof title === 'string' ? <GradientTail text={title} /> : title}</h1>
      {sub && <p className="mt-1.5 max-w-3xl text-[15px] leading-relaxed text-slate-500">{sub}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
);

type BtnProps = { variant?: 'primary' | 'default' | 'ghost'; size?: 'sm' | 'md'; icon?: React.ReactNode; to?: string; className?: string; children: React.ReactNode } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export const TBtn: React.FC<BtnProps> = ({ variant = 'default', size = 'md', icon, to, className, children, type = 'button', ...rest }) => {
  const cls = cn(
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4',
    size === 'sm' ? 'h-8 rounded-lg px-3 text-[13px]' : 'h-10 rounded-xl px-4 text-sm',
    variant === 'primary' && 'bg-indigo-600 text-white shadow-[0_6px_16px_-8px_rgba(79,70,229,0.7)] hover:bg-indigo-700',
    variant === 'default' && 'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50',
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
export const Panel: React.FC<{ title?: React.ReactNode; sub?: React.ReactNode; icon?: React.ElementType; tone?: Tone; action?: React.ReactNode; flush?: boolean; className?: string; children: React.ReactNode }> = ({ title, sub, icon, tone, action, flush, className, children }) => (
  <section className={cn('overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)]', className)}>
    {(title || action) && (
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon && <IconTile icon={icon} tone={tone} size="sm" />}
          <div className="min-w-0">
            {title && <h2 className="font-display text-[16px] font-bold text-slate-900">{title}</h2>}
            {sub && <p className="mt-0.5 text-[13px] text-slate-500">{sub}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
    )}
    <div className={flush ? undefined : 'p-5'}>{children}</div>
  </section>
);

export const PanelLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">
    {children} <ChevronRight className="h-3.5 w-3.5" />
  </Link>
);

/** Ô số liệu: icon màu, số lớn font display, ghi chú nhỏ */
export const Figures: React.FC<{ items: { label: string; value: React.ReactNode; note?: React.ReactNode; icon?: React.ElementType; tone?: Tone }[]; className?: string }> = ({ items, className }) => (
  <dl className={cn('grid grid-cols-2 gap-3 md:gap-4', items.length >= 5 ? 'sm:grid-cols-3 xl:grid-cols-5' : items.length >= 4 ? 'lg:grid-cols-4' : 'sm:grid-cols-3', className)}>
    {items.map((f) => (
      <div key={f.label} className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:p-5">
        {f.icon && <IconTile icon={f.icon} tone={f.tone} className="max-sm:hidden" />}
        <div className="min-w-0">
          <dt className="text-[13px] text-slate-500">{f.label}</dt>
          <dd className="mt-1 font-display text-[1.65rem] font-extrabold leading-none tracking-tight tabular-nums text-slate-900">{f.value}</dd>
          {f.note && <dd className="mt-1.5 text-xs text-slate-500">{f.note}</dd>}
        </div>
      </div>
    ))}
  </dl>
);

export type StatusTone = 'green' | 'amber' | 'red' | 'gray' | 'blue';
const DOT: Record<StatusTone, string> = { green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-rose-500', gray: 'bg-slate-400', blue: 'bg-sky-500' };

/** Trạng thái dạng chấm màu + chữ */
export const Status: React.FC<{ tone: StatusTone; children: React.ReactNode; className?: string }> = ({ tone, children, className }) => (
  <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-slate-700', className)}>
    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT[tone])} />
    {children}
  </span>
);

/** Tab gạch chân */
export const TTabs: React.FC<{ items: { key: string; label: string; count?: number }[]; value: string; onChange: (k: string) => void; className?: string }> = ({ items, value, onChange, className }) => (
  <div role="tablist" className={cn('flex gap-6 overflow-x-auto border-b border-slate-200 no-scrollbar', className)}>
    {items.map((t) => (
      <button
        key={t.key}
        type="button"
        role="tab"
        aria-selected={value === t.key}
        onClick={() => onChange(t.key)}
        className={cn('-mb-px shrink-0 border-b-2 pb-3 pt-1 text-sm transition-colors', value === t.key ? 'border-indigo-600 font-semibold text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800')}
      >
        {t.label}
        {t.count !== undefined && <span className={cn('ml-1.5 rounded-md px-1.5 py-0.5 text-[11px] tabular-nums', value === t.key ? 'bg-indigo-500/10 text-indigo-700' : 'bg-slate-100 text-slate-500')}>{t.count}</span>}
      </button>
    ))}
  </div>
);

/** Thanh tiến độ mảnh */
export const Meter: React.FC<{ value: number; tone?: 'indigo' | 'red' | 'amber' | 'green'; className?: string }> = ({ value, tone = 'indigo', className }) => (
  <div className={cn('h-1.5 overflow-hidden rounded-full bg-slate-100', className)}>
    <div className={cn('h-full rounded-full', tone === 'red' ? 'bg-rose-500' : tone === 'amber' ? 'bg-amber-500' : tone === 'green' ? 'bg-emerald-500' : 'bg-indigo-500')} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

/** % hoàn thành bài tập đã đến hạn; null = chưa có bài nào đến hạn → "—" */
export const CompletionMeter: React.FC<{ value: number | null; className?: string }> = ({ value, className }) =>
  value === null ? (
    <span className={cn('block text-[13px] text-slate-400', className)} title="Chưa có bài tập nào đến hạn">
      Chưa đến hạn
    </span>
  ) : (
    <span className={cn('flex items-center gap-2', className)}>
      <Meter value={value} tone={value < 65 ? 'red' : value < 80 ? 'amber' : 'indigo'} className="flex-1" />
      <span className="w-10 text-right text-[13px] tabular-nums text-slate-600">{value}%</span>
    </span>
  );

/** Class dùng chung cho bảng */
export const tbl = {
  table: 'w-full text-left text-sm',
  thead: 'border-b border-slate-100 bg-slate-50/80 text-[12px] font-semibold text-slate-500',
  th: 'px-5 py-3 font-semibold',
  tr: 'border-b border-slate-100 last:border-0 transition-colors hover:bg-indigo-500/[0.025]',
  td: 'px-5 py-3 align-middle',
};

export const inputCls = 'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

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

/** Màu riêng mỗi lớp (lịch dạy, nhãn lớp) */
const CLASS_COLORS = ['indigo', 'emerald', 'amber', 'violet', 'sky', 'rose'] as const;
export const classTone = (classId: string): Tone => {
  const n = /^cl-(\d+)$/.exec(classId);
  // id UUID: băm chuỗi để mỗi lớp giữ một màu ổn định
  const idx = n ? Number(n[1]) - 1 : [...classId].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return CLASS_COLORS[idx % CLASS_COLORS.length] ?? 'indigo';
};
export const CLASS_BAR: Record<Tone, string> = { indigo: 'border-l-indigo-500 bg-indigo-500/[0.07]', emerald: 'border-l-emerald-500 bg-emerald-500/[0.07]', amber: 'border-l-amber-500 bg-amber-500/[0.09]', violet: 'border-l-violet-500 bg-violet-500/[0.07]', sky: 'border-l-sky-500 bg-sky-500/[0.07]', rose: 'border-l-rose-500 bg-rose-500/[0.07]' };
