/** /api/v1/admin — vận hành: lớp toàn hệ thống, hỗ trợ, thanh toán, thông báo hàng loạt, cấu hình, nhật ký, thống kê, hệ thống */
import os from 'node:os';
import { Router, type Request } from 'express';
import { z } from 'zod';
import { Prisma, type UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { badRequest, handler, me, notFound, pageQuery, paged, parse } from '../../core/http';
import { audit, notify } from './audit';
import { classInclude, classStats, lastMonths, ticketInclude, toClassRoom, toSupportTicket } from '../head/shared';

export const opsRouter = Router();
const uuid = z.string().uuid();
const idOf = (req: Request) => parse(uuid, req.params.id);
const startedAt = Date.now();

// ============================ LỚP HỌC TOÀN HỆ THỐNG ============================
opsRouter.get(
  '/classes',
  handler(async () => {
    const classes = await prisma.class.findMany({ where: { deletedAt: null }, include: { ...classInclude, department: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
    const stats = await classStats(classes);
    return classes.map((c) => ({ ...toClassRoom(c, stats.get(c.id)), departmentName: c.department?.name }));
  })
);
opsRouter.patch(
  '/classes/:id',
  handler(async (req) => {
    const body = parse(z.object({ teacherId: uuid.optional(), isArchived: z.boolean().optional(), name: z.string().min(2).max(160).optional(), room: z.string().max(80).nullish(), scheduleText: z.string().max(120).nullish(), departmentId: uuid.nullish() }), req.body);
    const cur = await prisma.class.findFirst({ where: { id: idOf(req), deletedAt: null } });
    if (!cur) throw notFound('Lớp học');
    if (body.teacherId) {
      const t = await prisma.user.findFirst({ where: { id: body.teacherId, deletedAt: null, status: 'ACTIVE', role: { in: ['TEACHER', 'HEAD_TEACHER'] } } });
      if (!t) throw badRequest('Giáo viên không hợp lệ hoặc chưa hoạt động', 'INVALID_TEACHER');
    }
    const c = await prisma.class.update({ where: { id: cur.id }, data: body, include: classInclude });
    if (body.teacherId && body.teacherId !== cur.teacherId) {
      await audit(req, 'CLASS_REASSIGN', 'class', c.id, { severity: 'WARN', before: { teacherId: cur.teacherId }, after: { teacherId: body.teacherId, target: c.name } });
      await notify([body.teacherId], { type: 'CLASS', title: 'Bạn được phân công phụ trách lớp', message: c.name, link: `/teacher/classes/${c.id}`, refType: 'CLASS', refId: c.id });
    }
    if (body.isArchived !== undefined && body.isArchived !== cur.isArchived) await audit(req, body.isArchived ? 'CLASS_LOCK' : 'CLASS_UNLOCK', 'class', c.id, { severity: 'WARN', after: { target: c.name } });
    return toClassRoom(c, (await classStats([c])).get(c.id));
  })
);
/** Đổi mã mời lớp */
opsRouter.post(
  '/classes/:id/regenerate-code',
  handler(async (req) => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const c = await prisma.class.update({ where: { id: idOf(req) }, data: { code } });
    await audit(req, 'CLASS_CODE_RESET', 'class', c.id, { after: { target: c.name } });
    return { code };
  })
);
opsRouter.delete(
  '/classes/:id',
  handler(async (req) => {
    const c = await prisma.class.update({ where: { id: idOf(req) }, data: { deletedAt: new Date() } });
    await audit(req, 'CLASS_DELETE', 'class', c.id, { severity: 'CRITICAL', after: { target: c.name } });
    return { ok: true };
  })
);

// ============================ HỖ TRỢ HỌC VIÊN ============================
const TICKET_IN = { OPEN: 'OPEN', PENDING: 'PENDING', RESOLVED: 'RESOLVED' } as const;
opsRouter.get(
  '/support',
  handler(async (req) => {
    const { status } = parse(z.object({ status: z.enum(['OPEN', 'PENDING', 'RESOLVED']).optional() }), req.query);
    const where: Prisma.TicketWhereInput = { category: { not: 'ACADEMIC' }, ...(status === 'PENDING' ? { status: { in: ['PENDING', 'IN_REVIEW'] } } : status === 'RESOLVED' ? { status: { in: ['RESOLVED', 'REJECTED'] } } : status ? { status } : {}) };
    const rows = await prisma.ticket.findMany({ where, include: ticketInclude, orderBy: [{ createdAt: 'desc' }] });
    return Promise.all(rows.map(toSupportTicket));
  })
);
opsRouter.get(
  '/support/:id',
  handler(async (req) => {
    const t = await prisma.ticket.findUnique({ where: { id: idOf(req) }, include: ticketInclude });
    if (!t) throw notFound('Yêu cầu hỗ trợ');
    return toSupportTicket(t);
  })
);
opsRouter.patch(
  '/support/:id',
  handler(async (req) => {
    const body = parse(z.object({ status: z.enum(['OPEN', 'PENDING', 'RESOLVED']).optional(), priority: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(), assigneeId: uuid.nullish(), category: z.enum(['ACCOUNT', 'PAYMENT', 'EXAM', 'CONTENT', 'ACADEMIC', 'OTHER']).optional() }), req.body);
    const t = await prisma.ticket.update({
      where: { id: idOf(req) },
      data: { ...body, status: body.status ? TICKET_IN[body.status] : undefined, resolvedAt: body.status === 'RESOLVED' ? new Date() : body.status ? null : undefined },
      include: ticketInclude,
    });
    return toSupportTicket(t);
  })
);
opsRouter.post(
  '/support/:id/reply',
  handler(async (req) => {
    const body = parse(z.object({ text: z.string().trim().min(1).max(5000), resolve: z.boolean().optional() }), req.body);
    const id = idOf(req);
    const t = await prisma.$transaction(async (tx) => {
      const cur = await tx.ticket.findUniqueOrThrow({ where: { id } });
      await tx.ticketMessage.create({ data: { ticketId: id, senderType: 'STAFF', senderId: me(req).id, text: body.text } });
      const u = await tx.ticket.update({
        where: { id },
        data: { status: body.resolve ? 'RESOLVED' : 'PENDING', assigneeId: cur.assigneeId ?? me(req).id, resolution: body.resolve ? body.text : undefined, resolvedAt: body.resolve ? new Date() : undefined },
        include: ticketInclude,
      });
      await notify([cur.userId], { type: 'SYSTEM', title: 'Phản hồi từ bộ phận hỗ trợ', message: body.text.slice(0, 300), refType: 'TICKET', refId: id }, tx);
      return u;
    });
    return toSupportTicket(t);
  })
);

// ============================ GÓI VIP & THANH TOÁN ============================
/** id gói phía frontend (PRICING_PLANS) theo tiền tố mã gói trong DB: FREE → free, VIP_TOEIC_* → vip-toeic, VSTEP_MASTER_* → vstep-master */
const PLAN_PREFIX: [string, string][] = [['FREE', 'free'], ['VIP_TOEIC', 'vip-toeic'], ['VSTEP_MASTER', 'vstep-master']];
const planFeId = (code: string) => PLAN_PREFIX.find(([p]) => code === p || code.startsWith(`${p}_`))?.[1] ?? code.toLowerCase().replace(/_/g, '-');
const txnInclude = { user: { select: { fullName: true, email: true, avatarUrl: true } }, plan: { select: { code: true, name: true } } } as const;
const toTxn = (t: Prisma.PaymentTransactionGetPayload<{ include: typeof txnInclude }>) => ({
  id: t.id,
  orderCode: t.orderCode,
  userName: t.user.fullName,
  email: t.user.email,
  avatarUrl: t.user.avatarUrl ?? undefined,
  planId: planFeId(t.plan.code),
  planCode: t.plan.code,
  planName: t.plan.name,
  amount: Number(t.amount),
  discount: Number(t.discountAmount),
  method: t.method,
  status: t.status,
  createdAt: t.createdAt.toISOString(),
  paidAt: t.paidAt?.toISOString(),
  refundedAt: t.refundedAt?.toISOString(),
  refundReason: t.refundReason ?? undefined,
});
const planRow = (p: Prisma.SubscriptionPlanGetPayload<object>) => ({
  id: planFeId(p.code),
  dbId: p.id,
  code: p.code,
  name: p.name,
  description: p.description ?? '',
  price: Number(p.price),
  compareAtPrice: p.compareAtPrice === null ? undefined : Number(p.compareAtPrice),
  durationDays: p.durationDays ?? undefined,
  period: p.durationDays ? `${p.durationDays} ngày` : 'Vĩnh viễn',
  features: p.featuresDisplay as { text: string; included: boolean }[],
  entitlements: p.entitlements,
  badge: p.badge ?? undefined,
  highlight: p.isHighlighted,
  isActive: p.isActive,
  examScope: p.examScope ?? undefined,
});

opsRouter.get(
  '/billing',
  handler(async (req) => {
    const q = parse(pageQuery.extend({ status: z.enum(['PAID', 'PENDING', 'REFUNDED', 'FAILED']).optional(), pageSize: z.coerce.number().int().min(1).max(500).default(200) }), req.query);
    const where: Prisma.PaymentTransactionWhereInput = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.q ? { OR: [{ orderCode: { contains: q.q, mode: 'insensitive' } }, { user: { email: { contains: q.q, mode: 'insensitive' } } }, { user: { fullName: { contains: q.q, mode: 'insensitive' } } }] } : {}),
    };
    const ms = lastMonths(6);
    const [items, total, plans, paid] = await Promise.all([
      prisma.paymentTransaction.findMany({ where, include: txnInclude, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
      prisma.paymentTransaction.count({ where }),
      prisma.subscriptionPlan.findMany({ orderBy: { orderIndex: 'asc' } }),
      prisma.paymentTransaction.findMany({ where: { status: 'PAID', paidAt: { gte: ms[0].start } }, select: { amount: true, paidAt: true, plan: { select: { code: true } } } }),
    ]);
    const paidPlans = plans.filter((p) => Number(p.price) > 0);
    return {
      ...paged(items.map(toTxn), total, q),
      plans: plans.map(planRow),
      revenue: {
        labels: ms.map((m) => m.label),
        /** triệu đồng */
        revenue: ms.map((m) => Math.round(paid.filter((p) => p.paidAt! >= m.start && p.paidAt! < m.end).reduce((a, p) => a + Number(p.amount), 0) / 100_000) / 10),
        byPlan: paidPlans.map((pl) => ({ planId: planFeId(pl.code), name: pl.name, counts: ms.map((m) => paid.filter((p) => p.plan.code === pl.code && p.paidAt! >= m.start && p.paidAt! < m.end).length) })),
      },
      summary: {
        pending: await prisma.paymentTransaction.count({ where: { status: 'PENDING' } }),
        activeVip: await prisma.userSubscription.count({ where: { status: 'ACTIVE', plan: { price: { gt: 0 } }, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] } }),
      },
    };
  })
);

/** Xác nhận thanh toán thủ công (chuyển khoản): PENDING → PAID + kích hoạt gói (luồng #10, không có cổng thanh toán) */
opsRouter.post(
  '/billing/:id/confirm',
  handler(async (req) => {
    const id = idOf(req);
    const t = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ id: string; status: string }[]>`SELECT id::text, status::text FROM payment_transactions WHERE id = ${id}::uuid FOR UPDATE`;
      if (!rows[0]) throw notFound('Giao dịch');
      if (rows[0].status !== 'PENDING') throw badRequest('Chỉ xác nhận được giao dịch đang chờ', 'INVALID_STATE');
      const txn = await tx.paymentTransaction.update({ where: { id }, data: { status: 'PAID', paidAt: new Date() }, include: { ...txnInclude, plan: true } });
      // Gói mới bắt đầu khi gói đang hiệu lực (nếu có) kết thúc, tránh chồng thời gian
      const active = await tx.userSubscription.findFirst({ where: { userId: txn.userId, status: 'ACTIVE', OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] }, orderBy: { endsAt: 'desc' } });
      if (active && !active.endsAt) throw badRequest('Người dùng đang có gói vĩnh viễn', 'HAS_LIFETIME');
      const startsAt = active?.endsAt && active.endsAt > new Date() ? active.endsAt : new Date();
      const endsAt = txn.plan.durationDays ? new Date(startsAt.getTime() + txn.plan.durationDays * 86400_000) : null;
      await tx.userSubscription.create({ data: { userId: txn.userId, planId: txn.planId, status: 'ACTIVE', startsAt, endsAt, paymentId: txn.id } });
      if (txn.couponId) await tx.coupon.update({ where: { id: txn.couponId }, data: { redeemedCount: { increment: 1 } } });
      await notify([txn.userId], { type: 'PAYMENT', title: 'Thanh toán thành công', message: `Gói ${txn.plan.name} đã được kích hoạt${endsAt ? ` đến ${endsAt.toISOString().slice(0, 10)}` : ''}.`, link: '/app/settings', refType: 'PAYMENT', refId: txn.id }, tx);
      await audit(req, 'PAYMENT_CONFIRM', 'payment_transaction', txn.id, { tx, severity: 'CRITICAL', before: { status: 'PENDING' }, after: { status: 'PAID', target: `${txn.orderCode} · ${txn.user.email}` } });
      return txn;
    });
    return toTxn(t);
  })
);

