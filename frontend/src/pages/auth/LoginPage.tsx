import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Button, Card, Checkbox, Divider, Input, PasswordInput, Alert } from '@/shared/components/ui';
import { pravatar } from '@/shared/components/media/Img';
import { useAuthStore, DEMO_USERS, resolveDemoRole } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { ROLE_HOME } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';

const DEMO = [
  { email: 'student@orbi.edu.vn', label: 'Học viên', img: 11, cls: 'bg-indigo-100 hover:bg-indigo-200' },
  { email: 'teacher@orbi.edu.vn', label: 'Giáo viên', img: 43, cls: 'bg-emerald-100 hover:bg-emerald-200' },
  { email: 'head@orbi.edu.vn', label: 'Trưởng BM', img: 44, cls: 'bg-amber-200 hover:bg-amber-300' },
  { email: 'admin@orbi.edu.vn', label: 'Quản trị', img: 45, cls: 'bg-violet-100 hover:bg-violet-200' },
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
        <p className="text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <Link to="/auth/register" className="font-bold text-violet-600 hover:underline underline-offset-2">
            Đăng ký miễn phí
          </Link>
        </p>
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
        <Divider label="Tài khoản demo" className="my-5" />
        <div className="grid grid-cols-2 gap-2">
          {DEMO.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setEmail(d.email);
                setPassword('OrbiLingo@2026');
                setError('');
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-y-0 ${d.cls}`}
            >
              <img src={pravatar(d.img)} alt="" className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover" />
              {d.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 text-center mt-3">Mật khẩu demo: OrbiLingo@2026</p>
      </Card>
    </div>
  );
};
