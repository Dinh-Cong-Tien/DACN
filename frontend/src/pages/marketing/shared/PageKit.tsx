import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils';

/*
 * Bộ khung dùng chung cho các trang marketing bên trong (TOEIC, VSTEP, khoá học, thi thử...).
 * Phong cách "sản phẩm thật": nền trắng/xám nhạt, viền mảnh 1px, bo 12px, không bóng cứng, không nghiêng, không hoạ tiết.
 */

// ============ Nút dạng link / button ============
type Variant = 'primary' | 'secondary' | 'ghost' | 'light';
const VARIANT: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
  light: 'bg-white text-slate-900 hover:bg-slate-100',
};
const SIZE = { md: 'h-10 px-4 text-sm', lg: 'h-12 px-5 text-[15px]' } as const;

export const ActionLink: React.FC<{ to: string; variant?: Variant; size?: keyof typeof SIZE; className?: string; children: React.ReactNode; icon?: React.ReactNode }> = ({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
}) => (
  <Link to={to} className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors', VARIANT[variant], SIZE[size], className)}>
    {children}
    {icon}
  </Link>
);

export const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof SIZE }> = ({ variant = 'primary', size = 'md', className, ...rest }) => (
  <button className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50', VARIANT[variant], SIZE[size], className)} {...rest} />
);

// ============ Đầu trang ============
export interface Crumb {
  label: string;
  to?: string;
}

/** Đầu trang: breadcrumb, tiêu đề, đoạn dẫn, hàng số liệu thật, nút hành động; cột phải tuỳ chọn (ảnh / khối minh hoạ) */
export const PageHeader: React.FC<{
  crumbs: Crumb[];
  title: React.ReactNode;
  lead?: React.ReactNode;
  facts?: { value: string; label: string }[];
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}> = ({ crumbs, title, lead, facts, actions, aside, className }) => (
  <section className={cn('border-b border-slate-200 bg-white', className)}>
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
        <h1 className="mt-6 font-display text-[2.1rem] leading-[1.15] md:text-[2.8rem] font-bold tracking-tight text-slate-900 text-balance">{title}</h1>
        {lead && <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-slate-600">{lead}</p>}
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        {facts && (
          <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-slate-200 pt-6">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-[13px] text-slate-500">{f.label}</dt>
                <dd className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">{f.value}</dd>
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
export const Section: React.FC<{ muted?: boolean; className?: string; innerClassName?: string; children: React.ReactNode; id?: string }> = ({ muted, className, innerClassName, children, id }) => (
  <section id={id} className={cn(muted ? 'bg-[#F6F7F9] border-y border-slate-200' : 'bg-white', className)}>
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20', innerClassName)}>{children}</div>
  </section>
);

/** Tiêu đề khối: không nhãn viên thuốc, không tô vàng chữ; có thể kèm link "Xem tất cả" bên phải */
export const SectionHead: React.FC<{ title: React.ReactNode; desc?: React.ReactNode; action?: { label: string; to: string }; className?: string }> = ({ title, desc, action, className }) => (
  <div className={cn('mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between', className)}>
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl md:text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">{title}</h2>
      {desc && <p className="mt-2 text-slate-600 leading-relaxed">{desc}</p>}
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

/** Dải kêu gọi cuối trang: một dòng chữ + nút, nền trắng viền mảnh (không khối màu chói) */
export const CtaStrip: React.FC<{ title: string; text?: string; action: { label: string; to: string } }> = ({ title, text, action }) => (
  <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
    <div>
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      {text && <p className="mt-1 text-slate-600">{text}</p>}
    </div>
    <ActionLink to={action.to} size="lg" className="shrink-0">
      {action.label}
    </ActionLink>
  </div>
);
