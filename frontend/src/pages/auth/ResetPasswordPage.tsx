import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { authApi } from '@/shared/api/auth';
import { errorMessage } from '@/shared/api/client';
import { cn } from '@/shared/utils';
import { AuthHeading, TextField, SubmitButton, textLink } from './shared/AuthKit';

const RULES = [
  { label: 'Ít nhất 8 ký tự', test: (p: string) => p.length >= 8 },
  { label: 'Có chữ hoa', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Có chữ số', test: (p: string) => /[0-9]/.test(p) },
];

/**
 * Đặt mật khẩu mới sau khi đăng nhập bằng mật khẩu tạm (quản trị viên cấp) — gọi /auth/change-password.
 * Chưa đăng nhập thì hướng sang trang Quên mật khẩu (chưa có liên kết đặt lại qua email).
 */
export const ResetPasswordPage: React.FC = () => {
  useDocumentTitle('Đặt lại mật khẩu');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <>
        <AuthHeading title="Đặt mật khẩu mới" sub="Đăng nhập bằng mật khẩu tạm quản trị viên gửi cho bạn, sau đó đặt mật khẩu mới tại đây." />
        <Link to="/auth/login" className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-[15px] font-semibold text-white hover:bg-indigo-700">
          Đăng nhập
        </Link>
        <p className="mt-6 text-sm text-slate-600">
          Chưa có mật khẩu tạm?{' '}
          <Link to="/auth/forgot-password" className={textLink}>
            Gửi yêu cầu đặt lại
          </Link>
        </p>
      </>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!current) er.current = 'Nhập mật khẩu hiện tại (hoặc mật khẩu tạm).';
    if (!RULES.every((r) => r.test(pw))) er.pw = 'Mật khẩu chưa đủ các điều kiện bên dưới.';
    if (confirm !== pw) er.confirm = 'Hai mật khẩu chưa khớp nhau.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    authApi
      .changePassword(current, pw)
      .then(() => {
        toast.success('Đã đổi mật khẩu', 'Đăng nhập lại bằng mật khẩu mới.');
        logout();
        navigate('/auth/login');
      })
      .catch((err) => setErrors({ current: errorMessage(err) }))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <AuthHeading title="Đặt mật khẩu mới" sub={`Tài khoản ${user.email}. Sau khi lưu, bạn cần đăng nhập lại.`} />
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="Mật khẩu hiện tại / mật khẩu tạm" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} error={errors.current} autoComplete="current-password" autoFocus />
        <div>
          <TextField label="Mật khẩu mới" type="password" value={pw} onChange={(e) => setPw(e.target.value)} error={errors.pw} autoComplete="new-password" />
          <ul className="mt-2.5 space-y-1">
            {RULES.map((r) => {
              const ok = r.test(pw);
              return (
                <li key={r.label} className={cn('flex items-center gap-2 text-[13px] transition-colors', ok ? 'text-emerald-700' : 'text-slate-500')}>
                  <span className={cn('flex h-3.5 w-3.5 items-center justify-center rounded-full border', ok ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300')}>{ok && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}</span>
                  {r.label}
                </li>
              );
            })}
          </ul>
        </div>
        <TextField label="Nhập lại mật khẩu mới" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} autoComplete="new-password" />
        <div className="pt-1">
          <SubmitButton loading={loading}>Lưu mật khẩu mới</SubmitButton>
        </div>
      </form>
    </>
  );
};
