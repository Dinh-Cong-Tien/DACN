import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  paletteOpen: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  setMobileNav: (open: boolean) => void;
  setPalette: (open: boolean) => void;
  pushToast: (t: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  paletteOpen: false,
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileNav: (open) => set({ mobileNavOpen: open }),
  setPalette: (open) => set({ paletteOpen: open }),
  pushToast: (t) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = t.duration ?? 3800;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id, duration }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), duration);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Helper gọi nhanh toast ngoài component */
export const toast = {
  success: (title: string, message?: string) => useUiStore.getState().pushToast({ type: 'success', title, message }),
  error: (title: string, message?: string) => useUiStore.getState().pushToast({ type: 'error', title, message }),
  info: (title: string, message?: string) => useUiStore.getState().pushToast({ type: 'info', title, message }),
  warning: (title: string, message?: string) => useUiStore.getState().pushToast({ type: 'warning', title, message }),
};

/** Mở bảng lệnh ⌘K từ bất kỳ đâu */
export const openPalette = () => useUiStore.getState().setPalette(true);
