/** /api/v1/admin/users — tài khoản & phân quyền */
import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Prisma, UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/password';
import { badRequest, conflict, handler, me, notFound, pageQuery, paged, parse } from '../../core/http';
import { toAppUser } from '../../core/dto';
import { refreshLiveAfterWrite } from '../../core/auth';
import { audit, notify } from './audit';

export const usersRouter = Router();
// Khoá / đổi vai trò / xoá có hiệu lực ngay với phiên đang đăng nhập của người đó
usersRouter.use(refreshLiveAfterWrite);

const ROLES = ['STUDENT', 'TEACHER', 'HEAD_TEACHER', 'ADMIN'] as const;
const STATUSES = ['PENDING', 'ACTIVE', 'LOCKED'] as const;
const uuid = z.string().uuid();

const listQuery = pageQuery.extend({
  role: z.enum(ROLES).optional(),
  status: z.enum(STATUSES).optional(),
  plan: z.enum(['FREE', 'VIP']).optional(),
  pageSize: z.coerce.number().int().min(1).max(500).default(500),
});

usersRouter.get(
  '/',
  handler(async (req) => {
    const q = parse(listQuery, req.query);
    const vipFilter: Prisma.UserWhereInput = { userSubscriptionUsers: { some: { status: 'ACTIVE', plan: { price: { gt: 0 } }, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] } } };
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(q.role ? { role: q.role } : {}),
      ...(q.status ? { status: q.status } : {}),
      ...(q.plan === 'VIP' ? vipFilter : q.plan === 'FREE' ? { NOT: vipFilter } : {}),
      ...(q.q ? { OR: [{ fullName: { contains: q.q, mode: 'insensitive' } }, { email: { contains: q.q, mode: 'insensitive' } }] } : {}),
    };
    const [rows, total, byRole, byStatus] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
      prisma.user.count({ where }),
      prisma.user.groupBy({ by: ['role'], where: { deletedAt: null }, _count: true }),
      prisma.user.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
    ]);
    return {
      ...paged(await Promise.all(rows.map(toAppUser)), total, q),
      stats: {
        byRole: Object.fromEntries(byRole.map((r) => [r.role, r._count])),
        byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count])),
        activeLast7d: await prisma.user.count({ where: { deletedAt: null, lastActiveAt: { gte: new Date(Date.now() - 7 * 86400_000) } } }),
      },
    };
  })
);

