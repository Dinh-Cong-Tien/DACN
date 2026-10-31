import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';
import { AuthHeading, TextField, SubmitButton, textLink } from './shared/AuthKit';

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
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  if (sent) {
    return (
      <>
        <AuthHeading
          title="Kiểm tra hộp thư"
          sub={
            <>
              Nếu <b className="font-medium text-slate-900">{email.trim()}</b> đã đăng ký OrbiLingo, bạn sẽ nhận được email có liên kết đặt lại mật khẩu trong vài phút. Liên kết có hiệu lực 30 phút.
            </>
          }
        />
        <ul className="mb-6 space-y-1.5 text-[14px] text-slate-600">
          <li>· Không thấy email? Xem thêm mục Spam hoặc Quảng cáo.</li>
          <li>· Email gửi từ địa chỉ no-reply@orbilingo.vn.</li>
        </ul>
        <Link to="/auth/reset-password" className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-[15px] font-semibold text-white hover:bg-indigo-700">
          Mở liên kết trong email (demo)
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
      <AuthHeading title="Quên mật khẩu" sub="Nhập email bạn dùng để đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu." />
      <form onSubmit={submit} className="space-y-5" noValidate>
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} placeholder="ban@email.com" autoComplete="email" autoFocus />
        <SubmitButton loading={loading}>Gửi liên kết</SubmitButton>
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
