import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../config/routes';

interface RoleGuardProps {
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const userRole = localStorage.getItem('user_role') || 'STUDENT';
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <Outlet />;
};