/** Hoàn tiền: PAID → REFUNDED, huỷ gói kích hoạt từ giao dịch này */
opsRouter.post(
  '/billing/:id/refund',
  handler(async (req) => {
    const id = idOf(req);
    const { reason } = parse(z.object({ reason: z.string().trim().min(3).max(500) }), req.body);
    const t = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ status: string }[]>`SELECT status::text FROM payment_transactions WHERE id = ${id}::uuid FOR UPDATE`;
      if (!rows[0]) throw notFound('Giao dịch');
      if (rows[0].status !== 'PAID') throw badRequest('Chỉ hoàn tiền giao dịch đã thanh toán', 'INVALID_STATE');
      const txn = await tx.paymentTransaction.update({ where: { id }, data: { status: 'REFUNDED', refundedAt: new Date(), refundReason: reason }, include: txnInclude });
      await tx.userSubscription.updateMany({ where: { paymentId: id, status: 'ACTIVE' }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
      await notify([txn.userId], { type: 'PAYMENT', title: 'Đã hoàn tiền', message: `Giao dịch ${txn.orderCode} đã được hoàn tiền. Lý do: ${reason}`, refType: 'PAYMENT', refId: txn.id }, tx);
      await audit(req, 'PAYMENT_REFUND', 'payment_transaction', id, { tx, severity: 'CRITICAL', before: { status: 'PAID' }, after: { status: 'REFUNDED', reason, target: `${txn.orderCode} · ${txn.user.email}` } });
      return txn;
    });
    return toTxn(t);
  })
);
opsRouter.post(
  '/billing/:id/fail',
  handler(async (req) => {
    const id = idOf(req);
    const cur = await prisma.paymentTransaction.findUnique({ where: { id } });
    if (!cur) throw notFound('Giao dịch');
    if (cur.status !== 'PENDING') throw badRequest('Chỉ huỷ được giao dịch đang chờ', 'INVALID_STATE');
    const t = await prisma.paymentTransaction.update({ where: { id }, data: { status: 'FAILED' }, include: txnInclude });
    await audit(req, 'PAYMENT_FAIL', 'payment_transaction', id, { severity: 'WARN', after: { target: t.orderCode } });
    return toTxn(t);
  })
);

