/** Thông báo, mục đã lưu, gói dịch vụ & đơn mua (ghi nhận, chờ admin xác nhận). */
import crypto from 'node:crypto';
import { Router } from 'express';
import { pid } from './learner.shared';
import { z } from 'zod';
import type { Notification } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { badRequest, handler, me, notFound, pageQuery, paged, parse } from '../../core/http';
import { iso } from '../../core/dto';

export const miscRouter = Router();

// ---------------- Thông báo ----------------
const toNotification = (n: Notification) => ({
  id: n.id,
  title: n.title,
  message: n.message,
  // frontend chưa có loại PAYMENT → hiển thị như SYSTEM
  type: (n.type === 'PAYMENT' ? 'SYSTEM' : n.type) as 'REVIEW' | 'ASSIGNMENT' | 'ACHIEVEMENT' | 'SYSTEM' | 'CLASS',
  isRead: !!n.readAt,
  createdAt: n.createdAt.toISOString(),
  link: n.link ?? undefined,
});

miscRouter.get(
  '/notifications',
  handler(async (req) => {
    const userId = me(req).id;
    const q = parse(pageQuery.extend({ unread: z.enum(['true']).optional() }), req.query);
    const where = { userId, ...(q.unread ? { readAt: null } : {}) };
    const [rows, total, unread] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { ...paged(rows.map(toNotification), total, q), unread };
  })
);

miscRouter.get(
  '/notifications/unread-count',
  handler(async (req) => ({ unread: await prisma.notification.count({ where: { userId: me(req).id, readAt: null } }) }))
);

miscRouter.post(
  '/notifications/:id/read',
  handler(async (req) => {
    const r = await prisma.notification.updateMany({ where: { id: pid(req), userId: me(req).id, readAt: null }, data: { readAt: new Date() } });
    return { updated: r.count };
  })
);

miscRouter.post(
  '/notifications/read-all',
  handler(async (req) => {
    const r = await prisma.notification.updateMany({ where: { userId: me(req).id, readAt: null }, data: { readAt: new Date() } });
    return { updated: r.count };
  })
);

miscRouter.delete(
  '/notifications/:id',
  handler(async (req) => {
    await prisma.notification.deleteMany({ where: { id: pid(req), userId: me(req).id } });
    return { ok: true };
  })
);

// ---------------- Mục đã lưu ----------------
const TARGETS = ['QUESTION', 'LESSON', 'WORD', 'GRAMMAR_TOPIC', 'POST', 'TEST'] as const;
type Target = (typeof TARGETS)[number];

/** Tên + đường dẫn của đối tượng được lưu */
async function resolveTargets(items: { targetType: string; targetId: string }[]) {
  const ids = (t: Target) => items.filter((i) => i.targetType === t).map((i) => i.targetId);
  const [qs, ls, ws, gs, ps, ts] = await Promise.all([
    prisma.question.findMany({ where: { id: { in: ids('QUESTION') } }, select: { id: true, stem: true, part: true } }),
    prisma.lesson.findMany({ where: { id: { in: ids('LESSON') } }, select: { id: true, title: true, section: { select: { course: { select: { slug: true } } } } } }),
    prisma.word.findMany({ where: { id: { in: ids('WORD') } }, select: { id: true, headword: true, meaningVi: true } }),
    prisma.grammarTopic.findMany({ where: { id: { in: ids('GRAMMAR_TOPIC') } }, select: { id: true, title: true, slug: true } }),
    prisma.post.findMany({ where: { id: { in: ids('POST') } }, select: { id: true, title: true, slug: true } }),
    prisma.mockTest.findMany({ where: { id: { in: ids('TEST') } }, select: { id: true, title: true, slug: true } }),
  ]);
  const m = new Map<string, { title: string; subtitle?: string; link: string }>();
  qs.forEach((q) => m.set(q.id, { title: q.stem.slice(0, 160), subtitle: q.part.replace('TOEIC_P', 'Part '), link: '/app/mistakes' }));
  ls.forEach((l) => m.set(l.id, { title: l.title, link: `/app/courses/${l.section.course.slug}/lessons/${l.id}` }));
  ws.forEach((w) => m.set(w.id, { title: w.headword, subtitle: w.meaningVi, link: '/app/vocabulary' }));
  gs.forEach((g) => m.set(g.id, { title: g.title, link: `/app/grammar/${g.slug}` }));
  ps.forEach((p) => m.set(p.id, { title: p.title, link: `/blog/${p.slug}` }));
  ts.forEach((t) => m.set(t.id, { title: t.title, link: `/app/mock-tests/${t.slug}` }));
  return m;
}

miscRouter.get(
  '/bookmarks',
  handler(async (req) => {
    const { type } = parse(z.object({ type: z.enum(TARGETS).optional() }), req.query);
    const rows = await prisma.bookmark.findMany({ where: { userId: me(req).id, ...(type ? { targetType: type } : {}) }, orderBy: { createdAt: 'desc' } });
    const info = await resolveTargets(rows);
    return rows
      .filter((r) => info.has(r.targetId))
      .map((r) => ({ id: r.id, targetType: r.targetType, targetId: r.targetId, note: r.note ?? undefined, createdAt: r.createdAt.toISOString(), ...info.get(r.targetId)! }));
  })
);

