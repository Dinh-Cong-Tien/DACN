import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils';

/*
 * Bộ khung dùng chung cho các trang marketing bên trong (TOEIC, VSTEP, khoá học, thi thử...).
 * Cùng ngôn ngữ với trang chủ: nhãn nhỏ màu vàng, tiêu đề lớn có cụm chữ gradient (<Accent>), đường kẻ phát sáng
 * giữa các phần, thẻ kính mờ cho dải kêu gọi, nút chính cam 3D. Màu chữ theo bảng slate nên tự khớp chế độ sáng/tối.
 */

// ============ Nút dạng link / button ============
type Variant = 'primary' | 'secondary' | 'ghost' | 'light';
const VARIANT: Record<Variant, string> = {
  primary: 'btn-3d border-violet-700 bg-violet-500 text-white hover:bg-violet-400',
  secondary: 'border border-slate-900/15 bg-slate-900/[0.03] text-slate-900 backdrop-blur-sm hover:bg-slate-900/[0.07]',
  ghost: 'text-slate-700 hover:bg-slate-100',
  light: 'bg-white text-slate-900 hover:bg-slate-100',
};
const SIZE = { md: 'h-10 px-4 text-sm rounded-xl', lg: 'h-12 px-6 text-[15px] rounded-xl' } as const;

export const ActionLink: React.FC<{ to: string; variant?: Variant; size?: keyof typeof SIZE; className?: string; children: React.ReactNode; icon?: React.ReactNode }> = ({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
}) => (
  <Link to={to} className={cn('inline-flex items-center justify-center gap-2 font-bold transition-all', VARIANT[variant], SIZE[size], className)}>
    {children}
    {icon}
  </Link>
);

export const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof SIZE }> = ({ variant = 'primary', size = 'md', className, ...rest }) => (
  <button className={cn('inline-flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50', VARIANT[variant], SIZE[size], className)} {...rest} />
);

/** Cụm chữ gradient hồng–cam–tím trong tiêu đề, giống trang chủ */
export const Accent: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="hero-gradient-text">{children}</span>;

/** Nhãn nhỏ in hoa màu vàng phía trên tiêu đề (kiểu "Bảng giá" trên trang chủ) */
export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn('text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300', className)}>{children}</p>
);

/** Đường kẻ phát sáng giữa các phần (night-divider, chế độ sáng tự đổi màu trong night-theme.css) */
const Divider = () => <div aria-hidden className="night-divider" />;

// ============ Đầu trang ============
export interface Crumb {
  label: string;
  to?: string;
}