usersRouter.get(
  '/:id',
  handler(async (req) => {
    const u = await prisma.user.findFirst({ where: { id: parse(uuid, req.params.id), deletedAt: null } });
    if (!u) throw notFound('Tài khoản');
    const [subs, payments, attempts] = await Promise.all([
      prisma.userSubscription.findMany({ where: { userId: u.id }, include: { plan: { select: { code: true, name: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.paymentTransaction.count({ where: { userId: u.id } }),
      prisma.examAttempt.count({ where: { userId: u.id } }),
    ]);
    return {
      ...(await toAppUser(u)),
      lockedReason: u.lockedReason ?? undefined,
      departmentId: u.departmentId ?? undefined,
      subscriptions: subs.map((s) => ({ id: s.id, plan: s.plan.name, planCode: s.plan.code, status: s.status, startsAt: s.startsAt?.toISOString(), endsAt: s.endsAt?.toISOString() })),
      paymentsCount: payments,
      attemptsCount: attempts,
    };
  })
);

const userBody = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(ROLES).default('STUDENT'),
  status: z.enum(STATUSES).default('ACTIVE'),
  password: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự').max(100).optional(),
  phone: z.string().max(20).nullish(),
  departmentId: uuid.nullish(),
  avatarUrl: z.string().url().nullish(),
});

usersRouter.post(
  '/',
  handler(async (req) => {
    const body = parse(userBody, req.body);
    if (await prisma.user.findFirst({ where: { email: body.email, deletedAt: null }, select: { id: true } })) throw conflict('Email đã được sử dụng', 'EMAIL_TAKEN');
    await assertDepartment(body.role, body.departmentId);
    const password = body.password ?? Math.random().toString(36).slice(2, 10) + 'A1';
    const { password: _p, ...data } = body;
    const u = await prisma.user.create({ data: { ...data, passwordHash: await hashPassword(password), emailVerifiedAt: body.status === 'ACTIVE' ? new Date() : null } });
    await audit(req, 'USER_CREATE', 'user', u.id, { after: { email: u.email, role: u.role, target: u.fullName } });
    // Trả mật khẩu tạm 1 lần để admin gửi cho người dùng khi không nhập mật khẩu
    return { ...(await toAppUser(u)), temporaryPassword: body.password ? undefined : password };
  })
);

usersRouter.patch(
  '/:id',
  handler(async (req) => {
    const id = parse(uuid, req.params.id);
    const body = parse(userBody.partial().extend({ lockedReason: z.string().max(500).nullish() }), req.body);
    const cur = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!cur) throw notFound('Tài khoản');
    if (id === me(req).id && ((body.role && body.role !== cur.role) || body.status === 'LOCKED')) throw badRequest('Không thể tự đổi vai trò hoặc khoá tài khoản của chính mình');
    if (body.email && body.email !== cur.email && (await prisma.user.findFirst({ where: { email: body.email, deletedAt: null, NOT: { id } }, select: { id: true } }))) throw conflict('Email đã được sử dụng', 'EMAIL_TAKEN');
    const { password, ...data } = body;
    const nextRole = body.role ?? cur.role;
    const nextDept = body.departmentId === undefined ? cur.departmentId : body.departmentId;
    if (body.role !== undefined || body.departmentId !== undefined) await assertDepartment(nextRole, nextDept);
    // Học viên, admin không thuộc bộ môn
    if (nextRole === 'STUDENT' || nextRole === 'ADMIN') data.departmentId = null;
    const u = await prisma.user.update({
      where: { id },
      data: { ...data, ...(password ? { passwordHash: await hashPassword(password) } : {}), lockedReason: body.status && body.status !== 'LOCKED' ? null : data.lockedReason },
    });
    if (body.role && body.role !== cur.role) {
      await audit(req, 'ROLE_CHANGE', 'user', id, { severity: 'WARN', before: { role: cur.role }, after: { role: u.role, target: `${u.fullName} → ${u.role}` } });
      await notify([id], { type: 'SYSTEM', title: 'Vai trò tài khoản đã thay đổi', message: `Vai trò mới: ${u.role}. Vui lòng đăng nhập lại.` });
    }
    if (body.status && body.status !== cur.status) await lockAudit(req, cur.id, cur.fullName, cur.status, body.status, body.lockedReason);
    if (password) await prisma.userToken.updateMany({ where: { userId: id, type: 'REFRESH', revokedAt: null }, data: { revokedAt: new Date() } });
    // Lớp của giáo viên chưa thuộc bộ môn nào → về bộ môn vừa gán (để trưởng bộ môn quản lý được)
    if (u.departmentId && u.departmentId !== cur.departmentId) await prisma.class.updateMany({ where: { teacherId: id, departmentId: null, deletedAt: null }, data: { departmentId: u.departmentId } });
    if (!body.role && !body.status) await audit(req, 'USER_UPDATE', 'user', id, { after: { target: u.fullName, fields: Object.keys(body) } });
    return toAppUser(u);
  })
);

/** Giáo viên phải thuộc một bộ môn (trưởng bộ môn quản lý lớp theo bộ môn); bộ môn phải tồn tại */
async function assertDepartment(role: UserRole | undefined, departmentId: string | null | undefined) {
  if (departmentId && !(await prisma.department.findFirst({ where: { id: departmentId, deletedAt: null }, select: { id: true } }))) throw badRequest('Bộ môn không tồn tại', 'DEPARTMENT_NOT_FOUND');
  if (role === 'TEACHER' && !departmentId) throw badRequest('Chọn bộ môn cho giáo viên để trưởng bộ môn quản lý được lớp của họ', 'DEPARTMENT_REQUIRED');
}

async function lockAudit(req: Request, id: string, name: string, from: UserStatus, to: UserStatus, reason?: string | null) {
  await audit(req, to === 'LOCKED' ? 'USER_LOCK' : 'USER_UNLOCK', 'user', id, { severity: to === 'LOCKED' ? 'CRITICAL' : 'WARN', before: { status: from }, after: { status: to, reason, target: name } });
  if (to === 'LOCKED') await prisma.userToken.updateMany({ where: { userId: id, type: 'REFRESH', revokedAt: null }, data: { revokedAt: new Date() } });
}

usersRouter.post(
  '/:id/lock',
  handler(async (req) => {
    const id = parse(uuid, req.params.id);
    const { locked, reason } = parse(z.object({ locked: z.boolean(), reason: z.string().max(500).optional() }), req.body);
    if (id === me(req).id) throw badRequest('Không thể tự khoá tài khoản của chính mình');
    const cur = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!cur) throw notFound('Tài khoản');
    const status: UserStatus = locked ? 'LOCKED' : 'ACTIVE';
    const u = await prisma.user.update({ where: { id }, data: { status, lockedReason: locked ? (reason ?? null) : null } });
    await lockAudit(req, id, cur.fullName, cur.status, status, reason);
    return toAppUser(u);
  })
);

usersRouter.delete(
  '/:id',
  handler(async (req) => {
    const id = parse(uuid, req.params.id);
    if (id === me(req).id) throw badRequest('Không thể xoá tài khoản của chính mình');
    const cur = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!cur) throw notFound('Tài khoản');
    const teaching = await prisma.class.count({ where: { teacherId: id, deletedAt: null, isArchived: false } });
    if (teaching) throw badRequest('Giáo viên còn phụ trách lớp, hãy đổi giáo viên trước khi xoá', 'IN_USE');
    await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: 'LOCKED' } }),
      prisma.userToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    await audit(req, 'USER_DELETE', 'user', id, { severity: 'CRITICAL', before: { email: cur.email, role: cur.role }, after: { target: cur.fullName } });
    return { ok: true };
  })
);

