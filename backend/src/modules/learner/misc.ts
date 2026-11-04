/** Thông báo, mục đã lưu, gói dịch vụ & đơn mua (ghi nhận, chờ admin xác nhận). */
import crypto from 'node:crypto';
import { Router } from 'express';
import { correctKeyOf, partToFe, pid } from './learner.shared';
import { z } from 'zod';
import { onlyStudent } from '../../core/auth';
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
    const own = await prisma.notification.findFirst({ where: { id: pid(req), userId: me(req).id }, select: { id: true, readAt: true } });
    if (!own) throw notFound('Thông báo');
    if (!own.readAt) await prisma.notification.update({ where: { id: own.id }, data: { readAt: new Date() } });
    return { updated: own.readAt ? 0 : 1 };
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
    const r = await prisma.notification.deleteMany({ where: { id: pid(req), userId: me(req).id } });
    if (!r.count) throw notFound('Thông báo');
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
    prisma.question.findMany({ where: { id: { in: ids('QUESTION') } }, select: { id: true, stem: true, part: true, examType: true, options: true, correctAnswer: true } }),
    prisma.lesson.findMany({ where: { id: { in: ids('LESSON') } }, select: { id: true, title: true, type: true, durationMin: true, section: { select: { course: { select: { slug: true, title: true, coverUrl: true } } } } } }),
    prisma.word.findMany({ where: { id: { in: ids('WORD') } }, select: { id: true, headword: true, meaningVi: true, ipaUs: true, ipaUk: true } }),
    prisma.grammarTopic.findMany({ where: { id: { in: ids('GRAMMAR_TOPIC') } }, select: { id: true, title: true, slug: true } }),
    prisma.post.findMany({ where: { id: { in: ids('POST') } }, select: { id: true, title: true, slug: true } }),
    prisma.mockTest.findMany({ where: { id: { in: ids('TEST') } }, select: { id: true, title: true, slug: true } }),
  ]);
  const m = new Map<string, { title: string; subtitle?: string; link: string; detail?: Record<string, unknown> }>();
  // detail: dữ liệu để trang "Đã lưu" hiển thị đầy đủ (phương án + đáp án, IPA, khoá học của bài)
  qs.forEach((q) =>
    m.set(q.id, {
      title: q.stem.slice(0, 160),
      subtitle: q.part.replace('TOEIC_P', 'Part '),
      link: '/app/mistakes',
      detail: { stem: q.stem, part: partToFe(q.part), examType: q.examType, options: q.options ?? [], correctKey: correctKeyOf(q) },
    })
  );
  ls.forEach((l) =>
    m.set(l.id, {
      title: l.title,
      subtitle: l.section.course.title,
      link: `/app/courses/${l.section.course.slug}/lessons/${l.id}`,
      detail: { courseTitle: l.section.course.title, coverUrl: l.section.course.coverUrl, type: l.type, durationMin: l.durationMin },
    })
  );
  ws.forEach((w) => m.set(w.id, { title: w.headword, subtitle: w.meaningVi, link: '/app/vocabulary', detail: { ipa: w.ipaUs ?? w.ipaUk ?? '' } }));
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
/** Tài khoản nhận chuyển khoản (system_settings payment.*); chưa cấu hình → null */
async function payTo() {
  const rows = await prisma.systemSetting.findMany({ where: { key: { in: ['payment.bank_name', 'payment.account_no', 'payment.account_name'] } } });
  const v = (k: string) => String(rows.find((r) => r.key === k)?.value ?? '').trim();
  const accountNo = v('payment.account_no');
  return accountNo ? { bankName: v('payment.bank_name'), accountNo, accountName: v('payment.account_name') } : null;
}
const transferNote = (orderCode: string, email: string) => `${orderCode} ${email}`;

