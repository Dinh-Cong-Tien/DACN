import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, GraduationCap, UserCog, ShieldCheck, BookUser } from 'lucide-react';
import { Button, Card, Checkbox, Divider, Input, PasswordInput, Alert } from '@/shared/components/ui';
import { useAuthStore, DEMO_USERS, resolveDemoRole } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { ROLE_HOME } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';

const DEMO = [
  { email: 'student@orbi.edu.vn', label: 'Học viên', icon: GraduationCap, cls: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
  { email: 'teacher@orbi.edu.vn', label: 'Giáo viên', icon: BookUser, cls: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { email: 'head@orbi.edu.vn', label: 'Trưởng BM', icon: UserCog, cls: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { email: 'admin@orbi.edu.vn', label: 'Quản trị', icon: ShieldCheck, cls: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
];

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
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from.startsWith('/') ? from : ROLE_HOME[role]);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1 animate-fade-down">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đăng nhập tài khoản</h1>
        <p className="text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/auth/register" className="font-bold text-indigo-600 hover:underline">
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
      <Card padding="lg" className="animate-fade-up">
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
            <Link to="/auth/forgot-password" className="text-xs font-semibold text-indigo-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <Button type="submit" fullWidth size="lg" variant="gradient" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />} className="shine">
            Đăng nhập
          </Button>
        </form>
        <Divider label="Tài khoản demo" className="my-5" />
        <div className="grid grid-cols-2 gap-2">
          {DEMO.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setPassword('OrbiLingo@2026');
                  setError('');
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${d.cls}`}
              >
                <Icon className="w-4 h-4" /> {d.label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-3">Mật khẩu demo: OrbiLingo@2026</p>
      </Card>
    </div>
  );
};