/** Sửa giá / tắt bán gói */
opsRouter.patch(
  '/plans/:code',
  handler(async (req) => {
    const code = String(req.params.code);
    const body = parse(
      z.object({
        name: z.string().min(2).max(80).optional(),
        description: z.string().max(2000).nullish(),
        price: z.number().int().min(0).optional(),
        compareAtPrice: z.number().int().min(0).nullish(),
        durationDays: z.number().int().min(1).max(3650).nullish(),
        isActive: z.boolean().optional(),
        isHighlighted: z.boolean().optional(),
        badge: z.string().max(30).nullish(),
        features: z.array(z.object({ text: z.string(), included: z.boolean() })).optional(),
      }),
      req.body
    );
    const plan = (await prisma.subscriptionPlan.findMany()).find((p) => p.code.toLowerCase() === code.toLowerCase() || planFeId(p.code) === code || p.id === code);
    if (!plan) throw notFound('Gói dịch vụ');
    const { features, price, compareAtPrice, ...rest } = body;
    const p = await prisma.subscriptionPlan.update({
      where: { id: plan.id },
      data: { ...rest, ...(features ? { featuresDisplay: features } : {}), ...(price !== undefined ? { price: BigInt(price) } : {}), ...(compareAtPrice !== undefined ? { compareAtPrice: compareAtPrice === null ? null : BigInt(compareAtPrice) } : {}) },
    });
    await audit(req, 'PLAN_UPDATE', 'subscription_plan', p.id, { severity: 'WARN', before: { price: Number(plan.price), isActive: plan.isActive }, after: { price: Number(p.price), isActive: p.isActive, target: p.name } });
    return planRow(p);
  })
);

