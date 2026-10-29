import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import type { AppRole } from '@/shared/types';
import { ROLE_HOME } from '@/shared/utils';

const RANK: Record<AppRole, number> = { GUEST: 0, STUDENT: 1, TEACHER: 2, HEAD_TEACHER: 3, ADMIN: 4 };

interface RoleGuardProps {
  /** Vai trò tối thiểu (phân cấp GUEST < STUDENT < TEACHER < HEAD_TEACHER < ADMIN) */
  minRole: AppRole;
  /** Nếu true chỉ cho phép đúng role này (không phân cấp) */
  exact?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ minRole, exact }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/auth/login" replace />;
  const ok = exact ? user.role === minRole : RANK[user.role] >= RANK[minRole];
  if (!ok) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Outlet />;
};
