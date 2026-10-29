import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn, initials as toInitials } from '@/shared/utils';

// ============ BUTTON ============
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gradient' | 'soft';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  to?: string; // nếu có → render Link
  href?: string;
}

const variantCls: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 hover:shadow-lift',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
  outline: 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/40',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200',
  gradient: 'text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right shadow-md shadow-indigo-200 hover:shadow-lift',
  soft: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100',
};

const sizeCls: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[11px] gap-1 rounded-lg',
  sm: 'h-9 px-3.5 text-xs gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-sm gap-2 rounded-2xl',
  xl: 'h-14 px-8 text-base gap-2.5 rounded-2xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  rightIcon,
  fullWidth,
  className,
  children,
  to,
  href,
  disabled,
  type = 'button',
  ...rest
}) => {
  const cls = cn(
    'inline-flex items-center justify-center font-semibold whitespace-nowrap select-none transition-all duration-300 ease-spring',
    'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
    variantCls[variant],
    sizeCls[size],
    fullWidth && 'w-full',
    className
  );
  const inner = (
    <>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children && <span>{children}</span>}
      {!loading && rightIcon}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {inner}
    </button>
  );
};

export const IconButton: React.FC<ButtonProps & { label: string }> = ({ label, className, size = 'md', variant = 'ghost', children, ...rest }) => {
  const dims = { xs: 'w-7 h-7', sm: 'w-9 h-9', md: 'w-10 h-10', lg: 'w-12 h-12', xl: 'w-14 h-14' }[size];
  return (
    <Button aria-label={label} title={label} variant={variant} size={size} className={cn('!px-0 rounded-xl', dims, className)} {...rest}>
      {children}
    </Button>
  );
};

// ============ BADGE / CHIP ============
export type Tone = 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' | 'teal' | 'orange' | 'fuchsia';

const toneCls: Record<Tone, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
  violet: 'bg-violet-50 text-violet-700 border-violet-200/70',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  amber: 'bg-amber-50 text-amber-700 border-amber-200/70',
  rose: 'bg-rose-50 text-rose-700 border-rose-200/70',
  sky: 'bg-sky-50 text-sky-700 border-sky-200/70',
  slate: 'bg-slate-100 text-slate-600 border-slate-200/70',
  teal: 'bg-teal-50 text-teal-700 border-teal-200/70',
  orange: 'bg-orange-50 text-orange-700 border-orange-200/70',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/70',
};

const solidToneCls: Record<Tone, string> = {
  indigo: 'bg-indigo-600 text-white',
  violet: 'bg-violet-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  amber: 'bg-amber-500 text-amber-950',
  rose: 'bg-rose-600 text-white',
  sky: 'bg-sky-600 text-white',
  slate: 'bg-slate-700 text-white',
  teal: 'bg-teal-600 text-white',
  orange: 'bg-orange-500 text-white',
  fuchsia: 'bg-fuchsia-600 text-white',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  solid?: boolean;
  dot?: boolean;
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'indigo', solid, dot, size = 'sm', icon, className, children, ...rest }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 font-bold rounded-full border whitespace-nowrap',
      size === 'xs' && 'px-1.5 py-0.5 text-[10px]',
      size === 'sm' && 'px-2 py-0.5 text-[11px]',
      size === 'md' && 'px-2.5 py-1 text-xs',
      solid ? cn(solidToneCls[tone], 'border-transparent') : toneCls[tone],
      className
    )}
    {...rest}
  >
    {dot && <span className={cn('w-1.5 h-1.5 rounded-full', solid ? 'bg-white/80' : 'bg-current')} />}
    {icon}
    {children}
  </span>
);

export const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode; className?: string; tone?: Tone }> = ({ active, onClick, children, className, tone = 'indigo' }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap active:scale-95',
      active ? cn(solidToneCls[tone], 'border-transparent shadow-sm') : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700',
      className
    )}
  >
    {children}
  </button>
);

// ============ AVATAR ============
export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: Tone;
  className?: string;
  ring?: boolean;
  status?: 'online' | 'offline';
}