// ============================ THÔNG BÁO HÀNG LOẠT ============================
type Audience = 'ALL' | 'STUDENT' | 'VIP' | 'TEACHER' | 'HEAD_TEACHER';
const toBroadcast = (b: Prisma.BroadcastGetPayload<object>) => ({
  id: b.id,
  title: b.title,
  body: b.body,
  audience: b.audience as Audience,
  channels: b.channels as ('IN_APP' | 'EMAIL')[],
  status: b.status as 'SENT' | 'SCHEDULED' | 'DRAFT',
  at: (b.sentAt ?? b.scheduledAt ?? b.createdAt).toISOString(),
  reach: b.reachCount,
  openRate: b.status === 'SENT' && b.reachCount ? Math.round((b.openCount / b.reachCount) * 100) : undefined,
});
async function recipients(audience: Audience): Promise<string[]> {
  const base: Prisma.UserWhereInput = { deletedAt: null, status: 'ACTIVE' };
  const where: Prisma.UserWhereInput =
    audience === 'ALL'
      ? base
      : audience === 'VIP'
        ? { ...base, userSubscriptionUsers: { some: { status: 'ACTIVE', plan: { price: { gt: 0 } }, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] } } }
        : { ...base, role: audience as UserRole };
  return (await prisma.user.findMany({ where, select: { id: true } })).map((u) => u.id);
}
/** Gửi: tạo notifications cho người nhận (kênh IN_APP). Email chưa có dịch vụ gửi → chỉ ghi nhận kênh. */
async function sendBroadcast(id: string) {
  const b = await prisma.broadcast.findUniqueOrThrow({ where: { id } });
  const ids = await recipients(b.audience as Audience);
  const reach = b.channels.includes('IN_APP') ? await notify(ids, { type: 'SYSTEM', title: b.title, message: b.body, refType: 'BROADCAST', refId: b.id }) : ids.length;
  return prisma.broadcast.update({ where: { id }, data: { status: 'SENT', sentAt: new Date(), reachCount: reach } });
}
/** Gửi các thông báo hẹn giờ đã tới hạn (gọi mỗi lần admin mở danh sách; chưa có job nền) */
async function flushScheduled() {
  const due = await prisma.broadcast.findMany({ where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } }, select: { id: true } });
  for (const d of due) await sendBroadcast(d.id);
}
async function refreshOpenCounts() {
  await prisma.$executeRaw`UPDATE broadcasts b SET open_count = s.n FROM (SELECT ref_id, count(*) FILTER (WHERE read_at IS NOT NULL)::int AS n FROM notifications WHERE ref_type = 'BROADCAST' GROUP BY ref_id) s WHERE s.ref_id = b.id`;
}
opsRouter.get(
  '/broadcasts',
  handler(async () => {
    await flushScheduled();
    await refreshOpenCounts();
    const rows = await prisma.broadcast.findMany({ orderBy: { createdAt: 'desc' } });
    const counts = Object.fromEntries(await Promise.all((['ALL', 'STUDENT', 'VIP', 'TEACHER', 'HEAD_TEACHER'] as Audience[]).map(async (a) => [a, (await recipients(a)).length])));
    return { items: rows.map(toBroadcast), audienceCounts: counts };
  })
);
const broadcastBody = z.object({
  title: z.string().trim().min(2).max(200),
  body: z.string().trim().min(2).max(5000),
  audience: z.enum(['ALL', 'STUDENT', 'VIP', 'TEACHER', 'HEAD_TEACHER']),
  channels: z.array(z.enum(['IN_APP', 'EMAIL'])).min(1),
  mode: z.enum(['NOW', 'SCHEDULE', 'DRAFT']).default('NOW'),
  scheduledAt: z.coerce.date().optional(),
});
opsRouter.post(
  '/broadcasts',
  handler(async (req) => {
    const b = parse(broadcastBody, req.body);
    if (b.mode === 'SCHEDULE' && (!b.scheduledAt || b.scheduledAt <= new Date())) throw badRequest('Thời điểm hẹn giờ phải ở tương lai');
    const row = await prisma.broadcast.create({
      data: { title: b.title, body: b.body, audience: b.audience, channels: b.channels, status: b.mode === 'SCHEDULE' ? 'SCHEDULED' : 'DRAFT', scheduledAt: b.mode === 'SCHEDULE' ? b.scheduledAt : null, createdById: me(req).id },
    });
    const out = b.mode === 'NOW' ? await sendBroadcast(row.id) : row;
    await audit(req, b.mode === 'NOW' ? 'BROADCAST_SEND' : 'BROADCAST_CREATE', 'broadcast', row.id, { after: { target: b.title, audience: b.audience, reach: out.reachCount } });
    return toBroadcast(out);
  })
);
opsRouter.post(
  '/broadcasts/:id/send',
  handler(async (req) => {
    const cur = await prisma.broadcast.findUnique({ where: { id: idOf(req) } });
    if (!cur) throw notFound('Thông báo');
    if (cur.status === 'SENT') throw badRequest('Thông báo đã được gửi');
    const out = await sendBroadcast(cur.id);
    await audit(req, 'BROADCAST_SEND', 'broadcast', cur.id, { after: { target: cur.title, reach: out.reachCount } });
    return toBroadcast(out);
  })
);
opsRouter.delete(
  '/broadcasts/:id',
  handler(async (req) => {
    const cur = await prisma.broadcast.findUnique({ where: { id: idOf(req) } });
    if (!cur) throw notFound('Thông báo');
    if (cur.status === 'SENT') throw badRequest('Không xoá thông báo đã gửi');
    await prisma.broadcast.delete({ where: { id: cur.id } });
    return { ok: true };
  })
);

