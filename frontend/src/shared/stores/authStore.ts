import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppRole, AppUser } from '@/shared/types';

interface AuthState {
  user: AppUser | null;
  token: string | null;
  onboardingDone: boolean;
  isAuthenticated: () => boolean;
  login: (user: AppUser, token?: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<AppUser>) => void;
  completeOnboarding: () => void;
}

export const DEMO_USERS: Record<AppRole, AppUser> = {
  GUEST: {
    id: 'guest',
    fullName: 'Khách',
    email: '',
    role: 'GUEST',
    status: 'ACTIVE',
    plan: 'FREE',
    streak: 0,
    effortPoints: 0,
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
  STUDENT: {
    id: 'u-student-1',
    fullName: 'Nguyễn Minh Anh',
    email: 'student@orbi.edu.vn',
    role: 'STUDENT',
    status: 'ACTIVE',
    plan: 'FREE',
    target: { examType: 'TOEIC', score: '750', examDate: '2026-12-20' },
    streak: 12,
    effortPoints: 2480,
    joinedAt: '2026-08-15T08:00:00.000Z',
    lastActiveAt: new Date().toISOString(),
  },
  TEACHER: {
    id: 'u-teacher-1',
    fullName: 'Trần Thu Hà',
    email: 'teacher@orbi.edu.vn',
    role: 'TEACHER',
    status: 'ACTIVE',
    plan: 'VIP',
    streak: 30,
    effortPoints: 0,
    joinedAt: '2026-05-02T08:00:00.000Z',
    lastActiveAt: new Date().toISOString(),
  },
  HEAD_TEACHER: {
    id: 'u-head-1',
    fullName: 'Lê Quốc Bảo',
    email: 'head@orbi.edu.vn',
    role: 'HEAD_TEACHER',
    status: 'ACTIVE',
    plan: 'VIP',
    streak: 45,
    effortPoints: 0,
    joinedAt: '2026-03-10T08:00:00.000Z',
    lastActiveAt: new Date().toISOString(),
  },
  ADMIN: {
    id: 'u-admin-1',
    fullName: 'Phạm Quản Trị',
    email: 'admin@orbi.edu.vn',
    role: 'ADMIN',
    status: 'ACTIVE',
    plan: 'VIP',
    streak: 0,
    effortPoints: 0,
    joinedAt: '2026-01-01T08:00:00.000Z',
    lastActiveAt: new Date().toISOString(),
  },
};

export function resolveDemoRole(email: string): AppRole {
  const e = email.toLowerCase();
  if (e.startsWith('admin')) return 'ADMIN';
  if (e.startsWith('head')) return 'HEAD_TEACHER';
  if (e.startsWith('teacher')) return 'TEACHER';
  return 'STUDENT';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      onboardingDone: false,
      isAuthenticated: () => Boolean(get().token && get().user),
      login: (user, token = 'demo-jwt-token') => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_role', user.role);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        set({ user: null, token: null, onboardingDone: false });
      },
      updateUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      completeOnboarding: () => set({ onboardingDone: true }),
    }),
    { name: 'orbi-auth' }
  )
);
