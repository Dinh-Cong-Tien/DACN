import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { forbidden, unauthorized, type AuthUser } from './http';

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

/** Bắt buộc đăng nhập. */
export function auth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) return next(unauthorized());
  try {
    req.user = decode(token);
    next();
  } catch {
    next(unauthorized('Phiên đăng nhập hết hạn'));
  }
}

/** Không bắt buộc đăng nhập: có token hợp lệ thì gắn req.user (trang công khai hiển thị thêm dữ liệu cá nhân). */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (token) {
    try {
      req.user = decode(token);
    } catch {
      /* bỏ qua token hỏng ở route công khai */
    }
  }
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
