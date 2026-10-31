import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { AuthHeading, TextField, SubmitButton } from './shared/AuthKit';

const RULES = [
  { label: 'Ít nhất 8 ký tự', test: (p: string) => p.length >= 8 },
  { label: 'Có chữ hoa', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Có chữ số', test: (p: string) => /[0-9]/.test(p) },
];

export const ResetPasswordPage: React.FC = () => {
  useDocumentTitle('Đặt lại mật khẩu');
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!RULES.every((r) => r.test(pw))) er.pw = 'Mật khẩu chưa đủ các điều kiện bên dưới.';
    if (confirm !== pw) er.confirm = 'Hai mật khẩu chưa khớp nhau.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Đã đổi mật khẩu', 'Đăng nhập lại bằng mật khẩu mới.');
      navigate('/auth/login');
    }, 600);
  };

  return (
    <>
      <AuthHeading title="Đặt mật khẩu mới" sub="Mật khẩu mới sẽ dùng cho cả web và ứng dụng." />
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <TextField label="Mật khẩu mới" type="password" value={pw} onChange={(e) => setPw(e.target.value)} error={errors.pw} autoComplete="new-password" autoFocus />
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
