import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, ArrowRight } from 'lucide-react';
import { Button, Card, Checkbox, Input, PasswordInput, ProgressBar, Alert } from '@/shared/components/ui';
import { useAuthStore, DEMO_USERS } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';

function strength(pw: string): { score: number; label: string; tone: 'rose' | 'amber' | 'emerald' | 'indigo' } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (!pw) return { score: 0, label: '', tone: 'rose' };
  if (s <= 1) return { score: 25, label: 'Yếu', tone: 'rose' };
  if (s === 2) return { score: 50, label: 'Trung bình', tone: 'amber' };
  if (s === 3) return { score: 75, label: 'Khá', tone: 'emerald' };
  return { score: 100, label: 'Mạnh', tone: 'indigo' };
}

export const RegisterPage: React.FC = () => {
  useDocumentTitle('Đăng ký');
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const st = useMemo(() => strength(form.password), [form.password]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = 'Vui lòng nhập họ tên';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Email không hợp lệ';
    if (form.password.length < 8) er.password = 'Mật khẩu tối thiểu 8 ký tự';
    if (form.confirm !== form.password) er.confirm = 'Mật khẩu xác nhận không khớp';
    if (!agree) er.agree = 'Bạn cần đồng ý điều khoản sử dụng';
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setTimeout(() => {
      login({ ...DEMO_USERS.STUDENT, fullName: form.name.trim(), email: form.email.trim(), streak: 0, effortPoints: 0, target: undefined, joinedAt: new Date().toISOString() }, 'demo-jwt-token');
      setLoading(false);
      toast.success('Tạo tài khoản thành công', 'Hãy thiết lập lộ trình học của bạn.');
      navigate('/onboarding/goal');
    }, 700);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1 animate-fade-down">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tạo tài khoản miễn phí</h1>
        <p className="text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/auth/login" className="font-bold text-indigo-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
      <Card padding="lg" className="animate-fade-up">
        {errors.agree && (
          <Alert type="warning" className="mb-4">
            {errors.agree}
          </Alert>
        )}
        <form onSubmit={submit} className="space-y-4">
          <Input label="Họ và tên" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} error={errors.name} placeholder="Nguyễn Văn A" leftIcon={<User />} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} error={errors.email} placeholder="name@example.com" leftIcon={<Mail />} />
          <div className="space-y-2">
            <PasswordInput label="Mật khẩu" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} error={errors.password} placeholder="Tối thiểu 8 ký tự" />
            {form.password && (
              <div className="animate-fade-down">
                <ProgressBar value={st.score} tone={st.tone} size="xs" animate={false} />
                <p className="text-[11px] text-slate-500 mt-1">
                  Độ mạnh: <b>{st.label}</b> · nên có chữ hoa, số và ký tự đặc biệt
                </p>
              </div>
            )}
          </div>
          <PasswordInput label="Xác nhận mật khẩu" value={form.confirm} onChange={(e) => setForm((s) => ({ ...s, confirm: e.target.value }))} error={errors.confirm} placeholder="Nhập lại mật khẩu" />
          <Checkbox
            checked={agree}
            onChange={setAgree}
            label={
              <span className="text-xs">
                Tôi đồng ý với <a className="font-bold text-indigo-600 hover:underline">Điều khoản sử dụng</a> và <a className="font-bold text-indigo-600 hover:underline">Chính sách bảo mật</a>
              </span>
            }
          />
          <Button type="submit" fullWidth size="lg" variant="gradient" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />} className="shine">
            Đăng ký & thiết lập lộ trình
          </Button>
        </form>
      </Card>
    </div>
  );
};
