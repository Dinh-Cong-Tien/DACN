import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResolvedTheme, ThemeMode } from '@/shared/types';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

/** Lưu lựa chọn chế độ màu (key 'orbi-theme' — index.html đọc key này để gắn class trước khi vẽ, tránh nháy trắng) */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'orbi-theme' }
  )
);

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Chế độ màu thực tế đang áp dụng (đã quy 'system' về sáng/tối theo hệ điều hành) */
export function useResolvedTheme(): ResolvedTheme {
  const mode = useThemeStore((s) => s.mode);
  const [systemDark, setSystemDark] = useState(() => typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
}

/** Gắn class `dark` + color-scheme lên <html> theo chế độ màu; đặt một lần ở gốc ứng dụng */
export function useApplyTheme() {
  const theme = useResolvedTheme();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0B0F1C' : '#FAF7F1');
  }, [theme]);
}
