import type { NextFunction, Request, Response } from 'express';

/**
 * Rate limiting trong bộ nhớ (cửa sổ trượt theo khoá). Đủ cho 1 tiến trình API;
 * khi chạy nhiều bản cần chuyển sang Redis (đặc tả 10.8 mục 5).
 * Mọi ngưỡng cấu hình được qua biến môi trường RATE_LIMIT_* (xem `limits`).
 */

const envNum = (name: string, fallback: number) => {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

export const limits = {
  /** Toàn bộ API, theo IP */
  global: { max: envNum('RATE_LIMIT_GLOBAL_PER_MIN', 1200), windowMs: 60_000 },
  /** Đăng nhập SAI theo IP + email (chống dò mật khẩu) */
  loginFail: { max: envNum('RATE_LIMIT_LOGIN_FAILS', 10), windowMs: envNum('RATE_LIMIT_LOGIN_WINDOW_MIN', 15) * 60_000 },
  /** Mọi yêu cầu đăng nhập theo IP */
  loginIp: { max: envNum('RATE_LIMIT_LOGIN_PER_5MIN', 60), windowMs: 5 * 60_000 },
  /** Đăng ký tài khoản theo IP */
  register: { max: envNum('RATE_LIMIT_REGISTER_PER_HOUR', 10), windowMs: 60 * 60_000 },
  /** Làm mới phiên theo IP */
  refresh: { max: envNum('RATE_LIMIT_REFRESH_PER_5MIN', 120), windowMs: 5 * 60_000 },
  /** Tra từ điển của khách (chưa đăng nhập) theo IP */
  guestDictionary: { max: envNum('RATE_LIMIT_GUEST_DICT_PER_MIN', 30), windowMs: 60_000 },
  /** Chat hỗ trợ / liên hệ / nhận bản tin của khách theo IP */
  guestForms: { max: envNum('RATE_LIMIT_GUEST_FORMS_PER_10MIN', 20), windowMs: 10 * 60_000 },
} as const;

type Rule = { max: number; windowMs: number };
const buckets = new Map<string, number[]>();

/** Ghi nhận 1 lượt; trả về số giây phải chờ nếu vượt ngưỡng, 0 nếu còn hạn mức */
export function hit(key: string, rule: Rule, now = Date.now()): number {
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < rule.windowMs);
  if (arr.length >= rule.max) {
    buckets.set(key, arr);
    return Math.ceil((rule.windowMs - (now - arr[0])) / 1000);
  }
  arr.push(now);
  buckets.set(key, arr);
  return 0;
}

/** Số lượt còn lại mà không ghi nhận (dùng cho kiểm tra đăng nhập sai trước khi xác thực) */
export function blockedFor(key: string, rule: Rule, now = Date.now()): number {
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < rule.windowMs);
  return arr.length >= rule.max ? Math.ceil((rule.windowMs - (now - arr[0])) / 1000) : 0;
}

export const clearKey = (key: string) => buckets.delete(key);

// Dọn bộ nhớ định kỳ
setInterval(() => {
  const now = Date.now();
  for (const [k, arr] of buckets) if (!arr.length || now - arr[arr.length - 1] > 60 * 60_000) buckets.delete(k);
}, 10 * 60_000).unref();

export const clientIp = (req: Request) => (req.ip ?? req.socket.remoteAddress ?? 'unknown').replace('::ffff:', '');

const wait = (sec: number) => (sec >= 120 ? `${Math.ceil(sec / 60)} phút` : `${sec} giây`);

export function tooMany(res: Response, sec: number, message?: string) {
  res.setHeader('Retry-After', String(sec));
  return res.status(429).json({ error: { code: 'RATE_LIMITED', message: message ?? `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${wait(sec)}.` } });
}

/** Middleware giới hạn theo khoá; `onlyGuest` = chỉ áp khi chưa đăng nhập (đặt sau optionalAuth). */
export function rateLimit(name: string, rule: Rule, opts: { onlyGuest?: boolean; key?: (req: Request) => string; message?: string } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (opts.onlyGuest && req.user) return next();
    const sec = hit(`${name}:${opts.key ? opts.key(req) : clientIp(req)}`, rule);
    if (sec) return tooMany(res, sec, opts.message);
    next();
  };
}

/** Giới hạn chung toàn API theo IP */
export const globalRateLimit = rateLimit('global', limits.global);

/** Đăng nhập: chặn khi IP+email đã sai quá ngưỡng; chỉ lượt SAI mới bị đếm (route gọi `recordLoginFailure`). */
export const loginKey = (req: Request) => `login-fail:${clientIp(req)}:${String(req.body?.email ?? '').trim().toLowerCase()}`;
export function loginGuard(req: Request, res: Response, next: NextFunction) {
  const ipSec = hit(`login-ip:${clientIp(req)}`, limits.loginIp);
  if (ipSec) return tooMany(res, ipSec);
  const sec = blockedFor(loginKey(req), limits.loginFail);
  if (sec) return tooMany(res, sec, `Bạn đã nhập sai mật khẩu quá ${limits.loginFail.max} lần. Vui lòng thử lại sau ${wait(sec)}.`);
  next();
}
export const recordLoginFailure = (req: Request) => hit(loginKey(req), limits.loginFail);
export const resetLoginFailures = (req: Request) => clearKey(loginKey(req));

/** Giữ export cũ cho tương thích */
export const rateLimitMiddleware = globalRateLimit;
