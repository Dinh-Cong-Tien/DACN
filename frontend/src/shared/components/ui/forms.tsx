import React, { useId } from 'react';
import { Search, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/utils';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export const Field: React.FC<FieldProps> = ({ label, hint, error, required, className, children, htmlFor }) => (
  <div className={cn('space-y-1.5', className)}>
    {label && (
      <label htmlFor={htmlFor} className="block text-xs font-bold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    {children}
    {error ? <p className="text-[11px] font-semibold text-rose-600 animate-fade-down">{error}</p> : hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
  </div>
);

const baseInput =
  'w-full rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 disabled:bg-slate-50 disabled:text-slate-400';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({ label, hint, error, leftIcon, rightIcon, inputSize = 'md', className, required, id, ...rest }) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const h = { sm: 'h-9 text-xs', md: 'h-11', lg: 'h-12' }[inputSize];
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      <div className="relative">
        {leftIcon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none [&>svg]:w-4 [&>svg]:h-4">{leftIcon}</span>}
        <input
          id={inputId}
          className={cn(baseInput, h, leftIcon ? 'pl-10' : 'pl-4', rightIcon ? 'pr-10' : 'pr-4', error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10', className)}
          {...rest}
        />
        {rightIcon && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 [&>svg]:w-4 [&>svg]:h-4">{rightIcon}</span>}
      </div>
    </Field>
  );
};

export const PasswordInput: React.FC<Omit<InputProps, 'type' | 'rightIcon'>> = (props) => {
  const [show, setShow] = React.useState(false);
  return (
    <Input
      {...props}
      type={show ? 'text' : 'password'}
      rightIcon={
        <button type="button" onClick={() => setShow((s) => !s)} className="hover:text-slate-700 transition pointer-events-auto" aria-label="Hiện/ẩn mật khẩu">
          {show ? <EyeOff /> : <Eye />}
        </button>
      }
    />
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, hint, error, className, required, id, ...rest }) => {
  const autoId = useId();
  const tid = id ?? autoId;
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={tid}>
      <textarea id={tid} className={cn(baseInput, 'p-4 min-h-[110px] resize-y leading-relaxed', error && 'border-rose-300', className)} {...rest} />
    </Field>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** `group` → các lựa chọn cùng nhóm hiện trong <optgroup> */
  options: { value: string; label: string; group?: string }[];
  placeholder?: string;
  inputSize?: 'sm' | 'md';
}

export const Select: React.FC<SelectProps> = ({ label, hint, error, options, placeholder, className, required, inputSize = 'md', id, ...rest }) => {
  const autoId = useId();
  const sid = id ?? autoId;
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={sid}>
      <div className="relative">
        <select id={sid} className={cn(baseInput, inputSize === 'sm' ? 'h-9 text-xs' : 'h-11', 'pl-4 pr-10 appearance-none cursor-pointer', className)} {...rest}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.some((o) => o.group)
            ? [...new Set(options.map((o) => o.group ?? ''))].map((g) => (
                <optgroup key={g || '_'} label={g}>
                  {options
                    .filter((o) => (o.group ?? '') === g)
                    .map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                </optgroup>
              ))
            : options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </Field>
  );
};

export const SearchInput: React.FC<InputProps> = ({ placeholder = 'Tìm kiếm...', className, ...rest }) => (
  <Input leftIcon={<Search />} placeholder={placeholder} className={className} {...rest} />
);

export const Checkbox: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: React.ReactNode; className?: string }> = ({ checked, onChange, label, className }) => (
  <label className={cn('inline-flex items-center gap-2.5 cursor-pointer select-none group', className)}>
    <span
      onClick={() => onChange(!checked)}
      className={cn(
        'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
        checked ? 'bg-indigo-600 border-indigo-600 scale-100' : 'border-slate-300 bg-white group-hover:border-indigo-400'
      )}
    >
      <svg viewBox="0 0 16 16" className={cn('w-3 h-3 text-white transition-transform duration-200', checked ? 'scale-100' : 'scale-0')} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8.5l3 3 7-7" />
      </svg>
    </span>
    {label && <span className="text-sm text-slate-700">{label}</span>}
  </label>
);

export const RadioCard: React.FC<{
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}> = ({ selected, onSelect, title, description, icon, className, badge }) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      'relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ease-spring group',
      selected ? 'border-slate-900 bg-white shadow-card' : 'border-slate-200 bg-white hover:border-slate-400 hover:-translate-y-0.5',
      className
    )}
  >
    <div className="flex items-start gap-3">
      {icon && (
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 [&>svg]:w-5 [&>svg]:h-5',
            selected ? 'bg-indigo-600 text-white scale-105' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-700'
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-slate-900">{title}</p>
          {badge}
        </div>
        {description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <span className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all', selected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300')}>
        <span className={cn('w-2 h-2 rounded-full bg-white transition-transform', selected ? 'scale-100' : 'scale-0')} />
      </span>
    </div>
  </button>
);
