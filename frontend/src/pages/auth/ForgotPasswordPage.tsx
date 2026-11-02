import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';
import { cmsApi } from '@/shared/api/cms';
import { errorMessage } from '@/shared/api/client';
import { AuthHeading, TextField, SubmitButton, textLink } from './shared/AuthKit';

/**
 * Quên mật khẩu: hệ thống chưa có dịch vụ gửi email, nên yêu cầu được lưu thành phiếu hỗ trợ ưu tiên cao.
 * Quản trị viên xác minh rồi đặt lại mật khẩu (Quản trị → Người dùng → Đặt lại mật khẩu) và phản hồi qua email.
 */
export const ForgotPasswordPage: React.FC = () => {
  useDocumentTitle('Quên mật khẩu');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.trim())) {
      setError('Email chưa đúng định dạng.');
      return;
    }
    setError('');
    setLoading(true);
    cmsApi
      .contact({ name: email.trim(), email: email.trim(), topic: 'password', subject: `Yêu cầu đặt lại mật khẩu: ${email.trim()}`, message: `Tài khoản ${email.trim()} quên mật khẩu, cần đặt lại.` })
      .then(() => setSent(true))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  if (sent) {
    return (
      <>
        <AuthHeading
          title="Đã gửi yêu cầu"
          sub={
            <>
              Yêu cầu đặt lại mật khẩu cho <b className="font-medium text-slate-900">{email.trim()}</b> đã được chuyển tới quản trị viên. Sau khi xác minh, quản trị viên sẽ gửi mật khẩu tạm về email này.
            </>
          }
        />
        <ul className="mb-6 space-y-1.5 text-[14px] text-slate-600">
          <li>· Đăng nhập bằng mật khẩu tạm rồi đổi mật khẩu trong Cài đặt.</li>
          <li>· Cần gấp? Gọi hotline hoặc nhắn khung chat hỗ trợ.</li>
        </ul>
        <Link to="/auth/login" className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-[15px] font-semibold text-white hover:bg-indigo-700">
          Quay lại đăng nhập
        </Link>
        <p className="mt-5 text-sm text-slate-600">
          Nhập sai email?{' '}
          <button type="button" onClick={() => setSent(false)} className={textLink}>
            Nhập lại
          </button>
        </p>
      </>
    );
  }

  return (
    <>
      <AuthHeading title="Quên mật khẩu" sub="Nhập email bạn dùng để đăng ký. Quản trị viên sẽ xác minh và gửi mật khẩu tạm cho bạn." />
      <form onSubmit={submit} className="space-y-5" noValidate>
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} placeholder="ban@email.com" autoComplete="email" autoFocus />
        <SubmitButton loading={loading}>Gửi yêu cầu</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        Nhớ ra rồi?{' '}
        <Link to="/auth/login" className={textLink}>
          Quay lại đăng nhập
        </Link>
      </p>
    </>
  );
};
