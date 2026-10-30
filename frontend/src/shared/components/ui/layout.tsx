import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Inbox, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/utils';
import { CountUp } from '@/shared/components/motion';
import type { Tone } from './primitives';

// ============ CARD ============
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glass?: boolean;
  hard?: boolean; // viền đậm + bóng lệch kiểu sticker
  tone?: 'white' | 'cream' | 'ink' | 'teal' | 'coral' | 'yellow' | 'sky';
  as?: 'div' | 'section' | 'article';
}

const cardTone = {
  white: 'bg-white',
  cream: 'bg-slate-50',
  ink: 'bg-slate-900 text-white',
  teal: 'bg-indigo-600 text-white',
  coral: 'bg-violet-500 text-white',
  yellow: 'bg-amber-300 text-slate-900',
  sky: 'bg-sky-100',
};

export const Card: React.FC<CardProps> = ({ hover, padding = 'md', glass, hard, tone = 'white', className, children, as = 'div', style, onMouseMove, onMouseLeave, ...rest }) => {
  const Tag = as;
  const [tilt, setTilt] = React.useState<string | undefined>();
  // Nghiêng nhẹ theo vị trí chuột khi card có hover (tối đa ~4°)
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseMove?.(e);
    if (!hover || window.matchMedia?.('(pointer: coarse)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt(`perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-4px)`);
  };
  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e);
    setTilt(undefined);
  };
  return (
    <Tag
      className={cn(
        'rounded-2xl',
        glass ? 'glass' : hard ? cn('card-hard', cardTone[tone]) : cn('border border-slate-900/10 shadow-soft', cardTone[tone]),
        { none: '', sm: 'p-4', md: 'p-5 md:p-6', lg: 'p-6 md:p-8' }[padding],
        hover && (hard ? 'card-hard-hover cursor-pointer tilt-card' : 'card-hover cursor-pointer tilt-card'),
        className
      )}
      style={tilt ? { ...style, transform: tilt } : style}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export const CardHeader: React.FC<{ title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; icon?: React.ReactNode; className?: string }> = ({ title, subtitle, action, icon, className }) => (
  <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
    <div className="flex items-start gap-3 min-w-0">
      {icon && <div className="w-10 h-10 rounded-xl bg-amber-300 border-2 border-slate-900 text-slate-900 flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>}
      <div className="min-w-0">
        <h3 className="font-display font-bold text-slate-900 text-base leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

// ============ PAGE HEADER ============
export interface Crumb {
  label: string;
  to?: string;
}

export const Breadcrumb: React.FC<{ items: Crumb[]; className?: string }> = ({ items, className }) => (
  <nav className={cn('flex items-center gap-1 text-xs text-slate-500 flex-wrap', className)}>
    {items.map((c, i) => (
      <React.Fragment key={`${c.label}-${i}`}>
        {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
        {c.to ? (
          <Link to={c.to} className="hover:text-indigo-700 transition font-semibold">
            {c.label}
          </Link>
        ) : (
          <span className="font-bold text-slate-900">{c.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

export const PageHeader: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  crumbs?: Crumb[];
  eyebrow?: string;
  className?: string;
  icon?: React.ReactNode;
}> = ({ title, description, actions, crumbs, eyebrow, className, icon }) => (
  <div className={cn('flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8 animate-fade-down', className)}>
    <div className="space-y-2 min-w-0">
      {crumbs && <Breadcrumb items={crumbs} />}
      {eyebrow && <span className="sticker tilt-3 !text-[10px] !py-1">{eyebrow}</span>}
      <div className="flex items-center gap-3">
        {icon && <div className="w-11 h-11 rounded-xl bg-violet-500 border-2 border-slate-900 shadow-hard-sm text-white flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">{icon}</div>}
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      </div>
      {description && <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
  </div>
);

// ============ SECTION TITLE (marketing) ============
export const SectionTitle: React.FC<{ eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; align?: 'center' | 'left'; className?: string; dark?: boolean }> = ({ eyebrow, title, description, align = 'center', className, dark }) => (
  <div className={cn('space-y-4 max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left', className)}>
    {eyebrow && <span className={cn('sticker', dark && '!bg-amber-300 !text-slate-900')}>{eyebrow}</span>}
    <h2 className={cn('font-display text-3xl md:text-[2.6rem] font-extrabold tracking-tight leading-[1.1] text-balance', dark ? 'text-white' : 'text-slate-900')}>{title}</h2>
    {description && <p className={cn('text-base leading-relaxed', dark ? 'text-slate-300' : 'text-slate-600')}>{description}</p>}
  </div>
);

// ============ STAT CARD ============
const statTone: Record<Tone, { bg: string; icon: string }> = {
  indigo: { bg: 'bg-indigo-100', icon: 'bg-indigo-600 text-white' },
  violet: { bg: 'bg-violet-100', icon: 'bg-violet-500 text-white' },
  emerald: { bg: 'bg-emerald-100', icon: 'bg-emerald-500 text-white' },
  amber: { bg: 'bg-amber-100', icon: 'bg-amber-300 text-slate-900' },
  rose: { bg: 'bg-rose-100', icon: 'bg-rose-500 text-white' },
  sky: { bg: 'bg-sky-100', icon: 'bg-sky-500 text-white' },
  slate: { bg: 'bg-slate-100', icon: 'bg-slate-900 text-white' },
  teal: { bg: 'bg-teal-100', icon: 'bg-teal-600 text-white' },
  orange: { bg: 'bg-orange-100', icon: 'bg-orange-500 text-white' },
  fuchsia: { bg: 'bg-fuchsia-100', icon: 'bg-fuchsia-500 text-white' },
};

export const StatCard: React.FC<{
  label: string;
  value: number | string;
  suffix?: string;
  icon?: React.ReactNode;
  tone?: Tone;
  delta?: number;
  deltaLabel?: string;
  hint?: string;
  className?: string;
  format?: (n: number) => string;
}> = ({ label, value, suffix, icon, tone = 'indigo', delta, deltaLabel, hint, className, format }) => (
  <div className={cn('relative overflow-hidden rounded-2xl border-2 border-slate-900 p-4 md:p-5 group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hard', statTone[tone].bg, className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">{label}</p>
        <p className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 mt-1.5 tracking-tight leading-none">
          {typeof value === 'number' ? <CountUp value={value} format={format} /> : value}
          {suffix && <span className="font-sans text-sm font-bold text-slate-600 ml-1">{suffix}</span>}
        </p>
        {(delta !== undefined || hint) && (
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-bold">
            {delta !== undefined && (
              <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-slate-900', delta >= 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900')}>
                {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {delta >= 0 ? '+' : ''}
                {delta}%
              </span>
            )}
            <span className="text-slate-600">{deltaLabel ?? hint}</span>
          </div>
        )}
      </div>
      {icon && (
        <div className={cn('w-11 h-11 rounded-xl border-2 border-slate-900 flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110', statTone[tone].icon)}>{icon}</div>
      )}
    </div>
  </div>
);

// ============ EMPTY STATE ============
export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string; compact?: boolean }> = ({ icon, title, description, action, className, compact }) => (
  <div className={cn('flex flex-col items-center justify-center text-center animate-scale-in', compact ? 'py-8' : 'py-16', className)}>
    <div className="w-16 h-16 rounded-2xl bg-amber-200 border-2 border-slate-900 text-slate-900 flex items-center justify-center mb-4 [&>svg]:w-7 [&>svg]:h-7 animate-float tilt-1">{icon ?? <Inbox />}</div>
    <h3 className="font-display font-bold text-slate-900">{title}</h3>
    {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ============ SKELETON ============
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => <div className={cn('skeleton h-4 w-full', className)} />;

export const SkeletonCard: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <Card className={cn('space-y-3', className)}>
    <Skeleton className="h-5 w-2/5" />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-3/5' : 'w-full')} />
    ))}
  </Card>
);

export const SkeletonGrid: React.FC<{ count?: number; cols?: string }> = ({ count = 6, cols = 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' }) => (
  <div className={cn('grid gap-4', cols)}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ============ COLOR PANEL (tên cũ GradientPanel giữ để tương thích) ============
export const GradientPanel: React.FC<React.HTMLAttributes<HTMLDivElement> & { tone?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate' | 'sky' }> = ({ tone = 'indigo', className, children, ...rest }) => {
  const g = {
    indigo: 'bg-indigo-600 text-white',
    emerald: 'bg-emerald-500 text-white',
    rose: 'bg-violet-500 text-white',
    amber: 'bg-amber-300 text-slate-900',
    slate: 'bg-slate-900 text-white',
    sky: 'bg-sky-500 text-white',
  }[tone];
  return (
    <div className={cn('relative overflow-hidden rounded-3xl border-2 border-slate-900 shadow-hard p-6 md:p-8', g, className)} {...rest}>
      <div aria-hidden className="absolute inset-0 bg-dots opacity-20" />
      <div aria-hidden className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[18px] border-white/15" />
      <div aria-hidden className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/10" />
      <div className="relative">{children}</div>
    </div>
  );
};
