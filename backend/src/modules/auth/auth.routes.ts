import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { hashPassword, comparePassword } from '../../lib/password';
import { auth, issueRefreshToken, revokeRefreshToken, rotateRefreshToken, signAccessToken } from '../../core/auth';
import { badRequest, conflict, forbidden, handler, me, parse, unauthorized } from '../../core/http';
import { toAppUser } from '../../core/dto';
import { limits, loginGuard, rateLimit, recordLoginFailure, resetLoginFailures } from '../../middleware/rate-limit';
import { env } from '../../config/env';
import { upsertOAuthUser, verifyFacebook, verifyGoogle } from './oauth';

export const authRouter = Router();

const meta = (req: { headers: Record<string, unknown>; ip?: string }) => ({ userAgent: String(req.headers['user-agent'] ?? ''), ip: req.ip?.replace('::ffff:', '') });

const registerBody = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự').max(100),
});
const loginBody = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });

async function session(userId: string, req: Parameters<typeof meta>[0]) {
  const user = await prisma.user.update({ where: { id: userId }, data: { lastActiveAt: new Date() } });
  return {
    user: await toAppUser(user),
    accessToken: signAccessToken({ id: user.id, role: user.role, email: user.email }),
    refreshToken: await issueRefreshToken(user.id, meta(req)),
  };
}

/** Đăng ký học viên (luồng #1). Chưa có dịch vụ email nên kích hoạt ngay. */
authRouter.post(
  '/register',
  rateLimit('register', limits.register, { message: 'Bạn đã tạo quá nhiều tài khoản từ thiết bị này. Vui lòng thử lại sau.' }),
  handler(async (req) => {
    const body = parse(registerBody, req.body);
    const exists = await prisma.user.findFirst({ where: { email: body.email, deletedAt: null }, select: { id: true } });
    if (exists) throw conflict('Email đã được sử dụng', 'EMAIL_TAKEN');
    const user = await prisma.user.create({
      data: { email: body.email, fullName: body.fullName, passwordHash: await hashPassword(body.password), role: 'STUDENT', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    return session(user.id, req);
  })
);

authRouter.post(
  '/login',
  loginGuard,
  handler(async (req) => {
    const body = parse(loginBody, req.body);
    const user = await prisma.user.findFirst({ where: { email: body.email, deletedAt: null } });
    if (!user?.passwordHash || !(await comparePassword(body.password, user.passwordHash))) {
      recordLoginFailure(req);
      throw unauthorized('Email hoặc mật khẩu không đúng');
    }
    resetLoginFailures(req);
    if (user.status === 'LOCKED') throw forbidden(user.lockedReason ? `Tài khoản đã bị khoá: ${user.lockedReason}` : 'Tài khoản đã bị khoá');
    return session(user.id, req);
  })
);

/** Cấu hình công khai cho nút đăng nhập một chạm (client ID không phải bí mật) */
authRouter.get(
  '/oauth/config',
  handler(async () => ({ googleClientId: env.GOOGLE_CLIENT_ID || null, facebookAppId: env.FACEBOOK_APP_ID || null }))
);

/** Đăng nhập / đăng ký một chạm: body { accessToken } nhận từ cửa sổ Google/Facebook */
authRouter.post(
  '/oauth/:provider',
  rateLimit('oauth', limits.loginIp, { message: 'Bạn thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.' }),
  handler(async (req) => {
    const provider = req.params.provider;
    if (provider !== 'google' && provider !== 'facebook') throw badRequest('Nhà cung cấp đăng nhập không hỗ trợ');
    const { accessToken } = parse(z.object({ accessToken: z.string().min(10).max(4096) }), req.body);
    const profile = provider === 'google' ? await verifyGoogle(accessToken) : await verifyFacebook(accessToken);
    const { userId, isNew } = await upsertOAuthUser(profile);
    return { ...(await session(userId, req)), isNew };
  })
);

authRouter.post(
  '/refresh',
  rateLimit('refresh', limits.refresh),
  handler(async (req) => {
    const { refreshToken } = parse(z.object({ refreshToken: z.string().min(10) }), req.body);
    const r = await rotateRefreshToken(refreshToken, meta(req));
    return { accessToken: r.accessToken, refreshToken: r.refreshToken, user: await toAppUser(r.user) };
  })
);

authRouter.post(
  '/logout',
  handler(async (req) => {
    const { refreshToken } = parse(z.object({ refreshToken: z.string().optional() }), req.body ?? {});
    if (refreshToken) await revokeRefreshToken(refreshToken);
    return { ok: true };
  })
);

authRouter.get(
  '/me',
  auth,
  handler(async (req) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: me(req).id } });
    return toAppUser(user);
  })
);

const profileBody = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  organization: z.string().max(160).nullable().optional(),
  city: z.string().max(80).nullable().optional(),
  settings: z.record(z.unknown()).optional(),
});

authRouter.patch(
  '/me',
  auth,
  handler(async (req) => {
    const body = parse(profileBody, req.body);
    const cur = await prisma.user.findUniqueOrThrow({ where: { id: me(req).id } });
    const user = await prisma.user.update({
      where: { id: cur.id },
      data: { ...body, settings: body.settings ? ({ ...(cur.settings as object), ...body.settings } as Prisma.InputJsonObject) : undefined },
    });
    return toAppUser(user);
  })
);

authRouter.post(
  '/change-password',
  auth,
  handler(async (req) => {
    const body = parse(z.object({ currentPassword: z.string().default(''), newPassword: z.string().min(8, 'Mật khẩu mới cần ít nhất 8 ký tự').max(100) }), req.body);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: me(req).id } });
    // Tài khoản tạo bằng Google/Facebook chưa có mật khẩu → được đặt mật khẩu lần đầu, không cần mật khẩu cũ
    if (user.passwordHash && !(await comparePassword(body.currentPassword, user.passwordHash))) throw badRequest('Mật khẩu hiện tại không đúng', 'WRONG_PASSWORD');
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(body.newPassword) } }),
      prisma.userToken.updateMany({ where: { userId: user.id, type: 'REFRESH', revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return { ok: true };
  })
);
