import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/shared/components/ui';
import { useAuthStore } from '@/shared/stores/authStore';
import { authApi } from '@/shared/api/auth';
import { errorMessage } from '@/shared/api/client';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';
import { AuthHeading, TextField, SubmitButton, FormError, OrDivider, SocialButtons, useAfterLogin, textLink } from './shared/AuthKit';

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
    authApi
      .login(email.trim(), password)
      .then(({ user }) => {
        login(user);
        toast.success(`Xin chào, ${user.fullName}!`, 'Đăng nhập thành công.');
        afterLogin(user.role);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <AuthHeading title="Đăng nhập" sub="Tiếp tục lộ trình bạn đang học." />
      <SocialButtons />
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
      <p className="mt-8 text-sm text-slate-600 lg:hidden">
        Chưa có tài khoản?{' '}
        <Link to="/auth/register" className={textLink}>
          Đăng ký miễn phí
        </Link>
      </p>
    </>
  );
};
