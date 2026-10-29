import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { ROLE_HOME } from '@/shared/utils';

/** Chặn người đã đăng nhập vào trang auth → chuyển về dashboard theo role */
export const GuestGuard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  if (isAuth && user) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Outlet />;
};
