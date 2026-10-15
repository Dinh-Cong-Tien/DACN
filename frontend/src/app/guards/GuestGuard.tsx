import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../config/routes';

export const GuestGuard: React.FC = () => {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'));
  if (isAuthenticated) {
    return <Navigate to={ROUTES.STUDENT.DASHBOARD} replace />;
  }
  return <Outlet />;
};
