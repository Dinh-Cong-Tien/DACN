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
  hard?: boolean; // khối nhấn: viền đậm + bóng lệch (dùng tiết chế)
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
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseMove?.(e);
    if (!hover || window.matchMedia?.('(pointer: coarse)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt(`perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-4px)`);
  };
  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e);
    setTilt(undefined);
  };
  return (
    <Tag
      className={cn(
        'rounded-3xl',
        glass ? 'glass' : hard ? cn('card-hard', cardTone[tone]) : cn('border border-slate-900/10', cardTone[tone]),
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

const chipTone: Record<Tone, string> = {
  indigo: 'bg-indigo-50 text-indigo-700',
  violet: 'bg-violet-50 text-violet-600',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-100 text-amber-800',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-700',
  slate: 'bg-slate-100 text-slate-700',
  teal: 'bg-teal-50 text-teal-700',
  orange: 'bg-orange-50 text-orange-700',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-700',
};

export const CardHeader: React.FC<{ title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; icon?: React.ReactNode; className?: string; tone?: Tone }> = ({ title, subtitle, action, icon, className, tone = 'indigo' }) => (
  <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
    <div className="flex items-start gap-3 min-w-0">
      {icon && <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5', chipTone[tone])}>{icon}</div>}
      <div className="min-w-0">
        <h3 className="font-display font-bold text-slate-900 text-lg leading-tight">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
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
  <div className={cn('flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 md:mb-10 animate-fade-down', className)}>
    <div className="space-y-2.5 min-w-0">
      {crumbs && <Breadcrumb items={crumbs} />}
      {eyebrow && <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">{eyebrow}</span>}
      <div className="flex items-center gap-3">
        {icon && <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">{icon}</div>}
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h1>
      </div>
      {description && <p className="text-base text-slate-500 max-w-2xl leading-relaxed">{description}</p>}
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
  <div className={cn('group rounded-3xl bg-white border border-slate-900/10 p-5 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-card', className)}>
    <div className="flex items-center justify-between gap-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      {icon && <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 [&>svg]:w-[18px] [&>svg]:h-[18px] transition-transform duration-300 group-hover:scale-110', chipTone[tone])}>{icon}</div>}
    </div>
    <p className="font-display text-3xl md:text-[2.4rem] font-extrabold text-slate-900 mt-3 tracking-tight leading-none">
      {typeof value === 'number' ? <CountUp value={value} format={format} /> : value}
      {suffix && <span className="font-sans text-sm font-semibold text-slate-400 ml-1.5">{suffix}</span>}
    </p>
    {(delta !== undefined || hint) && (
      <div className="flex items-center gap-2 mt-3 text-xs">
        {delta !== undefined && (
          <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-bold', delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
            {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>
        )}
        <span className="text-slate-500 truncate">{deltaLabel ?? hint}</span>
      </div>
    )}
  </div>
);

// ============ EMPTY STATE ============
export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string; compact?: boolean }> = ({ icon, title, description, action, className, compact }) => (
  <div className={cn('flex flex-col items-center justify-center text-center animate-scale-in', compact ? 'py-8' : 'py-16', className)}>
    <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 [&>svg]:w-7 [&>svg]:h-7 animate-float">{icon ?? <Inbox />}</div>
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
    <div className={cn('relative overflow-hidden rounded-3xl p-6 md:p-8', g, className)} {...rest}>
      <div aria-hidden className="absolute inset-0 bg-dots opacity-15" />
      <div aria-hidden className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[18px] border-white/10" />
      <div aria-hidden className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/10" />
      <div className="relative">{children}</div>
    </div>
  );
};