miscRouter.get(
  '/billing',
  handler(async (req) => {
    const { id: userId, email } = me(req);
    const [sub, txns, bank] = await Promise.all([
      prisma.userSubscription.findFirst({
        where: { userId, status: 'ACTIVE', OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
        include: { plan: true },
        orderBy: { endsAt: 'desc' },
      }),
      prisma.paymentTransaction.findMany({ where: { userId }, include: { plan: { select: { code: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
      payTo(),
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
        ...(t.status === 'PENDING' ? { transferNote: transferNote(t.orderCode, email) } : {}),
      })),
      payTo: bank,
    };
  })
);

/** Tạo đơn mua gói: PENDING, admin xác nhận chuyển khoản → kích hoạt gói (thanh toán qua cổng là chức năng nâng cao). */
miscRouter.post(
  '/billing/orders',
  onlyStudent,
  handler(async (req) => {
    const userId = me(req).id;
    const body = parse(z.object({ planCode: z.string().min(2).max(30), method: z.enum(['BANK', 'MOMO', 'VNPAY', 'CARD']).default('BANK'), couponCode: z.string().trim().max(30).optional() }), req.body);
    const plan = await prisma.subscriptionPlan.findFirst({ where: { OR: [{ code: body.planCode }, { id: /^[0-9a-f-]{36}$/i.test(body.planCode) ? body.planCode : undefined }], isActive: true } });
    if (!plan) throw notFound('Gói dịch vụ');
    if (Number(plan.price) <= 0) throw badRequest('Gói miễn phí không cần thanh toán');
    const pending = await prisma.paymentTransaction.findFirst({ where: { userId, planId: plan.id, status: 'PENDING' } });
    if (pending) return { orderCode: pending.orderCode, amount: Number(pending.amount), discount: Number(pending.discountAmount), status: pending.status, transferNote: transferNote(pending.orderCode, me(req).email), payTo: await payTo(), reused: true };

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
      transferNote: transferNote(t.orderCode, me(req).email),
      payTo: await payTo(),
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

// ---------------- Phiên đăng nhập (refresh token còn hiệu lực trong user_tokens) ----------------
const sessionLabel = (ua: string | null) => {
  const s = ua ?? '';
  const os = /windows/i.test(s) ? 'Windows' : /iphone|ipad/i.test(s) ? 'iOS' : /android/i.test(s) ? 'Android' : /mac os/i.test(s) ? 'macOS' : /linux/i.test(s) ? 'Linux' : 'Thiết bị khác';
  const br = /edg\//i.test(s) ? 'Edge' : /chrome\//i.test(s) ? 'Chrome' : /firefox\//i.test(s) ? 'Firefox' : /safari\//i.test(s) ? 'Safari' : 'Trình duyệt';
  return `${os} · ${br}`;
};
const tokenHash = (raw?: string) => (raw ? crypto.createHash('sha256').update(raw).digest('hex') : '');

/** POST /learner/sessions { refreshToken? } → danh sách phiên; refreshToken (của chính trình duyệt) để đánh dấu phiên hiện tại */
miscRouter.post(
  '/sessions',
  handler(async (req) => {
    const { refreshToken } = parse(z.object({ refreshToken: z.string().optional() }), req.body ?? {});
    const cur = tokenHash(refreshToken);
    const rows = await prisma.userToken.findMany({
      where: { userId: me(req).id, type: 'REFRESH', revokedAt: null, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return rows.map((t) => ({ id: t.id, device: sessionLabel(t.userAgent), ip: t.ipAddress ?? undefined, lastActiveAt: t.createdAt.toISOString(), current: !!cur && t.tokenHash === cur }));
  })
);

/** DELETE /learner/sessions/:id → thu hồi một phiên (đăng xuất thiết bị đó) */
miscRouter.delete(
  '/sessions/:id',
  handler(async (req) => {
    const r = await prisma.userToken.updateMany({ where: { id: pid(req), userId: me(req).id, type: 'REFRESH', revokedAt: null }, data: { revokedAt: new Date() } });
    if (!r.count) throw notFound('Phiên đăng nhập');
    return { ok: true };
  })
);

// ---------------- Báo lỗi câu hỏi → khiếu nại học thuật (tickets ACADEMIC, trưởng bộ môn xử lý) ----------------
miscRouter.post(
  '/questions/:id/report',
  handler(async (req) => {
    const user = me(req);
    const body = parse(z.object({ issue: z.enum(['WRONG_KEY', 'TYPO', 'AUDIO_ISSUE', 'EXPLANATION']).default('WRONG_KEY'), note: z.string().trim().max(2000).optional() }), req.body ?? {});
    const q = await prisma.question.findFirst({ where: { id: pid(req), deletedAt: null }, select: { id: true, part: true, stem: true } });
    if (!q) throw notFound('Câu hỏi');
    // Mỗi học viên chỉ mở 1 khiếu nại đang xử lý cho cùng một câu
    const open = await prisma.ticket.findFirst({ where: { userId: user.id, questionId: q.id, status: { in: ['OPEN', 'IN_REVIEW', 'PENDING'] } }, select: { id: true } });
    if (open) return { ticketId: open.id, duplicated: true };
    const label = { WRONG_KEY: 'Nghi sai đáp án', TYPO: 'Lỗi chính tả / nội dung', AUDIO_ISSUE: 'Lỗi audio', EXPLANATION: 'Giải thích chưa đúng' }[body.issue];
    const t = await prisma.ticket.create({
      data: {
        userId: user.id,
        channel: 'IN_APP',
        category: 'ACADEMIC',
        academicIssue: body.issue,
        questionId: q.id,
        subject: `${label} · ${partToFe(q.part)}`.slice(0, 200),
        ticketMessageTickets: { create: { senderType: 'USER', senderId: user.id, text: body.note || `${label}: "${q.stem.slice(0, 300)}"` } },
      },
    });
    return { ticketId: t.id, duplicated: false };
  })
);
