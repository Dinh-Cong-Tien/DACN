import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { Button, Card } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { cn } from '@/shared/utils';

export const VerifyPage: React.FC = () => {
  useDocumentTitle('Xác thực email');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
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

  const submit = () => {
    const code = digits.join('');
    if (code.length < 6) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Xác thực thành công', 'Email của bạn đã được kích hoạt.');
      navigate('/onboarding/goal');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 animate-fade-down">
        <div className="w-16 h-16 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-hard-sm text-slate-900 flex items-center justify-center animate-float tilt-2">
          <MailCheck className="w-8 h-8" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Xác thực email</h1>
        <p className="text-sm text-slate-600">
          Nhập mã 6 số đã gửi tới <b className="text-slate-900">{user?.email || 'email của bạn'}</b>
        </p>
      </div>
      <Card hard padding="lg" className="animate-fade-up space-y-5">
        <div className={cn('flex justify-between gap-2', shake && 'animate-shake')}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              onFocus={(e) => e.target.select()}
              className={cn(
                'w-12 h-14 text-center font-display text-xl font-extrabold rounded-xl border-2 transition-all duration-200 focus:outline-none',
                d ? 'border-slate-900 bg-amber-100 text-slate-900 shadow-hard-sm -translate-y-0.5' : 'border-slate-300 text-slate-800 focus:border-slate-900'
              )}
            />
          ))}
        </div>
        <Button fullWidth size="lg" variant="gradient" loading={loading} onClick={submit} rightIcon={<ArrowRight className="w-4 h-4" />}>
          Xác nhận
        </Button>
        <div className="text-center text-xs text-slate-600">
          {countdown > 0 ? (
            <span>
              Gửi lại mã sau <b className="text-slate-900 font-mono">{countdown}s</b>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCountdown(60);
                toast.info('Đã gửi lại mã', 'Kiểm tra hộp thư (kể cả mục Spam).');
              }}
              className="inline-flex items-center gap-1 font-bold text-violet-600 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Gửi lại mã xác thực
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500 text-center">Demo: nhập bất kỳ 6 chữ số để tiếp tục.</p>
      </Card>
    </div>
  );
};
