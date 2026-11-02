import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { AuthHeading, textLink } from './shared/AuthKit';

/**
 * Xác thực email: tài khoản được kích hoạt ngay khi đăng ký (hệ thống chưa có dịch vụ gửi email),
 * nên trang này chỉ cho biết trạng thái thật của tài khoản thay vì nhận mã OTP giả.
 */
export const VerifyPage: React.FC = () => {
  useDocumentTitle('Xác thực email');
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <>
        <AuthHeading title="Xác thực email" sub="Đăng nhập để xem trạng thái tài khoản của bạn." />
        <Link to="/auth/login" className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-[15px] font-semibold text-white hover:bg-indigo-700">
          Đăng nhập
        </Link>
      </>
    );
  }

  return (
    <>
      <AuthHeading
        title="Tài khoản đã kích hoạt"
        sub={
          <>
            Email <b className="font-medium text-slate-900">{user.email}</b> được kích hoạt ngay khi đăng ký, bạn không cần nhập mã xác thực.
          </>
        }
      />
      <Link to={user.role === 'STUDENT' ? '/onboarding/goal' : '/'} className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-[15px] font-semibold text-white hover:bg-indigo-700">
        Tiếp tục
      </Link>
      <p className="mt-6 text-sm text-slate-600">
        Sai email?{' '}
        <Link to="/contact" className={textLink}>
          Liên hệ hỗ trợ
        </Link>
      </p>
    </>
  );
};
