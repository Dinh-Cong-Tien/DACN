/**
 * Đăng nhập một chạm (OAuth2) — Google, Facebook.
 * Trình duyệt mở cửa sổ của Google/Facebook, nhận access token rồi gửi lên đây;
 * backend tự hỏi lại Google/Facebook để xác minh token đúng là cấp cho ứng dụng của mình
 * (chống dùng token của ứng dụng khác) và lấy hồ sơ (id, email, tên, ảnh).
 */
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { badRequest, forbidden, unauthorized } from '../../core/http';

export type OAuthProvider = 'google' | 'facebook';
export interface OAuthProfile {
  provider: OAuthProvider;
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  fullName: string;
  avatarUrl: string | null;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const r = await fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export async function verifyGoogle(accessToken: string): Promise<OAuthProfile> {
  if (!env.GOOGLE_CLIENT_ID) throw badRequest('Máy chủ chưa cấu hình đăng nhập Google', 'OAUTH_NOT_CONFIGURED');
  // 1) Token phải được cấp cho đúng client ID của OrbiLingo
  const info = await getJson<{ aud?: string; azp?: string; expires_in?: string }>(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
  if (!info || (info.aud !== env.GOOGLE_CLIENT_ID && info.azp !== env.GOOGLE_CLIENT_ID)) throw unauthorized('Phiên đăng nhập Google không hợp lệ, vui lòng thử lại');
  // 2) Hồ sơ người dùng
  const u = await getJson<{ sub: string; email?: string; email_verified?: boolean; name?: string; picture?: string }>('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!u?.sub) throw unauthorized('Không đọc được thông tin tài khoản Google');
  return { provider: 'google', providerId: u.sub, email: u.email?.toLowerCase() ?? null, emailVerified: !!u.email_verified, fullName: u.name?.trim() || u.email?.split('@')[0] || 'Học viên', avatarUrl: u.picture ?? null };
}

export async function verifyFacebook(accessToken: string): Promise<OAuthProfile> {
  if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) throw badRequest('Máy chủ chưa cấu hình đăng nhập Facebook', 'OAUTH_NOT_CONFIGURED');
  const appToken = `${env.FACEBOOK_APP_ID}|${env.FACEBOOK_APP_SECRET}`;
  const dbg = await getJson<{ data?: { app_id?: string; is_valid?: boolean; user_id?: string } }>(
    `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appToken)}`
  );
  if (!dbg?.data?.is_valid || dbg.data.app_id !== env.FACEBOOK_APP_ID) throw unauthorized('Phiên đăng nhập Facebook không hợp lệ, vui lòng thử lại');
  const u = await getJson<{ id: string; name?: string; email?: string; picture?: { data?: { url?: string; is_silhouette?: boolean } } }>(
    `https://graph.facebook.com/me?fields=id,name,email,picture.width(256).height(256)&access_token=${encodeURIComponent(accessToken)}`
  );
  if (!u?.id || u.id !== dbg.data.user_id) throw unauthorized('Không đọc được thông tin tài khoản Facebook');
  const pic = u.picture?.data;
  // Facebook chỉ trả email đã xác minh
  return { provider: 'facebook', providerId: u.id, email: u.email?.toLowerCase() ?? null, emailVerified: !!u.email, fullName: u.name?.trim() || 'Học viên', avatarUrl: pic?.url && !pic.is_silhouette ? pic.url : null };
}

/**
 * Tìm hoặc tạo tài khoản cho hồ sơ OAuth:
 * 1) đã liên kết (google_id / facebook_id) → dùng luôn
 * 2) trùng email đã xác minh → liên kết vào tài khoản sẵn có (giữ nguyên mật khẩu, vai trò)
 * 3) chưa có → tạo học viên mới (không mật khẩu)
 */
export async function upsertOAuthUser(p: OAuthProfile): Promise<{ userId: string; isNew: boolean }> {
  const idField = p.provider === 'google' ? 'googleId' : 'facebookId';
  const linked = await prisma.user.findFirst({ where: { [idField]: p.providerId, deletedAt: null } });
  if (linked) {
    if (linked.status === 'LOCKED') throw forbidden(linked.lockedReason ? `Tài khoản đã bị khoá: ${linked.lockedReason}` : 'Tài khoản đã bị khoá');
    return { userId: linked.id, isNew: false };
  }
  if (!p.email) throw badRequest(`Tài khoản ${p.provider === 'google' ? 'Google' : 'Facebook'} chưa cấp quyền email. Hãy cho phép chia sẻ email hoặc đăng ký bằng email.`, 'OAUTH_NO_EMAIL');
  if (!p.emailVerified) throw badRequest('Email của tài khoản này chưa được xác minh', 'OAUTH_EMAIL_UNVERIFIED');

  const byEmail = await prisma.user.findFirst({ where: { email: p.email, deletedAt: null } });
  if (byEmail) {
    if (byEmail.status === 'LOCKED') throw forbidden(byEmail.lockedReason ? `Tài khoản đã bị khoá: ${byEmail.lockedReason}` : 'Tài khoản đã bị khoá');
    await prisma.user.update({
      where: { id: byEmail.id },
      data: { [idField]: p.providerId, emailVerifiedAt: byEmail.emailVerifiedAt ?? new Date(), avatarUrl: byEmail.avatarUrl ?? p.avatarUrl, status: byEmail.status === 'PENDING' ? 'ACTIVE' : byEmail.status },
    });
    return { userId: byEmail.id, isNew: false };
  }

  const user = await prisma.user.create({
    data: { email: p.email, fullName: p.fullName.slice(0, 120), avatarUrl: p.avatarUrl, [idField]: p.providerId, role: 'STUDENT', status: 'ACTIVE', emailVerifiedAt: new Date() },
  });
  return { userId: user.id, isNew: true };
}
