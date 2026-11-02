import type { AppUser } from '@/shared/types';
import { api, tokenStore } from './client';

type Session = { user: AppUser; accessToken: string; refreshToken: string };

const keep = (s: Session) => {
  tokenStore.set({ accessToken: s.accessToken, refreshToken: s.refreshToken });
  return s;
};

export const authApi = {
  login: (email: string, password: string) => api.post<Session>('/auth/login', { email, password }).then(keep),
  register: (fullName: string, email: string, password: string) => api.post<Session>('/auth/register', { fullName, email, password }).then(keep),
  me: () => api.get<AppUser>('/auth/me'),
  updateMe: (patch: Partial<Pick<AppUser, 'fullName' | 'avatarUrl'>> & Record<string, unknown>) => api.patch<AppUser>('/auth/me', patch),
  changePassword: (currentPassword: string, newPassword: string) => api.post<{ ok: true }>('/auth/change-password', { currentPassword, newPassword }),
  logout: async () => {
    const t = tokenStore.get();
    tokenStore.set(null);
    if (t?.refreshToken) await api.post('/auth/logout', { refreshToken: t.refreshToken }).catch(() => undefined);
  },
};