// ============================ CẤU HÌNH THAM SỐ ============================
const toSetting = (s: Prisma.SystemSettingGetPayload<object>) => ({
  key: s.key,
  label: s.label,
  description: s.description ?? '',
  type: s.valueType as 'TOGGLE' | 'NUMBER' | 'TEXT' | 'SELECT',
  value: s.value as string | number | boolean,
  options: (s.options as string[] | null) ?? undefined,
  group: s.groupName,
  updatedAt: s.updatedAt.toISOString(),
});
opsRouter.get('/settings', handler(async () => (await prisma.systemSetting.findMany({ where: { valueType: { not: 'JSON' } }, orderBy: [{ groupName: 'asc' }, { key: 'asc' }] })).map(toSetting)));
/** Lưu nhiều tham số một lần: { values: { key: value } } */
opsRouter.put(
  '/settings',
  handler(async (req) => {
    const { values } = parse(z.object({ values: z.record(z.union([z.string(), z.number(), z.boolean()])) }), req.body);
    const keys = Object.keys(values);
    const rows = await prisma.systemSetting.findMany({ where: { key: { in: keys } } });
    if (rows.length !== keys.length) throw badRequest(`Tham số không tồn tại: ${keys.filter((k) => !rows.find((r) => r.key === k)).join(', ')}`);
    for (const r of rows) {
      const v = values[r.key];
      const ok = r.valueType === 'TOGGLE' ? typeof v === 'boolean' : r.valueType === 'NUMBER' ? typeof v === 'number' && Number.isFinite(v) : r.valueType === 'SELECT' ? (r.options as string[] | null)?.includes(String(v)) : typeof v === 'string';
      if (!ok) throw badRequest(`Giá trị không hợp lệ cho "${r.label}"`);
    }
    await prisma.$transaction(rows.map((r) => prisma.systemSetting.update({ where: { key: r.key }, data: { value: values[r.key], updatedById: me(req).id } })));
    await audit(req, 'SETTING_UPDATE', 'system_setting', null, { severity: 'WARN', before: Object.fromEntries(rows.map((r) => [r.key, r.value])), after: { ...values, target: keys.join(', ') } });
    return (await prisma.systemSetting.findMany({ where: { key: { in: keys } } })).map(toSetting);
  })
);