const avatarSize = { xs: 'w-6 h-6 text-[9px]', sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-xs', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' };
const avatarTones = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500', 'from-amber-400 to-orange-500', 'from-rose-500 to-pink-500', 'from-sky-500 to-cyan-500', 'from-fuchsia-500 to-purple-500'];

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className, ring, status }) => {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % avatarTones.length;
  return (
    <div className={cn('relative shrink-0', className)}>
      {src ? (
        <img src={src} alt={name} className={cn('rounded-full object-cover', avatarSize[size], ring && 'ring-2 ring-white shadow-md')} />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br text-white font-bold flex items-center justify-center select-none',
            avatarSize[size],
            avatarTones[idx],
            ring && 'ring-2 ring-white shadow-md'
          )}
        >
          {toInitials(name)}
        </div>
      )}
      {status && (
        <span className={cn('absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white', status === 'online' ? 'bg-emerald-500' : 'bg-slate-300')} />
      )}
    </div>
  );
};

export const AvatarGroup: React.FC<{ names: string[]; max?: number; size?: AvatarProps['size'] }> = ({ names, max = 4, size = 'sm' }) => (
  <div className="flex -space-x-2">
    {names.slice(0, max).map((n) => (
      <Avatar key={n} name={n} size={size} ring />
    ))}
    {names.length > max && (
      <div className={cn('rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center ring-2 ring-white', avatarSize[size])}>+{names.length - max}</div>
    )}
  </div>
);

// ============ ALERT ============
export const Alert: React.FC<{ type?: 'info' | 'success' | 'warning' | 'error'; title?: string; children?: React.ReactNode; className?: string; onClose?: () => void }> = ({
  type = 'info',
  title,
  children,
  className,
  onClose,
}) => {
  const map = {
    info: { cls: 'bg-sky-50 border-sky-200 text-sky-900', Icon: Info, icon: 'text-sky-600' },
    success: { cls: 'bg-emerald-50 border-emerald-200 text-emerald-900', Icon: CheckCircle2, icon: 'text-emerald-600' },
    warning: { cls: 'bg-amber-50 border-amber-200 text-amber-900', Icon: AlertTriangle, icon: 'text-amber-600' },
    error: { cls: 'bg-rose-50 border-rose-200 text-rose-900', Icon: AlertCircle, icon: 'text-rose-600' },
  }[type];
  const Icon = map.Icon;
  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-2xl border text-sm animate-fade-down', map.cls, className)}>
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', map.icon)} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-bold mb-0.5">{title}</p>}
        {children && <div className="text-[13px] leading-relaxed opacity-90">{children}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ============ SWITCH ============
export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string; disabled?: boolean }> = ({ checked, onChange, label, description, disabled }) => (
  <label className={cn('flex items-start gap-3 cursor-pointer select-none', disabled && 'opacity-50 pointer-events-none')}>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 mt-0.5', checked ? 'bg-indigo-600' : 'bg-slate-300')}
    >
      <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ease-spring', checked && 'translate-x-5')} />
    </button>
    {(label || description) && (
      <span className="flex-1">
        {label && <span className="block text-sm font-semibold text-slate-800">{label}</span>}
        {description && <span className="block text-xs text-slate-500 mt-0.5">{description}</span>}
      </span>
    )}
  </label>
);

// ============ DIVIDER ============
export const Divider: React.FC<{ label?: string; className?: string }> = ({ label, className }) => (
  <div className={cn('flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-slate-400', className)}>
    <span className="flex-1 h-px bg-slate-200" />
    {label && <span>{label}</span>}
    {label && <span className="flex-1 h-px bg-slate-200" />}
  </div>
);

// ============ KBD ============
export const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 rounded-md border border-slate-300 bg-slate-50 text-[10px] font-bold text-slate-600 shadow-[0_1px_0_rgba(0,0,0,0.08)]">{children}</kbd>
);

// ============ LOGO ============
export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; dark?: boolean; tagline?: string; to?: string }> = ({ size = 'md', dark, tagline, to = '/' }) => {
  const dims = { sm: 'w-8 h-8 rounded-lg', md: 'w-10 h-10 rounded-xl', lg: 'w-12 h-12 rounded-2xl' }[size];
  const text = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }[size];
  return (
    <Link to={to} className="flex items-center gap-2.5 group">
      <div className={cn('bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200/60 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105', dims)}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[55%] h-[55%]" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      </div>
      <div className="leading-tight">
        <span className={cn('font-extrabold tracking-tight', text, dark ? 'text-white' : 'text-gradient')}>OrbiLingo</span>
        {tagline && <span className={cn('block text-[10px] font-medium', dark ? 'text-slate-400' : 'text-slate-400')}>{tagline}</span>}
      </div>
    </Link>
  );
};
