import React, { useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { ROLE_HOME } from '@/shared/utils';

/**
 * Chặn người đã đăng nhập vào trang auth → chuyển về dashboard theo role.
 * Chỉ áp dụng khi đã đăng nhập sẵn lúc vào trang; nếu vừa đăng nhập/đăng ký ngay tại đây
 * thì để trang tự điều hướng (?next=, state.from, /onboarding/goal) thay vì bị guard đè.
 */
export const GuestGuard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const enteredAsGuest = useRef(!isAuth);
  if (isAuth && user && !enteredAsGuest.current) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Outlet />;
};
