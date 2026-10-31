import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';

/** Chỉ cho phép người dùng đã đăng nhập */
export const AuthGuard: React.FC = () => {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const location = useLocation();
  if (!isAuth) return <Navigate to="/auth/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
};
