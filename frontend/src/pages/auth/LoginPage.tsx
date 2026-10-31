import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/shared/components/ui';
import { useAuthStore, DEMO_USERS, resolveDemoRole } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';
import type { AppRole } from '@/shared/types';
import { AuthHeading, TextField, SubmitButton, FormError, OrDivider, SocialButtons, useAfterLogin, textLink } from './shared/AuthKit';

/** Tài khoản demo: role suy từ tiền tố email (resolveDemoRole), mật khẩu bất kỳ */
const DEMO_ROLES: [AppRole, string][] = [
  ['STUDENT', 'Học viên'],
  ['TEACHER', 'Giáo viên'],
  ['HEAD_TEACHER', 'Trưởng bộ môn'],
  ['ADMIN', 'Quản trị'],
];

export const LoginPage: React.FC = () => {
  useDocumentTitle('Đăng nhập');
  const login = useAuthStore((s) => s.login);
  const afterLogin = useAfterLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Nhập email và mật khẩu để đăng nhập.');
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
      afterLogin(role);
    }, 600);
  };

  return (
    <>
      <AuthHeading title="Đăng nhập" sub="Tiếp tục lộ trình bạn đang học." />
      <SocialButtons onDone={() => afterLogin('STUDENT')} />
      <OrDivider label="hoặc đăng nhập bằng email" />
      {error && <FormError>{error}</FormError>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@email.com" autoComplete="email" autoFocus />
        <TextField
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          labelAside={
            <Link to="/auth/forgot-password" className={`text-[13px] ${textLink}`}>
              Quên mật khẩu?
            </Link>
          }
        />
        <Checkbox checked={remember} onChange={setRemember} label="Ghi nhớ trên thiết bị này" />
        <div className="pt-1">
          <SubmitButton loading={loading}>Đăng nhập</SubmitButton>
        </div>
      </form>
      <div className="mt-8 rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-inset ring-slate-200">
        <p className="text-[13px] text-slate-600">
          <span className="font-medium text-slate-800">Tài khoản demo</span> · bấm để điền sẵn, mật khẩu bất kỳ
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {DEMO_ROLES.map(([role, label]) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setEmail(DEMO_USERS[role].email);
                setPassword('orbi2026');
                setError('');
              }}
              className={`h-8 rounded-md border px-2.5 text-[13px] transition-colors ${email === DEMO_USERS[role].email ? 'border-indigo-600 bg-white text-indigo-700' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-6 text-sm text-slate-600 lg:hidden">
        Chưa có tài khoản?{' '}
        <Link to="/auth/register" className={textLink}>
          Đăng ký miễn phí
        </Link>
      </p>
    </>
  );
};
