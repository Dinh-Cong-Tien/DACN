import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { HttpError, forbidden, unauthorized, type AuthUser } from './http';

type AccessPayload = { sub: string; role: UserRole; email: string };

export const signAccessToken = (u: AuthUser) =>
  jwt.sign({ sub: u.id, role: u.role, email: u.email } satisfies AccessPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/** Tạo refresh token mới (chỉ lưu SHA-256 trong user_tokens), cùng family khi xoay vòng. */
export async function issueRefreshToken(userId: string, meta: { familyId?: string; userAgent?: string; ip?: string } = {}) {
  const raw = crypto.randomBytes(48).toString('base64url');
  await prisma.userToken.create({
    data: {
      userId,
      type: 'REFRESH',
      tokenHash: sha256(raw),
      familyId: meta.familyId ?? crypto.randomUUID(),
      userAgent: meta.userAgent?.slice(0, 500),
      ipAddress: meta.ip && /^[\d.:a-f]+$/i.test(meta.ip) ? meta.ip : null,
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 86400_000),
    },
  });
  return raw;
}

/** Xoay vòng refresh token. Dùng lại token đã xoay → thu hồi cả family (phát hiện token bị đánh cắp). */
export async function rotateRefreshToken(raw: string, meta: { userAgent?: string; ip?: string }) {
  const row = await prisma.userToken.findUnique({ where: { tokenHash: sha256(raw) }, include: { user: true } });
  if (!row || row.type !== 'REFRESH') throw unauthorized('Phiên đăng nhập không hợp lệ');
  if (row.usedAt || row.revokedAt) {
    if (row.familyId) await prisma.userToken.updateMany({ where: { familyId: row.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
    throw unauthorized('Phiên đăng nhập đã bị thu hồi, vui lòng đăng nhập lại');
  }
  if (row.expiresAt < new Date()) throw unauthorized('Phiên đăng nhập đã hết hạn');
  if (row.user.deletedAt || row.user.status === 'LOCKED') throw forbidden('Tài khoản đã bị khoá');
  await prisma.userToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  const refreshToken = await issueRefreshToken(row.userId, { familyId: row.familyId ?? undefined, ...meta });
  const accessToken = signAccessToken({ id: row.user.id, role: row.user.role, email: row.user.email });
  return { accessToken, refreshToken, user: row.user };
}

export async function revokeRefreshToken(raw: string) {
  await prisma.userToken.updateMany({ where: { tokenHash: sha256(raw), revokedAt: null }, data: { revokedAt: new Date() } });
}

const readBearer = (req: Request) => {
  const h = req.headers.authorization;
  return h?.startsWith('Bearer ') ? h.slice(7) : undefined;
};

const decode = (token: string): AuthUser => {
  const p = jwt.verify(token, env.JWT_SECRET) as AccessPayload;
  return { id: p.sub, role: p.role, email: p.email };
};

/**
 * Trạng thái tài khoản đọc từ DB (cache 5 giây/tài khoản) thay vì tin hoàn toàn vào JWT:
 * khoá / xoá / đổi vai trò có hiệu lực ngay ở request kế tiếp, không phải đợi access token 15 phút hết hạn.
 */
type Live = { role: UserRole; status: string; deleted: boolean; at: number };
const liveCache = new Map<string, Live>();
const LIVE_TTL = 5_000;

export async function liveUser(id: string): Promise<Live | null> {
  const c = liveCache.get(id);
  if (c && Date.now() - c.at < LIVE_TTL) return c;
  const u = await prisma.user.findUnique({ where: { id }, select: { role: true, status: true, deletedAt: true } });
  if (!u) {
    liveCache.delete(id);
    return null;
  }
  const v = { role: u.role, status: u.status, deleted: !!u.deletedAt, at: Date.now() };
  liveCache.set(id, v);
  return v;
}
/** Gọi sau khi khoá / đổi vai trò / xoá để áp dụng ngay, không chờ hết cache */
export const forgetLiveUser = (id: string) => liveCache.delete(id);
export const clearLiveCache = () => liveCache.clear();
/** Middleware: sau mọi thao tác ghi thành công (khoá, đổi vai trò, xoá tài khoản…) thì xoá cache trạng thái tài khoản */
export const refreshLiveAfterWrite = (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET') res.on('finish', () => res.statusCode < 400 && liveCache.clear());
  next();
};

async function resolveUser(token: string): Promise<AuthUser> {
  const u = decode(token);
  const live = await liveUser(u.id);
  if (!live || live.deleted) throw new HttpError(401, 'ACCOUNT_GONE', 'Tài khoản không còn tồn tại');
  if (live.status === 'LOCKED') throw new HttpError(401, 'ACCOUNT_LOCKED', 'Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên.');
  return { ...u, role: live.role };
}

/** Bắt buộc đăng nhập. */
export function auth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) return next(unauthorized());
  resolveUser(token)
    .then((u) => {
      req.user = u;
      next();
    })
    .catch((e) => next(e instanceof HttpError ? e : unauthorized('Phiên đăng nhập hết hạn')));
}

/** Không bắt buộc đăng nhập: có token hợp lệ thì gắn req.user (trang công khai hiển thị thêm dữ liệu cá nhân). Token hỏng / tài khoản bị khoá → coi như khách. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) return next();
  resolveUser(token)
    .then((u) => {
      req.user = u;
    })
    .catch(() => undefined)
    .finally(() => next());
}

/** Chỉ tài khoản học viên (không áp phân cấp, kể cả ADMIN): tham gia lớp bằng mã, đặt mua gói… */
export function onlyStudent(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  if (req.user.role !== 'STUDENT') return next(forbidden('Chức năng này chỉ dành cho tài khoản học viên'));
  next();
}

/** Giới hạn vai trò. ADMIN luôn được phép. */
export const allow =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (req.user.role !== 'ADMIN' && !roles.includes(req.user.role)) return next(forbidden());
    next();
  };
