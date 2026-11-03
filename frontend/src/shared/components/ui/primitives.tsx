import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn, initials as toInitials } from '@/shared/utils';
import { BrandMark } from './brand-mark';

// ============ BUTTON ============
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gradient' | 'soft' | 'ink' | 'white';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  to?: string;
  href?: string;
}

// Nút 3D: màu nền + viền dưới đậm hơn, nhấn thì lún
const variantCls: Record<ButtonVariant, string> = {
  primary: 'btn-3d bg-indigo-600 border-indigo-800 text-white hover:bg-indigo-500',
  gradient: 'btn-3d bg-violet-500 border-violet-700 text-white hover:bg-violet-400',
  secondary: 'btn-3d bg-slate-900 border-slate-950 text-white hover:bg-slate-800',
  ink: 'btn-3d bg-slate-900 border-black text-amber-300 hover:bg-slate-800',
  success: 'btn-3d bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400',
  danger: 'btn-3d bg-rose-500 border-rose-700 text-white hover:bg-rose-400',
  outline: 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white active:translate-y-0.5',
  white: 'bg-white text-slate-900 border-2 border-white hover:bg-amber-100',
  ghost: 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900',
  soft: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
};

const sizeCls: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[11px] gap-1 rounded-lg',
  sm: 'h-9 px-3.5 text-xs gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-sm gap-2 rounded-2xl',
  xl: 'h-14 px-8 text-base gap-2.5 rounded-2xl',
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, fullWidth, className, children, to, href, disabled, type = 'button', ...rest }) => {
  const cls = cn(
    'group/btn inline-flex items-center justify-center font-bold whitespace-nowrap select-none transition-all duration-200 ease-spring',
    'disabled:opacity-50 disabled:pointer-events-none',
    variantCls[variant],
    sizeCls[size],
    fullWidth && 'w-full',
    className
  );
  // Icon trái/phải nhích nhẹ khi hover để gợi ý hướng hành động
  const inner = (
    <>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon ? <span className="inline-flex transition-transform duration-300 group-hover/btn:-translate-x-0.5 group-hover/btn:scale-110">{leftIcon}</span> : null}
      {children && <span>{children}</span>}
      {!loading && rightIcon && <span className="inline-flex transition-transform duration-300 group-hover/btn:translate-x-1">{rightIcon}</span>}
    </>
  );
  if (to)
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  if (href)
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
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
  indigo: 'bg-indigo-50 text-indigo-700 border-transparent',
  violet: 'bg-violet-50 text-violet-700 border-transparent',
  emerald: 'bg-emerald-50 text-emerald-700 border-transparent',
  amber: 'bg-amber-100 text-amber-800 border-transparent',
  rose: 'bg-rose-50 text-rose-700 border-transparent',
  sky: 'bg-sky-50 text-sky-700 border-transparent',
  slate: 'bg-slate-100 text-slate-600 border-transparent',
  teal: 'bg-teal-50 text-teal-700 border-transparent',
  orange: 'bg-orange-50 text-orange-700 border-transparent',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-700 border-transparent',
};

const solidToneCls: Record<Tone, string> = {
  indigo: 'bg-indigo-600 text-white',
  violet: 'bg-violet-500 text-white',
  emerald: 'bg-emerald-500 text-white',
  amber: 'bg-amber-300 text-slate-900',
  rose: 'bg-rose-500 text-white',
  sky: 'bg-sky-500 text-white',
  slate: 'bg-slate-900 text-white',
  teal: 'bg-teal-600 text-white',
  orange: 'bg-orange-500 text-white',
  fuchsia: 'bg-fuchsia-500 text-white',
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
      'inline-flex items-center gap-1 font-bold rounded-md border whitespace-nowrap',
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
      'px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap',
      active ? cn(solidToneCls[tone], 'border-transparent') : 'bg-white border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900',
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
const avatarTones = ['bg-indigo-500', 'bg-violet-500', 'bg-amber-400 text-slate-900', 'bg-sky-500', 'bg-emerald-500', 'bg-lavender-500'];

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className, ring, status }) => {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % avatarTones.length;
  const [err, setErr] = React.useState(false);
  return (
    <div className={cn('relative shrink-0', className)}>
      {src && !err ? (
        <img src={src} alt={name} onError={() => setErr(true)} className={cn('rounded-full object-cover bg-slate-200', avatarSize[size], ring && 'ring-2 ring-white shadow-md')} />
      ) : (
        <div className={cn('rounded-full text-white font-extrabold flex items-center justify-center select-none', avatarSize[size], avatarTones[idx], ring && 'ring-2 ring-white shadow-md')}>{toInitials(name)}</div>
      )}
      {status && <span className={cn('absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white', status === 'online' ? 'bg-emerald-500' : 'bg-slate-300')} />}
    </div>
  );
};

