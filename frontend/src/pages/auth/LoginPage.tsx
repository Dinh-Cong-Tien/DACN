import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, UserPlus } from 'lucide-react';
import { Button, Card, Checkbox, Divider, Input, PasswordInput, Alert } from '@/shared/components/ui';
import { useAuthStore, DEMO_USERS, resolveDemoRole } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { ROLE_HOME } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';

export const LoginPage: React.FC = () => {
  useDocumentTitle('Đăng nhập');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      const role = resolveDemoRole(email);
      const user = { ...DEMO_USERS[role], email: email.trim() };
      login(user, 'demo-jwt-token');
      setLoading(false);
      toast.success(`Xin chào, ${user.fullName}!`, 'Đăng nhập thành công.');
      // Ưu tiên đích đến được ghi nhớ (?next= từ trang công khai hoặc state.from từ AuthGuard)
      const next = new URLSearchParams(location.search).get('next');
      const from = next ?? (location.state as { from?: string } | null)?.from;
      navigate(from && from.startsWith('/') ? from : ROLE_HOME[role]);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 animate-fade-down">
        <span className="sticker tilt-1 !bg-amber-300">Chào mừng trở lại</span>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Đăng nhập</h1>
        <p className="text-sm text-slate-600">Tiếp tục lộ trình học của bạn.</p>
      </div>
      <Card hard padding="lg" className="animate-fade-up">
        {error && (
          <Alert type="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" leftIcon={<Mail />} autoComplete="email" />
          <PasswordInput label="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          <div className="flex items-center justify-between">
            <Checkbox checked={remember} onChange={setRemember} label="Ghi nhớ đăng nhập" />
            <Link to="/auth/forgot-password" className="text-xs font-bold text-slate-600 hover:text-violet-600">
              Quên mật khẩu?
            </Link>
          </div>
          <Button type="submit" fullWidth size="lg" variant="gradient" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Đăng nhập
          </Button>
        </form>
        <Divider label="Chưa có tài khoản?" className="my-5" />
        <Button to="/auth/register" fullWidth size="lg" variant="outline" leftIcon={<UserPlus className="w-4 h-4" />}>
          Đăng ký tài khoản mới
        </Button>
      </Card>
    </div>
  );
};
