import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, DEMO_USERS } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { AuthHeading, TextField, SubmitButton, OrDivider, SocialButtons, textLink } from './shared/AuthKit';

/** Độ mạnh mật khẩu 0–4: đủ 8 ký tự, chữ hoa, chữ số, ký tự đặc biệt */
function strength(pw: string) {
  const s = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  return { s, label: ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][s], color: ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'][s] };
}

export const RegisterPage: React.FC = () => {
  useDocumentTitle('Đăng ký');
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const st = useMemo(() => strength(form.password), [form.password]);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = 'Nhập họ và tên của bạn.';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(form.email.trim())) er.email = 'Email chưa đúng định dạng.';
    if (form.password.length < 8) er.password = 'Mật khẩu cần ít nhất 8 ký tự.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setTimeout(() => {
      login({ ...DEMO_USERS.STUDENT, fullName: form.name.trim(), email: form.email.trim(), streak: 0, effortPoints: 0, target: undefined, joinedAt: new Date().toISOString() }, 'demo-jwt-token');
      setLoading(false);
      toast.success('Đã tạo tài khoản', 'Làm bài xếp lớp để nhận lộ trình nhé.');
      navigate('/onboarding/goal');
    }, 700);
  };

  return (
    <>
      <AuthHeading title="Tạo tài khoản" sub="Miễn phí, không cần thẻ thanh toán." />
      <SocialButtons onDone={() => navigate('/onboarding/goal')} />
      <OrDivider label="hoặc đăng ký bằng email" />
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="Họ và tên" value={form.name} onChange={set('name')} error={errors.name} placeholder="Nguyễn Minh Anh" autoComplete="name" autoFocus />
        <TextField label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="ban@email.com" autoComplete="email" />
        <div>
          <TextField label="Mật khẩu" type="password" value={form.password} onChange={set('password')} error={errors.password} hint={form.password ? undefined : 'Ít nhất 8 ký tự, nên có chữ hoa và chữ số.'} autoComplete="new-password" />
          {form.password && !errors.password && (
            <div className="mt-2 flex items-center gap-3">
              <div className="grid flex-1 grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={cn('h-1 rounded-full transition-colors', i <= st.s ? st.color : 'bg-slate-200')} />
                ))}
              </div>
              <span className="w-[72px] text-right text-[12px] text-slate-500">{st.label}</span>
            </div>
          )}
        </div>
        <div className="pt-1">
          <SubmitButton loading={loading}>Tạo tài khoản</SubmitButton>
        </div>
      </form>
      <p className="mt-5 text-[13px] leading-relaxed text-slate-500">
        Khi đăng ký, bạn đồng ý với{' '}
        <Link to="/help" className="text-slate-700 underline underline-offset-2 hover:text-slate-900">
          Điều khoản sử dụng
        </Link>{' '}
        và{' '}
        <Link to="/help" className="text-slate-700 underline underline-offset-2 hover:text-slate-900">
          Chính sách bảo mật
        </Link>{' '}
        của OrbiLingo.
      </p>
      <p className="mt-6 text-sm text-slate-600 lg:hidden">
        Đã có tài khoản?{' '}
        <Link to="/auth/login" className={textLink}>
          Đăng nhập
        </Link>
      </p>
    </>
  );
};