export const AvatarGroup: React.FC<{ names: string[]; srcs?: (string | undefined)[]; max?: number; size?: AvatarProps['size'] }> = ({ names, srcs, max = 4, size = 'sm' }) => (
  <div className="flex -space-x-2">
    {names.slice(0, max).map((n, i) => (
      <Avatar key={n} name={n} src={srcs?.[i]} size={size} ring />
    ))}
    {names.length > max && <div className={cn('rounded-full bg-slate-900 text-white font-bold flex items-center justify-center ring-2 ring-white', avatarSize[size])}>+{names.length - max}</div>}
  </div>
);

// ============ ALERT ============
export const Alert: React.FC<{ type?: 'info' | 'success' | 'warning' | 'error'; title?: string; children?: React.ReactNode; className?: string; onClose?: () => void }> = ({ type = 'info', title, children, className, onClose }) => {
  const map = {
    info: { cls: 'bg-sky-50 border-sky-300 text-sky-900', Icon: Info, icon: 'text-sky-600' },
    success: { cls: 'bg-emerald-50 border-emerald-300 text-emerald-900', Icon: CheckCircle2, icon: 'text-emerald-600' },
    warning: { cls: 'bg-amber-50 border-amber-300 text-amber-900', Icon: AlertTriangle, icon: 'text-amber-600' },
    error: { cls: 'bg-rose-50 border-rose-300 text-rose-900', Icon: AlertCircle, icon: 'text-rose-600' },
  }[type];
  const Icon = map.Icon;
  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-2xl border-2 text-sm animate-fade-down', map.cls, className)}>
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
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn('relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 mt-0.5', checked ? 'bg-indigo-600' : 'bg-slate-300')}>
      <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ease-spring', checked && 'translate-x-5')} />
    </button>
    {(label || description) && (
      <span className="flex-1">
        {label && <span className="block text-sm font-bold text-slate-900">{label}</span>}
        {description && <span className="block text-xs text-slate-500 mt-0.5">{description}</span>}
      </span>
    )}
  </label>
);

// ============ DIVIDER ============
export const Divider: React.FC<{ label?: string; className?: string }> = ({ label, className }) => (
  <div className={cn('flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400', className)}>
    <span className="flex-1 h-px bg-slate-300" />
    {label && <span>{label}</span>}
    {label && <span className="flex-1 h-px bg-slate-300" />}
  </div>
);

// ============ KBD ============
export const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 rounded-md border border-slate-900 bg-white text-[10px] font-bold text-slate-700 shadow-[2px_2px_0_#141A2B]">{children}</kbd>
);

// ============ LOGO ============
export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; dark?: boolean; tagline?: string; to?: string }> = ({ size = 'md', dark, tagline, to = '/' }) => {
  // Biểu tượng đứng riêng cạnh chữ (không khung), cỡ cân với chiều cao chữ
  const mark = { sm: 'h-7 w-7', md: 'h-[34px] w-[34px]', lg: 'h-10 w-10' }[size];
  const text = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }[size];
  return (
    <Link to={to} className="flex items-center gap-2" aria-label="OrbiLingo — Trang chủ">
      <BrandMark className={cn('shrink-0', mark, dark && 'brand-mark--on-dark')} />
      <div className="leading-tight">
        <span className={cn('font-display font-extrabold tracking-[-0.02em]', text, dark ? 'text-white' : 'text-slate-900')}>
          Orbi<span className={dark ? 'text-amber-300' : 'text-amber-500 dark:text-amber-300'}>Lingo</span>
        </span>
        {tagline && <span className={cn('block text-[10px] font-semibold', dark ? 'text-slate-400' : 'text-slate-500')}>{tagline}</span>}
      </div>
    </Link>
  );
};
