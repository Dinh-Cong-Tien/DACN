import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppUser } from '@/shared/types';
import { authApi } from '@/shared/api/auth';
import { setSessionExpiredHandler, tokenStore } from '@/shared/api/client';

interface AuthState {
  user: AppUser | null;
  token: string | null;
  onboardingDone: boolean;
  isAuthenticated: () => boolean;
  /** Lưu phiên sau khi authApi.login/register thành công (token đã nằm trong tokenStore) */
  login: (user: AppUser) => void;
  logout: () => void;
  updateUser: (patch: Partial<AppUser>) => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      onboardingDone: false,
      isAuthenticated: () => Boolean(get().token && get().user),
      login: (user) => set({ user, token: tokenStore.get()?.accessToken ?? null }),
      logout: () => {
        void authApi.logout();
        set({ user: null, token: null, onboardingDone: false });
      },
      updateUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      completeOnboarding: () => set({ onboardingDone: true }),
    }),
    { name: 'orbi-auth' }
  )
);

// Refresh token hết hạn / bị thu hồi → xoá phiên trên giao diện
setSessionExpiredHandler(() => useAuthStore.setState({ user: null, token: null }));

// Khởi động: phiên cũ không có token thật (bản demo trước) → xoá; có token → đồng bộ hồ sơ từ /auth/me
if (typeof window !== 'undefined') {
  const st = useAuthStore.getState();
  if (st.user && !tokenStore.get()) useAuthStore.setState({ user: null, token: null });
  else if (tokenStore.get()) authApi.me().then((user) => useAuthStore.setState({ user, token: tokenStore.get()?.accessToken ?? null })).catch(() => undefined);
}