/** Đầu trang: breadcrumb, nhãn vàng, tiêu đề lớn, đoạn dẫn, hàng số liệu, nút hành động; cột phải tuỳ chọn (ảnh / khối minh hoạ) */
export const PageHeader: React.FC<{
  crumbs: Crumb[];
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  facts?: { value: string; label: string }[];
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}> = ({ crumbs, eyebrow, title, lead, facts, actions, aside, className }) => (
  <section className={cn('relative isolate bg-page', className)}>
    {/* Quầng sáng sau tiêu đề như hero trang chủ */}
    <div aria-hidden className="pointer-events-none absolute -top-32 left-[8%] -z-10 h-[420px] w-[620px] rounded-full bg-violet-500/25 opacity-50 blur-[140px] dark:opacity-100" />
    <div aria-hidden className="pointer-events-none absolute right-[4%] top-10 -z-10 h-[360px] w-[480px] rounded-full bg-fuchsia-500/20 opacity-40 blur-[140px] dark:opacity-100" />
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pb-16 grid gap-10 items-center', aside && 'lg:grid-cols-[1.15fr_1fr]')}>
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-slate-500">
          {crumbs.map((c, i) => (
            <React.Fragment key={c.label}>
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
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
        {eyebrow && <Eyebrow className="mt-8">{eyebrow}</Eyebrow>}
        <h1 className={cn('font-display text-[2.3rem] leading-[1.1] md:text-[3.2rem] lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 text-balance', eyebrow ? 'mt-3' : 'mt-6')}>{title}</h1>
        {lead && <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-slate-600">{lead}</p>}
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        {facts && (
          <dl className="mt-10 flex flex-wrap gap-x-9 gap-y-5 border-t border-slate-900/10 pt-7">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col-reverse">
                <dt className="mt-1.5 text-[13px] text-slate-500">{f.label}</dt>
                <dd className="font-display text-[1.6rem] md:text-[1.85rem] font-bold leading-none tracking-tight text-slate-900 tabular-nums">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {aside && <div className="min-w-0">{aside}</div>}
    </div>
  </section>
);

// ============ Section ============
/** Một phần của trang: ngăn cách bằng đường kẻ phát sáng như trang chủ; `muted` thêm quầng sáng nhẹ phía sau */
export const Section: React.FC<{ muted?: boolean; className?: string; innerClassName?: string; children: React.ReactNode; id?: string }> = ({ muted, className, innerClassName, children, id }) => (
  <section id={id} className={cn('relative isolate bg-page', className)}>
    <Divider />
    {muted && <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-indigo-500/15 opacity-60 blur-[150px] dark:opacity-100" />}
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24', innerClassName)}>{children}</div>
  </section>
);

/** Tiêu đề khối: không nhãn viên thuốc, không tô vàng chữ; có thể kèm link "Xem tất cả" bên phải */
export const SectionHead: React.FC<{ eyebrow?: string; title: React.ReactNode; desc?: React.ReactNode; action?: { label: string; to: string }; className?: string }> = ({ eyebrow, title, desc, action, className }) => (
  <div className={cn('mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between', className)}>
    <div className="max-w-2xl">
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 className="font-display text-[1.8rem] md:text-[2.4rem] font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">{title}</h2>
      {desc && <p className="mt-3 text-slate-600 leading-relaxed">{desc}</p>}
    </div>
    {action && (
      <Link to={action.to} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-800 hover:underline underline-offset-4">
        {action.label} <ChevronRight className="w-4 h-4" />
      </Link>
    )}
  </div>
);

// ============ Tab gạch chân (thay cho chip viên thuốc) ============
export function UnderlineTabs<T extends string>({ items, value, onChange, className }: { items: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn('flex gap-6 overflow-x-auto no-scrollbar border-b border-slate-200', className)}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.value)}
            className={cn('-mb-px shrink-0 border-b-2 pb-3 pt-1 text-sm font-medium transition-colors', on ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800')}
          >
            {it.label}
            {it.count !== undefined && <span className={cn('ml-1.5 text-xs tabular-nums', on ? 'text-slate-500' : 'text-slate-400')}>{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Dải kêu gọi cuối trang: thẻ kính mờ như khối "Bảng giá" của trang chủ, tiêu đề lớn + nút cam */
export const CtaStrip: React.FC<{ title: React.ReactNode; text?: string; eyebrow?: string; action: { label: string; to: string } }> = ({ title, text, eyebrow = 'Bắt đầu', action }) => (
  <div className="glass-night relative isolate flex flex-col gap-6 overflow-hidden rounded-3xl p-7 md:flex-row md:items-center md:justify-between md:p-10">
    <div aria-hidden className="pointer-events-none absolute -left-20 -top-24 -z-10 h-[260px] w-[420px] rounded-full bg-violet-500/25 opacity-50 blur-[100px] dark:opacity-100" />
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <p className="mt-3 font-display text-2xl md:text-[2rem] font-extrabold leading-tight tracking-tight text-slate-900">{title}</p>
      {text && <p className="mt-2 max-w-xl text-slate-600">{text}</p>}
    </div>
    <ActionLink to={action.to} size="lg" className="shrink-0">
      {action.label}
    </ActionLink>
  </div>
);
