import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

type Severity = 'INFO' | 'WARN' | 'CRITICAL';
type Tx = Prisma.TransactionClient | typeof prisma;

const ipOf = (req: Request) => {
  const ip = (req.ip ?? '').replace('::ffff:', '');
  return /^[\d.:a-f]+$/i.test(ip) && ip ? ip : null;
};

/** Ghi audit_logs cho thao tác nhạy cảm (USER_LOCK, ROLE_CHANGE, CONTENT_APPROVE, SCORE_ADJUST, PAYMENT_REFUND…). */
export async function audit(
  req: Request,
  action: string,
  resourceType: string,
  resourceId: string | null,
  opts: { severity?: Severity; before?: unknown; after?: unknown; tx?: Tx } = {}
) {
  const db = opts.tx ?? prisma;
  await db.auditLog.create({
    data: {
      actorId: req.user?.id ?? null,
      actorRole: req.user?.role ?? null,
      action,
      resourceType,
      resourceId: resourceId && /^[0-9a-f-]{36}$/i.test(resourceId) ? resourceId : null,
      severity: opts.severity ?? 'INFO',
      ipAddress: ipOf(req),
      beforeData: (opts.before ?? undefined) as Prisma.InputJsonValue | undefined,
      afterData: (opts.after ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

/** Gửi thông báo trong chuông cho 1 hoặc nhiều người dùng. */
export async function notify(
  userIds: (string | null | undefined)[],
  n: { type: 'REVIEW' | 'ASSIGNMENT' | 'ACHIEVEMENT' | 'SYSTEM' | 'CLASS' | 'PAYMENT'; title: string; message: string; link?: string; refType?: string; refId?: string },
  tx: Tx = prisma
) {
  const ids = [...new Set(userIds.filter((x): x is string => !!x))];
  if (!ids.length) return 0;
  const r = await tx.notification.createMany({ data: ids.map((userId) => ({ userId, ...n })) });
  return r.count;
}