miscRouter.post(
  '/bookmarks',
  handler(async (req) => {
    const body = parse(z.object({ targetType: z.enum(TARGETS), targetId: z.string().uuid(), note: z.string().max(1000).optional() }), req.body);
    const info = await resolveTargets([body]);
    if (!info.has(body.targetId)) throw notFound('Mục cần lưu');
    const userId = me(req).id;
    const b = await prisma.bookmark.upsert({
      where: { userId_targetType_targetId: { userId, targetType: body.targetType, targetId: body.targetId } },
      create: { userId, ...body },
      update: { note: body.note },
    });
    return { id: b.id, targetType: b.targetType, targetId: b.targetId, note: b.note ?? undefined, createdAt: b.createdAt.toISOString(), ...info.get(b.targetId)! };
  })
);

miscRouter.delete(
  '/bookmarks/:id',
  handler(async (req) => {
    const userId = me(req).id;
    // xoá theo id bookmark hoặc theo targetId (nút bỏ lưu ở trang nội dung)
    const r = await prisma.bookmark.deleteMany({ where: { userId, OR: [{ id: pid(req) }, { targetId: pid(req) }] } });
    return { deleted: r.count };
  })
);

// ---------------- Gói & thanh toán (cơ bản) ----------------
miscRouter.get(
  '/billing',
  handler(async (req) => {
    const userId = me(req).id;
    const [sub, txns] = await Promise.all([
      prisma.userSubscription.findFirst({
        where: { userId, status: 'ACTIVE', OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
        include: { plan: true },
        orderBy: { endsAt: 'desc' },
      }),
      prisma.paymentTransaction.findMany({ where: { userId }, include: { plan: { select: { code: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    return {
      plan: sub && Number(sub.plan.price) > 0 ? 'VIP' : 'FREE',
      subscription: sub ? { id: sub.id, planCode: sub.plan.code, planName: sub.plan.name, status: sub.status, startsAt: iso(sub.startsAt), endsAt: iso(sub.endsAt) } : null,
      transactions: txns.map((t) => ({
        id: t.id,
        orderCode: t.orderCode,
        planId: t.plan.code,
        planName: t.plan.name,
        amount: Number(t.amount),
        discount: Number(t.discountAmount),
        method: t.method,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        paidAt: iso(t.paidAt),
      })),
    };
  })
);

/** Tạo đơn mua gói: PENDING, admin xác nhận chuyển khoản → kích hoạt gói (thanh toán qua cổng là chức năng nâng cao). */
miscRouter.post(
  '/billing/orders',
  handler(async (req) => {
    const userId = me(req).id;
    const body = parse(z.object({ planCode: z.string().min(2).max(30), method: z.enum(['BANK', 'MOMO', 'VNPAY', 'CARD']).default('BANK'), couponCode: z.string().trim().max(30).optional() }), req.body);
    const plan = await prisma.subscriptionPlan.findFirst({ where: { OR: [{ code: body.planCode }, { id: /^[0-9a-f-]{36}$/i.test(body.planCode) ? body.planCode : undefined }], isActive: true } });
    if (!plan) throw notFound('Gói dịch vụ');
    if (Number(plan.price) <= 0) throw badRequest('Gói miễn phí không cần thanh toán');
    const pending = await prisma.paymentTransaction.findFirst({ where: { userId, planId: plan.id, status: 'PENDING' } });
    if (pending) return { orderCode: pending.orderCode, amount: Number(pending.amount), status: pending.status, reused: true };

    let discount = 0n;
    let couponId: string | undefined;
    if (body.couponCode) {
      const now = new Date();
      const c = await prisma.coupon.findFirst({ where: { code: { equals: body.couponCode, mode: 'insensitive' }, isActive: true } });
      const valid =
        c && (!c.validFrom || c.validFrom <= now) && (!c.validTo || c.validTo >= now) && (c.maxRedemptions === null || c.redeemedCount < c.maxRedemptions) && (!c.planIds.length || c.planIds.includes(plan.id));
      if (!valid) throw badRequest('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'INVALID_COUPON');
      const used = await prisma.paymentTransaction.count({ where: { userId, couponId: c.id, status: 'PAID' } });
      if (used) throw badRequest('Bạn đã dùng mã này', 'COUPON_USED');
      discount = c.discountType === 'PERCENT' ? (plan.price * c.discountValue) / 100n : c.discountValue;
      if (discount >= plan.price) discount = plan.price - 1000n;
      couponId = c.id;
    }
    const orderCode = `ORB${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const t = await prisma.paymentTransaction.create({
      data: { userId, planId: plan.id, couponId, orderCode, method: body.method, amount: plan.price - discount, discountAmount: discount, ipAddress: req.ip?.replace('::ffff:', '') || null },
    });
    return {
      orderCode: t.orderCode,
      amount: Number(t.amount),
      discount: Number(t.discountAmount),
      status: t.status,
      transferNote: `${t.orderCode} ${me(req).email}`,
      message: 'Đơn đã được ghi nhận. Gói sẽ được kích hoạt sau khi quản trị viên xác nhận thanh toán.',
    };
  })
);

miscRouter.post(
  '/billing/orders/:orderCode/cancel',
  handler(async (req) => {
    const r = await prisma.paymentTransaction.updateMany({ where: { orderCode: pid(req, 'orderCode'), userId: me(req).id, status: 'PENDING' }, data: { status: 'FAILED' } });
    if (!r.count) throw notFound('Đơn đang chờ');
    return { ok: true };
  })
);
