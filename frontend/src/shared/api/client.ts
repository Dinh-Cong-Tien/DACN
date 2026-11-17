import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { AppUser } from '@/shared/types';

/**
 * HTTP client gọi backend `/api/v1` (Vite proxy → Express cổng 5000).
 * - Gắn access token (JWT 15 phút).
 * - Gặp 401 thì tự gọi /auth/refresh một lần (refresh token xoay vòng), rồi gửi lại request.
 * - Bóc `{ data }` → trả thẳng data; lỗi chuẩn hoá thành ApiError.
 */

export interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

const TOKENS_KEY = 'orbi-tokens';
type Tokens = { accessToken: string; refreshToken: string };

export const tokenStore = {
  get(): Tokens | null {
    try {
      const raw = localStorage.getItem(TOKENS_KEY);
      return raw ? (JSON.parse(raw) as Tokens) : null;
    } catch {
      return null;
    }
  },
  set(t: Tokens | null) {
    try {
      if (t) localStorage.setItem(TOKENS_KEY, JSON.stringify(t));
      else localStorage.removeItem(TOKENS_KEY);
    } catch {
      /* private mode */
    }
  },
};

/** Gọi khi refresh thất bại (phiên hết hạn, tài khoản bị khoá/xoá) — authStore đăng ký để tự đăng xuất, kèm lý do. */
let onSessionExpired: ((reason?: string) => void) | null = null;
export const setSessionExpiredHandler = (fn: (reason?: string) => void) => {
  onSessionExpired = fn;
};
/** Gọi khi refresh thành công — đồng bộ hồ sơ/vai trò mới nhất (vd admin vừa đổi vai trò) */
let onUserRefreshed: ((user: AppUser) => void) | null = null;
export const setUserRefreshedHandler = (fn: (user: AppUser) => void) => {
  onUserRefreshed = fn;
};

const getBaseUrl = () => {
  const envApi = import.meta.env.VITE_API_BASE_URL;
  if (!envApi) return '/api/v1';
  const clean = envApi.replace(/\/+$/, '');
  return clean.endsWith('/v1') ? clean : `${clean}/v1`;
};

export const API_BASE_URL = getBaseUrl();

export const http = axios.create({ baseURL: API_BASE_URL, timeout: 30_000 });

http.interceptors.request.use((cfg) => {
  const t = tokenStore.get();
  if (t?.accessToken) cfg.headers.Authorization = `Bearer ${t.accessToken}`;
  return cfg;
});

let refreshing: Promise<string | null> | null = null;
/** Các route xác thực không tự làm mới phiên khi gặp 401 (sai mật khẩu, refresh hỏng…) */
const NO_REFRESH = /^\/auth\/(login|register|refresh|logout)/;

async function refreshAccessToken(): Promise<string | null> {
  const t = tokenStore.get();
  if (!t?.refreshToken) return null;
  try {
    const res = await axios.post<{ data: Tokens & { user: AppUser } }>(`${API_BASE_URL}/auth/refresh`, { refreshToken: t.refreshToken });
    tokenStore.set({ accessToken: res.data.data.accessToken, refreshToken: res.data.data.refreshToken });
    onUserRefreshed?.(res.data.data.user);
    return res.data.data.accessToken;
  } catch (e) {
    tokenStore.set(null);
    const msg = axios.isAxiosError<ApiErrorBody>(e) ? e.response?.data?.error?.message : undefined;
    onSessionExpired?.(msg);
    return null;
  }
}

http.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<ApiErrorBody>) => {
    const cfg = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (err.response?.status === 401 && cfg && !cfg._retry && !NO_REFRESH.test(cfg.url ?? '')) {
      cfg._retry = true;
      refreshing ??= refreshAccessToken().finally(() => (refreshing = null));
      const token = await refreshing;
      if (token) {
        cfg.headers = { ...(cfg.headers ?? {}), Authorization: `Bearer ${token}` };
        return http.request(cfg);
      }
    }
    const body = err.response?.data?.error;
    const message = body?.message ?? (err.code === 'ERR_NETWORK' ? 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa.' : err.message);
    return Promise.reject(new ApiError(err.response?.status ?? 0, body?.code ?? 'NETWORK', message, body?.details));
  }
);

/** Helper gọn: trả về phần `data` của response. */
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) => http.get<{ data: T }>(url, { params }).then((r) => r.data.data),
  post: <T>(url: string, body?: unknown) => http.post<{ data: T }>(url, body).then((r) => r.data.data),
  put: <T>(url: string, body?: unknown) => http.put<{ data: T }>(url, body).then((r) => r.data.data),
  patch: <T>(url: string, body?: unknown) => http.patch<{ data: T }>(url, body).then((r) => r.data.data),
  delete: <T>(url: string) => http.delete<{ data: T }>(url).then((r) => r.data.data),
};

export const errorMessage = (e: unknown) => (e instanceof ApiError || e instanceof Error ? e.message : 'Đã có lỗi xảy ra');