// ============================ NHẬT KÝ HỆ THỐNG ============================
opsRouter.get(
  '/audit-logs',
  handler(async (req) => {
    const q = parse(pageQuery.extend({ severity: z.enum(['INFO', 'WARN', 'CRITICAL']).optional(), role: z.enum(['STUDENT', 'TEACHER', 'HEAD_TEACHER', 'ADMIN']).optional(), action: z.string().optional(), pageSize: z.coerce.number().int().min(1).max(500).default(200) }), req.query);
    const where: Prisma.AuditLogWhereInput = {
      ...(q.severity ? { severity: q.severity } : {}),
      ...(q.role ? { actorRole: q.role } : {}),
      ...(q.action ? { action: { contains: q.action, mode: 'insensitive' } } : {}),
      ...(q.q ? { OR: [{ action: { contains: q.q, mode: 'insensitive' } }, { actor: { fullName: { contains: q.q, mode: 'insensitive' } } }, { resourceType: { contains: q.q, mode: 'insensitive' } }] } : {}),
    };
    const [rows, total, bySeverity] = await Promise.all([
      prisma.auditLog.findMany({ where, include: { actor: { select: { fullName: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({ by: ['severity'], _count: true }),
    ]);
    return {
      ...paged(
        rows.map((l) => {
          const after = (l.afterData ?? {}) as Record<string, unknown>;
          return {
            id: l.id,
            actor: l.actor?.fullName ?? 'Hệ thống',
            actorAvatar: l.actor?.avatarUrl ?? undefined,
            role: l.actorRole ?? 'ADMIN',
            action: l.action,
            target: String(after.target ?? after.title ?? after.name ?? after.email ?? `${l.resourceType}${l.resourceId ? ` ${l.resourceId.slice(0, 8)}` : ''}`),
            resourceType: l.resourceType,
            ip: l.ipAddress ?? '',
            createdAt: l.createdAt.toISOString(),
            severity: l.severity as 'INFO' | 'WARN' | 'CRITICAL',
            before: l.beforeData ?? undefined,
            after: l.afterData ?? undefined,
          };
        }),
        total,
        q
      ),
      bySeverity: Object.fromEntries(bySeverity.map((b) => [b.severity, b._count])),
    };
  })
);

// ============================ THỐNG KÊ ============================
opsRouter.get(
  '/analytics',
  handler(async (req) => {
    const { days } = parse(z.object({ days: z.coerce.number().int().min(7).max(90).default(7) }), req.query);
    const today = new Date();
    const dayStart = (offset: number) => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset));
    const from = dayStart(days - 1);
    const prevFrom = dayStart(days * 2 - 1);
    const ms = lastMonths(12);
    const [activity, prevActivity, attempts, prevAttempts, signups, attemptsByExam, roles, devicesRaw] = await Promise.all([
      prisma.dailyActivity.groupBy({ by: ['activityDate'], where: { activityDate: { gte: from } }, _count: { userId: true }, _sum: { minutes: true, questionsAnswered: true } }),
      prisma.dailyActivity.groupBy({ by: ['activityDate'], where: { activityDate: { gte: prevFrom, lt: from } }, _count: { userId: true }, _sum: { minutes: true } }),
      prisma.examAttempt.count({ where: { createdAt: { gte: from } } }),
      prisma.examAttempt.count({ where: { createdAt: { gte: prevFrom, lt: from } } }),
      prisma.user.findMany({ where: { deletedAt: null, createdAt: { gte: ms[0].start } }, select: { createdAt: true } }),
      prisma.examAttempt.findMany({ where: { createdAt: { gte: from }, test: { isNot: null } }, select: { test: { select: { examType: true } } } }),
      prisma.user.groupBy({ by: ['role'], where: { deletedAt: null }, _count: true }),
      prisma.examAttempt.findMany({ where: { createdAt: { gte: from }, clientInfo: { not: Prisma.DbNull } }, select: { clientInfo: true } }),
    ]);
    const series = Array.from({ length: days }, (_, i) => {
      const d = dayStart(days - 1 - i);
      const row = activity.find((a) => a.activityDate.getTime() === d.getTime());
      const prev = prevActivity.find((a) => a.activityDate.getTime() === dayStart(days * 2 - 1 - i).getTime());
      return { date: d.toISOString().slice(0, 10), label: days <= 7 ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getUTCDay()] : d.toISOString().slice(5, 10), active: row?._count.userId ?? 0, prevActive: prev?._count.userId ?? 0, minutes: row?._sum.minutes ?? 0, questions: row?._sum.questionsAnswered ?? 0 };
    });
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    const change = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0);
    const active = new Set((await prisma.dailyActivity.findMany({ where: { activityDate: { gte: from } }, select: { userId: true } })).map((r) => r.userId)).size;
    const prevActiveN = new Set((await prisma.dailyActivity.findMany({ where: { activityDate: { gte: prevFrom, lt: from } }, select: { userId: true } })).map((r) => r.userId)).size;
    const minutes = sum(series.map((s) => s.minutes));
    const prevMinutes = sum(prevActivity.map((p) => p._sum.minutes ?? 0));
    const sessions = sum(series.map((s) => s.active));
    const toeic = attemptsByExam.filter((a) => a.test?.examType === 'TOEIC').length;
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    for (const r of devicesRaw) {
      const ua = String((r.clientInfo as { userAgent?: string } | null)?.userAgent ?? '');
      if (!ua) continue;
      if (/ipad|tablet/i.test(ua)) devices.tablet++;
      else if (/mobi|android|iphone/i.test(ua)) devices.mobile++;
      else devices.desktop++;
    }
    return {
      figures: {
        activeUsers: { value: active, change: change(active, prevActiveN) },
        studyMinutes: { value: minutes, change: change(minutes, prevMinutes) },
        attempts: { value: attempts, change: change(attempts, prevAttempts) },
        avgSessionMin: { value: sessions ? Math.round(minutes / sessions) : 0, change: 0 },
      },
      daily: series,
      signupsMonthly: { labels: ms.map((m) => m.label), values: ms.map((m) => signups.filter((s) => s.createdAt >= m.start && s.createdAt < m.end).length) },
      attemptsByExam: { TOEIC: toeic, VSTEP: attemptsByExam.length - toeic },
      roles: Object.fromEntries(roles.map((r) => [r.role, r._count])),
      devices,
    };
  })
);

// ============================ TRẠNG THÁI DỊCH VỤ (đo thật) ============================
opsRouter.get(
  '/system',
  handler(async () => {
    const t0 = performance.now();
    let dbOk = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbOk = false;
    }
    const dbLatency = Math.round(performance.now() - t0);
    const [info] = dbOk
      ? await prisma.$queryRaw<{ version: string; size: string; conns: number; tables: number }[]>`
          SELECT version() AS version, pg_size_pretty(pg_database_size(current_database())) AS size,
                 (SELECT count(*)::int FROM pg_stat_activity WHERE datname = current_database()) AS conns,
                 (SELECT count(*)::int FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS tables`
      : [];
    const mem = process.memoryUsage();
    const uptimeSec = Math.round((Date.now() - startedAt) / 1000);
    const fmtUp = (s: number) => (s >= 86400 ? `${Math.floor(s / 86400)} ngày ${Math.floor((s % 86400) / 3600)} giờ` : s >= 3600 ? `${Math.floor(s / 3600)} giờ ${Math.floor((s % 3600) / 60)} phút` : `${Math.floor(s / 60)} phút`);
    const services = [
      { name: 'API Server', status: 'UP' as const, latencyMs: 0, uptime: fmtUp(uptimeSec), description: `Express REST API · Node ${process.version}` },
      { name: 'PostgreSQL', status: (dbOk ? (dbLatency > 200 ? 'DEGRADED' : 'UP') : 'DOWN') as 'UP' | 'DEGRADED' | 'DOWN', latencyMs: dbLatency, uptime: dbOk ? 'đang kết nối' : 'mất kết nối', description: info ? `${info.version.split(' ').slice(0, 2).join(' ')} · ${info.tables} bảng · ${info.size} · ${info.conns} kết nối` : 'Không kết nối được' },
    ];
    const lastAudit = await prisma.auditLog.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }).catch(() => null);
    return {
      services,
      checkedAt: new Date().toISOString(),
      process: { uptimeSec, rssMb: Math.round(mem.rss / 1048576), heapUsedMb: Math.round(mem.heapUsed / 1048576), heapTotalMb: Math.round(mem.heapTotal / 1048576), node: process.version, pid: process.pid },
      host: { platform: `${os.platform()} ${os.release()}`, cpus: os.cpus().length, load: os.loadavg(), totalMemMb: Math.round(os.totalmem() / 1048576), freeMemMb: Math.round(os.freemem() / 1048576) },
      database: info ? { version: info.version, size: info.size, connections: info.conns, tables: info.tables, latencyMs: dbLatency } : null,
      lastActivityAt: lastAudit?.createdAt.toISOString(),
    };
  })
);

