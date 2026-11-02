import type { Prisma } from '@prisma/client';

/** Ngày hiện tại theo giờ Việt Nam, dạng Date ở 00:00 UTC (cột DATE). */
export const vnToday = () => new Date(new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10));

export interface ActivityDelta {
  minutes?: number;
  lessons?: number;
  questions?: number;
  cards?: number;
  xp?: number;
}

/**
 * Ghi hoạt động trong ngày (daily_activities) + cập nhật users.xp_total và chuỗi ngày học (streak).
 * Gọi trong transaction của nghiệp vụ.
 */
export async function recordActivity(tx: Prisma.TransactionClient, userId: string, d: ActivityDelta) {
  const today = vnToday();
  const inc = {
    minutes: { increment: d.minutes ?? 0 },
    lessonsCompleted: { increment: d.lessons ?? 0 },
    questionsAnswered: { increment: d.questions ?? 0 },
    cardsReviewed: { increment: d.cards ?? 0 },
    xp: { increment: d.xp ?? 0 },
  };
  await tx.dailyActivity.upsert({
    where: { userId_activityDate: { userId, activityDate: today } },
    create: { userId, activityDate: today, minutes: d.minutes ?? 0, lessonsCompleted: d.lessons ?? 0, questionsAnswered: d.questions ?? 0, cardsReviewed: d.cards ?? 0, xp: d.xp ?? 0 },
    update: inc,
  });

  const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { lastStudyDate: true, streakCurrent: true, streakLongest: true } });
  const last = user.lastStudyDate?.getTime();
  const dayMs = 86400_000;
  let streak = user.streakCurrent;
  if (last !== today.getTime()) streak = last === today.getTime() - dayMs ? streak + 1 : 1;
  await tx.user.update({
    where: { id: userId },
    data: {
      xpTotal: { increment: d.xp ?? 0 },
      streakCurrent: streak,
      streakLongest: Math.max(user.streakLongest, streak),
      lastStudyDate: today,
      lastActiveAt: new Date(),
    },
  });
}
