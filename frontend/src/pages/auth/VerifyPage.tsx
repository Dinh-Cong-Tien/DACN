import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { cn } from '@/shared/utils';
import { AuthHeading, SubmitButton, FormError, textLink } from './shared/AuthKit';

export const VerifyPage: React.FC = () => {
  useDocumentTitle('Xác thực email');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, '');
    if (!clean) {
      setDigits((d) => d.map((x, k) => (k === i ? '' : x)));
      return;
    }
    const chars = clean.split('');
    setDigits((d) => {
      const next = [...d];
      chars.forEach((c, k) => {
        if (i + k < 6) next[i + k] = c;
      });
      return next;
    });
    refs.current[Math.min(5, i + chars.length)]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.join('').length < 6) {
      setError('Nhập đủ 6 chữ số trong email.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Đã xác thực email');
      navigate('/onboarding/goal');
    }, 600);
  };

  const mm = `0:${String(countdown).padStart(2, '0')}`;

  return (
    <>
      <AuthHeading
        title="Nhập mã xác thực"
        sub={
          <>
            Mã 6 số vừa được gửi tới {user?.email ? <b className="font-medium text-slate-900">{user.email}</b> : 'email của bạn'}. Mã có hiệu lực 10 phút.
          </>
        }
      />
      {error && <FormError>{error}</FormError>}
      <form onSubmit={submit} className="space-y-6">
        <div className={cn('grid grid-cols-6 gap-2 sm:gap-2.5', shake && 'animate-shake')}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              aria-label={`Chữ số ${i + 1}`}
              maxLength={6}
              autoFocus={i === 0}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              onFocus={(e) => e.target.select()}
              className={cn(
                'h-14 w-full rounded-lg border bg-white text-center text-[1.4rem] font-semibold tabular-nums text-slate-900 transition-[border-color,box-shadow] focus:border-indigo-600 focus:outline-none focus:ring-[3px] focus:ring-indigo-600/15',
                d ? 'border-slate-400' : 'border-slate-300'
              )}
            />
          ))}
        </div>
        <SubmitButton loading={loading}>Xác nhận</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        Chưa nhận được mã?{' '}
        {countdown > 0 ? (
          <span className="tabular-nums text-slate-500">Gửi lại sau {mm}</span>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCountdown(60);
              toast.info('Đã gửi lại mã', 'Kiểm tra cả mục Spam nếu chưa thấy.');
            }}
            className={textLink}
          >
            Gửi lại mã
          </button>
        )}
      </p>
      <p className="mt-2 text-[12px] text-slate-400">Bản demo: nhập 6 chữ số bất kỳ.</p>
    </>
  );
};