// ============================ TỔNG QUAN ADMIN ============================
opsRouter.get(
  '/dashboard',
  handler(async () => {
    const monthStart = lastMonths(1)[0].start;
    const prevMonthStart = lastMonths(2)[0].start;
    const [users, newThisMonth, newPrevMonth, pendingUsers, openTickets, pendingPayments, scheduled, revenueMonth, revenuePrev, attempts7d] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: monthStart } } }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: prevMonthStart, lt: monthStart } } }),
      prisma.user.findMany({ where: { deletedAt: null, status: 'PENDING' }, select: { id: true, fullName: true, email: true } }),
      prisma.ticket.count({ where: { status: 'OPEN', category: { not: 'ACADEMIC' } } }),
      prisma.paymentTransaction.count({ where: { status: 'PENDING' } }),
      prisma.broadcast.findMany({ where: { status: 'SCHEDULED' }, select: { id: true, title: true, scheduledAt: true } }),
      prisma.paymentTransaction.aggregate({ where: { status: 'PAID', paidAt: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.paymentTransaction.aggregate({ where: { status: 'PAID', paidAt: { gte: prevMonthStart, lt: monthStart } }, _sum: { amount: true } }),
      prisma.examAttempt.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400_000) } } }),
    ]);
    const vip = await prisma.userSubscription.count({ where: { status: 'ACTIVE', plan: { price: { gt: 0 } }, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] } });
    return {
      users,
      vipUsers: vip,
      newThisMonth,
      newPrevMonth,
      revenueMonth: Number(revenueMonth._sum.amount ?? 0),
      revenuePrevMonth: Number(revenuePrev._sum.amount ?? 0),
      attempts7d,
      openTickets,
      pendingPayments,
      pendingUsers,
      scheduledBroadcasts: scheduled.map((s) => ({ id: s.id, title: s.title, scheduledAt: s.scheduledAt?.toISOString() })),
      recentUsers: (await prisma.user.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, fullName: true, email: true, role: true, avatarUrl: true, createdAt: true } })).map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
    };
  })
);
