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
  as?: 'div' | 'section' | 'article';
}

export const Card: React.FC<CardProps> = ({ hover, padding = 'md', glass, className, children, as = 'div', ...rest }) => {
  const Tag = as;
  return (
    <Tag
      className={cn(
        'rounded-2xl border bg-white',
        glass ? 'glass' : 'border-slate-200/80 shadow-soft',
        { none: '', sm: 'p-4', md: 'p-5 md:p-6', lg: 'p-6 md:p-8' }[padding],
        hover && 'card-hover cursor-pointer',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export const CardHeader: React.FC<{ title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; icon?: React.ReactNode; className?: string }> = ({ title, subtitle, action, icon, className }) => (
  <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
    <div className="flex items-start gap-3 min-w-0">
      {icon && <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>}
      <div className="min-w-0">
        <h3 className="font-bold text-slate-900 text-base leading-tight">{title}</h3>
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
          <Link to={c.to} className="hover:text-indigo-600 transition font-medium">
            {c.label}
          </Link>
        ) : (
          <span className="font-semibold text-slate-800">{c.label}</span>
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
      {eyebrow && <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">{eyebrow}</span>}
      <div className="flex items-center gap-3">
        {icon && <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>}
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
      </div>
      {description && <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
  </div>
);

// ============ SECTION TITLE (marketing) ============
export const SectionTitle: React.FC<{ eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; align?: 'center' | 'left'; className?: string; dark?: boolean }> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  dark,
}) => (
  <div className={cn('space-y-3 max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left', className)}>
    {eyebrow && (
      <span className={cn('inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full', dark ? 'bg-white/10 text-indigo-200' : 'bg-indigo-50 text-indigo-600')}>{eyebrow}</span>
    )}
    <h2 className={cn('text-3xl md:text-4xl font-black tracking-tight leading-tight', dark ? 'text-white' : 'text-slate-900')}>{title}</h2>
    {description && <p className={cn('text-sm md:text-base leading-relaxed', dark ? 'text-slate-300' : 'text-slate-500')}>{description}</p>}
  </div>
);

// ============ STAT CARD ============
const statTone: Record<Tone, string> = {
  indigo: 'from-indigo-500 to-violet-500 shadow-indigo-200',
  violet: 'from-violet-500 to-fuchsia-500 shadow-violet-200',
  emerald: 'from-emerald-500 to-teal-500 shadow-emerald-200',
  amber: 'from-amber-400 to-orange-500 shadow-amber-200',
  rose: 'from-rose-500 to-pink-500 shadow-rose-200',
  sky: 'from-sky-500 to-cyan-500 shadow-sky-200',
  slate: 'from-slate-600 to-slate-800 shadow-slate-200',
  teal: 'from-teal-500 to-emerald-500 shadow-teal-200',
  orange: 'from-orange-500 to-amber-500 shadow-orange-200',
  fuchsia: 'from-fuchsia-500 to-pink-500 shadow-fuchsia-200',
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
  <Card className={cn('relative overflow-hidden group', className)} padding="sm">
    <div className={cn('absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500', statTone[tone])} />
    <div className="flex items-start justify-between gap-3 relative">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-2xl md:text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
          {typeof value === 'number' ? <CountUp value={value} format={format} /> : value}
          {suffix && <span className="text-sm font-bold text-slate-400 ml-1">{suffix}</span>}
        </p>
        {(delta !== undefined || hint) && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold">
            {delta !== undefined && (
              <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md', delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
                {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {delta >= 0 ? '+' : ''}
                {delta}%
              </span>
            )}
            <span className="text-slate-400">{deltaLabel ?? hint}</span>
          </div>
        )}
      </div>
      {icon && (
        <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shrink-0 shadow-md [&>svg]:w-5 [&>svg]:h-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6', statTone[tone])}>
          {icon}
        </div>
      )}
    </div>
  </Card>
);

// ============ EMPTY STATE ============
export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string; compact?: boolean }> = ({
  icon,
  title,
  description,
  action,
  className,
  compact,
}) => (
  <div className={cn('flex flex-col items-center justify-center text-center animate-scale-in', compact ? 'py-8' : 'py-16', className)}>
    <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 [&>svg]:w-7 [&>svg]:h-7 animate-float">{icon ?? <Inbox />}</div>
    <h3 className="font-bold text-slate-800">{title}</h3>
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

// ============ GRADIENT PANEL ============
export const GradientPanel: React.FC<React.HTMLAttributes<HTMLDivElement> & { tone?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate' | 'sky' }> = ({ tone = 'indigo', className, children, ...rest }) => {
  const g = {
    indigo: 'from-indigo-600 via-violet-600 to-indigo-700',
    emerald: 'from-emerald-600 via-teal-600 to-emerald-700',
    rose: 'from-rose-600 via-pink-600 to-rose-700',
    amber: 'from-amber-500 via-orange-500 to-amber-600',
    slate: 'from-slate-800 via-slate-900 to-slate-950',
    sky: 'from-sky-600 via-cyan-600 to-sky-700',
  }[tone];
  return (
    <div className={cn('relative overflow-hidden rounded-3xl bg-gradient-to-br text-white p-6 md:p-8 shadow-lift', g, className)} {...rest}>
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.12]" />
      <div aria-hidden className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-float-slow" />
      <div aria-hidden className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-float" />
      <div className="relative">{children}</div>
    </div>
  );
};