/** Thao tác hàng loạt: khoá / mở / đổi vai trò / xoá mềm */
usersRouter.post(
  '/bulk',
  handler(async (req) => {
    const body = parse(z.object({ ids: z.array(uuid).min(1).max(500), action: z.enum(['LOCK', 'UNLOCK', 'DELETE', 'SET_ROLE']), role: z.enum(ROLES).optional(), reason: z.string().max(500).optional() }), req.body);
    const ids = body.ids.filter((x) => x !== me(req).id);
    const where = { id: { in: ids }, deletedAt: null };
    let count = 0;
    if (body.action === 'LOCK') count = (await prisma.user.updateMany({ where, data: { status: 'LOCKED', lockedReason: body.reason ?? null } })).count;
    if (body.action === 'UNLOCK') count = (await prisma.user.updateMany({ where, data: { status: 'ACTIVE', lockedReason: null } })).count;
    if (body.action === 'DELETE') count = (await prisma.user.updateMany({ where: { ...where, classTeachers: { none: { deletedAt: null, isArchived: false } } }, data: { deletedAt: new Date(), status: 'LOCKED' } })).count;
    if (body.action === 'SET_ROLE') {
      if (!body.role) throw badRequest('Thiếu vai trò');
      if (body.role === 'TEACHER') {
        const noDept = await prisma.user.count({ where: { ...where, departmentId: null } });
        if (noDept) throw badRequest(`${noDept} tài khoản chưa thuộc bộ môn — sửa từng tài khoản để chọn bộ môn trước khi chuyển thành giáo viên`, 'DEPARTMENT_REQUIRED');
      }
      count =(await prisma.user.updateMany({ where, data: { role: body.role as UserRole } })).count;
    }
    if (body.action !== 'UNLOCK' && body.action !== 'SET_ROLE') await prisma.userToken.updateMany({ where: { userId: { in: ids }, revokedAt: null }, data: { revokedAt: new Date() } });
    await audit(req, `USER_BULK_${body.action}`, 'user', null, { severity: body.action === 'UNLOCK' ? 'WARN' : 'CRITICAL', after: { ids, role: body.role, count, target: `${count} tài khoản` } });
    return { count };
  })
);
