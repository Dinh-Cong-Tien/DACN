/**
 * Mở cửa sổ đăng nhập Google / Facebook và lấy access token (OAuth2 implicit qua SDK chính thức).
 * Token được gửi lên backend để xác minh — frontend không tự tin token.
 */
type GoogleTokenResponse = { access_token?: string; error?: string; error_description?: string };
declare global {
  interface Window {
    google?: { accounts: { oauth2: { initTokenClient: (cfg: { client_id: string; scope: string; callback: (r: GoogleTokenResponse) => void; error_callback?: (e: { type: string }) => void }) => { requestAccessToken: (o?: { prompt?: string }) => void } } } };
    FB?: { init: (o: { appId: string; version: string; cookie?: boolean; xfbml?: boolean }) => void; login: (cb: (r: { authResponse?: { accessToken: string } | null; status?: string }) => void, o: { scope: string }) => void };
  }
}

/** Mã lỗi để giao diện phân biệt người dùng tự đóng cửa sổ (không báo lỗi) */
export class OAuthCancelled extends Error {}

const scripts = new Map<string, Promise<void>>();
function loadScript(src: string): Promise<void> {
  if (!scripts.has(src)) {
    scripts.set(
      src,
      new Promise<void>((resolve, reject) => {
        const el = document.createElement('script');
        el.src = src;
        el.async = true;
        el.onload = () => resolve();
        el.onerror = () => {
          scripts.delete(src);
          reject(new Error('Không tải được thư viện đăng nhập. Kiểm tra kết nối mạng hoặc trình chặn quảng cáo.'));
        };
        document.head.appendChild(el);
      })
    );
  }
  return scripts.get(src)!;
}

/** Tải sẵn SDK khi trang đăng nhập mở, để cửa sổ bật lên ngay trong cú bấm (tránh bị chặn popup) */
export function preloadOAuth(cfg: { googleClientId: string | null; facebookAppId: string | null }) {
  if (cfg.googleClientId) loadScript('https://accounts.google.com/gsi/client').catch(() => undefined);
  if (cfg.facebookAppId)
    loadScript('https://connect.facebook.net/vi_VN/sdk.js')
      .then(() => window.FB?.init({ appId: cfg.facebookAppId!, version: 'v19.0', cookie: false, xfbml: false }))
      .catch(() => undefined);
}

export async function googleAccessToken(clientId: string): Promise<string> {
  await loadScript('https://accounts.google.com/gsi/client');
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (r) => (r.access_token ? resolve(r.access_token) : reject(r.error === 'access_denied' ? new OAuthCancelled() : new Error(r.error_description || 'Đăng nhập Google thất bại'))),
      error_callback: (e) => reject(e.type === 'popup_closed' ? new OAuthCancelled() : new Error(e.type === 'popup_failed_to_open' ? 'Trình duyệt đã chặn cửa sổ đăng nhập. Hãy cho phép popup rồi thử lại.' : 'Đăng nhập Google thất bại')),
    });
    client.requestAccessToken({ prompt: 'select_account' });
  });
}

export async function facebookAccessToken(appId: string): Promise<string> {
  await loadScript('https://connect.facebook.net/vi_VN/sdk.js');
  window.FB!.init({ appId, version: 'v19.0', cookie: false, xfbml: false });
  return new Promise((resolve, reject) => {
    window.FB!.login((r) => (r.authResponse?.accessToken ? resolve(r.authResponse.accessToken) : reject(new OAuthCancelled())), { scope: 'public_profile,email' });
  });
}
