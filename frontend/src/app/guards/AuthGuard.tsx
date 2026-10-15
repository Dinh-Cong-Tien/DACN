import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../config/routes';

export const AuthGuard: React.FC = () => {
  const isAuthenticated = Boolean(
    localStorage.getItem('access_token') || localStorage.getItem('token')
  );
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
};
