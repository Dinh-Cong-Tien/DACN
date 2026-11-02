/**
 * Mapper DB → DTO theo hợp đồng frontend (`frontend/src/shared/types/index.ts`).
 * Mapper dùng ở nhiều module đặt ở đây; mapper riêng của module đặt trong module đó.
 */
import type { Prisma, User } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const iso = (d: Date | null | undefined) => (d ? d.toISOString() : undefined);
export const ymd = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : undefined);
export const num = (d: Prisma.Decimal | number | null | undefined) => (d === null || d === undefined ? undefined : Number(d));

/**
 * Gói hiện tại: VIP nếu có user_subscriptions ACTIVE còn hạn với gói giá > 0.
 * Nhân sự (giáo viên trở lên) luôn có quyền như VIP để xem trước / giao đề VIP cho lớp.
 */
export async function planOf(userId: string): Promise<'FREE' | 'VIP'> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (u && u.role !== 'STUDENT') return 'VIP';
  const sub = await prisma.userSubscription.findFirst({
    where: { userId, status: 'ACTIVE', OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }], plan: { price: { gt: 0 } } },
    select: { id: true },
  });
  return sub ? 'VIP' : 'FREE';
}

/** AppUser */
export async function toAppUser(u: User) {
  const goal = await prisma.learningGoal.findFirst({ where: { userId: u.id, isActive: true } });
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl,
    status: u.status,
    plan: await planOf(u.id),
    target: goal
      ? { examType: goal.examType, score: goal.targetScore ? String(goal.targetScore) : (goal.targetLevel ?? ''), examDate: ymd(goal.targetDate) }
      : undefined,
    streak: u.streakCurrent,
    effortPoints: u.xpTotal,
    joinedAt: u.createdAt.toISOString(),
    lastActiveAt: (u.lastActiveAt ?? u.updatedAt).toISOString(),
    phone: u.phone ?? undefined,
    bio: u.bio ?? undefined,
    organization: u.organization ?? undefined,
    city: u.city ?? undefined,
    settings: u.settings,
  };
}
