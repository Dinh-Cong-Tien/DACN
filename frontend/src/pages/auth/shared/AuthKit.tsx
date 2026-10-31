import React, { useId, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore, DEMO_USERS } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { cn, ROLE_HOME } from '@/shared/utils';
import type { AppRole } from '@/shared/types';

/** Điều hướng sau khi đăng nhập: ưu tiên ?next= hoặc state.from (AuthGuard), không có thì về trang chủ của role */
export function useAfterLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  return (role: AppRole) => {
    const next = new URLSearchParams(location.search).get('next');
    const from = next ?? (location.state as { from?: string } | null)?.from;
    navigate(from && from.startsWith('/') ? from : ROLE_HOME[role]);
  };
}

export const AuthHeading: React.FC<{ title: string; sub?: React.ReactNode }> = ({ title, sub }) => (
  <div className="mb-8 [@media(max-height:800px)]:mb-6">
    <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-slate-900">{title}</h1>
    {sub && <p className="mt-1.5 text-[15px] text-slate-600">{sub}</p>}
  </div>
);

const inputCls =
  'h-12 w-full rounded-lg border bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition-[border-color,box-shadow] focus:outline-none focus:ring-[3px]';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  /** Nội dung bên phải nhãn, vd. link "Quên mật khẩu?" */
  labelAside?: React.ReactNode;
  hint?: string;
  error?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ label, labelAside, hint, error, type, ...rest }) => {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={id}
          type={isPw && show ? 'text' : type}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn(inputCls, isPw && 'pr-12', error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:ring-indigo-600/15')}
          {...rest}
        />
        {isPw && (
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-slate-700">
            {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
      {(error || hint) && (
        <p id={`${id}-msg`} className={cn('mt-1.5 text-[13px]', error ? 'text-red-600' : 'text-slate-500')}>
          {error || hint}
        </p>
      )}
    </div>
  );
};

export const SubmitButton: React.FC<{ loading?: boolean; children: React.ReactNode; onClick?: () => void; type?: 'submit' | 'button' }> = ({ loading, children, onClick, type = 'submit' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 shadow-[0_1px_2px_rgba(16,24,40,0.1)] text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-indigo-600/30 disabled:cursor-wait disabled:opacity-80"
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

export const FormError: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
    {children}
  </p>
);

export const OrDivider: React.FC<{ label: string }> = ({ label }) => (
  <div className="my-6 flex items-center gap-3 text-[13px] text-slate-500 [@media(max-height:800px)]:my-4">
    <span className="h-px flex-1 bg-slate-200" />
    {label}
    <span className="h-px flex-1 bg-slate-200" />
  </div>
);

const GoogleMark = () => (
  <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
  </svg>
);

const FacebookMark = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
    <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z" />
  </svg>
);

/** Đăng nhập nhanh Google / Facebook (mock: đăng nhập tài khoản học viên demo) */
export const SocialButtons: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const login = useAuthStore((s) => s.login);
  const [busy, setBusy] = useState<'google' | 'facebook' | null>(null);
  const go = (p: 'google' | 'facebook') => {
    setBusy(p);
    setTimeout(() => {
      login(DEMO_USERS.STUDENT, 'demo-jwt-token');
      toast.success(`Xin chào, ${DEMO_USERS.STUDENT.fullName}!`, `Đã đăng nhập bằng ${p === 'google' ? 'Google' : 'Facebook'}.`);
      onDone();
    }, 700);
  };
  const btn = 'inline-flex h-12 items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-60';
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" className={btn} disabled={!!busy} onClick={() => go('google')}>
        {busy === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
        Google
      </button>
      <button type="button" className={btn} disabled={!!busy} onClick={() => go('facebook')}>
        {busy === 'facebook' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FacebookMark />}
        Facebook
      </button>
    </div>
  );
};

/** Link chữ dùng trong form xác thực */
export const textLink = 'font-medium text-indigo-700 hover:text-indigo-800 hover:underline underline-offset-2';
