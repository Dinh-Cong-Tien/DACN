/** Tiến độ, hoạt động hằng ngày, thành tích, bảng xếp hạng — tính hoàn toàn từ dữ liệu thật. */
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { handler, me, parse } from '../../core/http';
import { addDays, initials, isListeningPart, partToFe, vnDate, vnWeekStart } from './learner.shared';

export const progressRouter = Router();

// ---------------- Thành tích (danh mục hằng số, tiến độ tính từ DB) ----------------
type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
interface AchievementDef {
  code: string;
  title: string;
  description: string;
  icon: string;
  total: number;
  rarity: Rarity;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { code: 'FIRST_TEST', title: 'Bước chân đầu tiên', description: 'Hoàn thành bài làm đầu tiên', icon: 'Rocket', total: 1, rarity: 'COMMON' },
  { code: 'STREAK_7', title: 'Chuỗi 7 ngày', description: 'Học liên tục 7 ngày', icon: 'Flame', total: 7, rarity: 'COMMON' },
  { code: 'STREAK_30', title: 'Chiến binh 30 ngày', description: 'Học liên tục 30 ngày', icon: 'Zap', total: 30, rarity: 'RARE' },
  { code: 'MISTAKE_HUNTER_50', title: 'Thợ săn lỗi', description: 'Giải quyết 50 câu trong Sổ tay lỗi sai', icon: 'Target', total: 50, rarity: 'RARE' },
  { code: 'VOCAB_500', title: 'Bậc thầy từ vựng', description: 'Thuộc 500 từ vựng', icon: 'Library', total: 500, rarity: 'EPIC' },
  { code: 'SCORE_700', title: 'Vượt mốc 700', description: 'Đạt 700+ trong bài thi thử TOEIC', icon: 'Trophy', total: 1, rarity: 'EPIC' },
  { code: 'NIGHT_OWL_5', title: 'Cú đêm chăm chỉ', description: 'Học sau 22h trong 5 ngày', icon: 'Moon', total: 5, rarity: 'COMMON' },
  { code: 'PERFECT_20', title: 'Hoàn hảo', description: 'Đạt 100% một bài luyện tập 20+ câu', icon: 'Gem', total: 1, rarity: 'LEGENDARY' },
  { code: 'TOP10_WEEK', title: 'Top 10 tuần', description: 'Vào top 10 bảng xếp hạng tuần', icon: 'Medal', total: 1, rarity: 'EPIC' },
  { code: 'CONTRIBUTOR_5', title: 'Người đóng góp', description: 'Báo cáo 5 câu hỏi có vấn đề được duyệt', icon: 'Wrench', total: 5, rarity: 'RARE' },
];

async function achievementProgress(userId: string): Promise<Record<string, number>> {
  const [user, completed, resolved, mastered, best, nightRows, perfect, contributed, weekRank] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { streakLongest: true } }),
    prisma.examAttempt.count({ where: { userId, status: { in: ['COMPLETED', 'GRADING'] } } }),
    prisma.mistakeEntry.count({ where: { userId, isResolved: true } }),
    prisma.srsCard.count({ where: { userId, wordId: { not: null }, status: 'MASTERED' } }),
    prisma.examAttempt.aggregate({ where: { userId, mode: 'FULL', status: 'COMPLETED', test: { examType: 'TOEIC' } }, _max: { scoreTotal: true } }),
    prisma.$queryRaw<{ n: bigint }[]>`SELECT count(DISTINCT (submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date) AS n FROM exam_attempts
       WHERE user_id = ${userId}::uuid AND submitted_at IS NOT NULL AND extract(hour FROM submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh') >= 22`,
    prisma.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM exam_attempts WHERE user_id = ${userId}::uuid AND status = 'COMPLETED' AND total_count >= 20 AND correct_count = total_count`.then((r) => Number(r[0]?.n ?? 0)),
    prisma.ticket.count({ where: { userId, category: 'ACADEMIC', status: 'RESOLVED' } }),
    weeklyRankOf(userId),
  ]);
  return {
    FIRST_TEST: completed,
    STREAK_7: user.streakLongest,
    STREAK_30: user.streakLongest,
    MISTAKE_HUNTER_50: resolved,
    VOCAB_500: mastered,
    SCORE_700: Number(best._max.scoreTotal ?? 0) >= 700 ? 1 : 0,
    NIGHT_OWL_5: Number(nightRows[0]?.n ?? 0),
    PERFECT_20: perfect > 0 ? 1 : 0,
    TOP10_WEEK: weekRank !== null && weekRank <= 10 ? 1 : 0,
    CONTRIBUTOR_5: contributed,
  };
}

/** Tính lại tiến độ, lưu user_achievements; tạo thông báo khi đạt huy hiệu mới. */
export async function evaluateAchievements(userId: string) {
  const prog = await achievementProgress(userId);
  const current = await prisma.userAchievement.findMany({ where: { userId } });
  const cur = new Map(current.map((c) => [c.achievementCode, c]));
  for (const def of ACHIEVEMENTS) {
    const p = Math.min(def.total, prog[def.code] ?? 0);
    const prev = cur.get(def.code);
    const earned = p >= def.total;
    if (prev && prev.progress === p && (!!prev.earnedAt || !earned)) continue;
    const newlyEarned = earned && !prev?.earnedAt;
    await prisma.userAchievement.upsert({
      where: { userId_achievementCode: { userId, achievementCode: def.code } },
      create: { userId, achievementCode: def.code, progress: p, earnedAt: earned ? new Date() : null },
      update: { progress: p, earnedAt: prev?.earnedAt ?? (earned ? new Date() : null) },
    });
    if (newlyEarned)
      await prisma.notification.create({
        data: { userId, type: 'ACHIEVEMENT', title: `Huy hiệu mới: ${def.title}`, message: def.description, link: '/app/achievements' },
      });
  }
}

progressRouter.get(
  '/achievements',
  handler(async (req) => {
    const userId = me(req).id;
    await evaluateAchievements(userId);
    const rows = await prisma.userAchievement.findMany({ where: { userId } });
    const map = new Map(rows.map((r) => [r.achievementCode, r]));
    return ACHIEVEMENTS.map((d) => {
      const r = map.get(d.code);
      return {
        id: d.code,
        title: d.title,
        description: d.description,
        icon: d.icon,
        earned: !!r?.earnedAt,
        earnedAt: r?.earnedAt?.toISOString().slice(0, 10),
        progress: r?.progress ?? 0,
        total: d.total,
        rarity: d.rarity,
      };
    });
  })
);

// ---------------- Bảng xếp hạng ----------------
type Period = 'week' | 'month' | 'all';
function periodRange(p: Period, back = 0): { from: Date; to: Date } | null {
  if (p === 'all') return null;
  if (p === 'week') {
    const from = addDays(vnWeekStart(), -7 * back);
    return { from, to: addDays(from, 7) };
  }
  const d = vnDate();
  const from = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - back, 1));
  return { from, to: new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1)) };
}

/** Danh sách (userId, điểm) đã sắp xếp; chỉ học viên cho phép hiện trên BXH */
async function ranking(p: Period, back = 0) {
  const r = periodRange(p, back);
  if (!r) {
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT', deletedAt: null, status: 'ACTIVE', xpTotal: { gt: 0 }, NOT: { settings: { path: ['showOnLeaderboard'], equals: false } } },
      select: { id: true, xpTotal: true },
      orderBy: { xpTotal: 'desc' },
      take: 200,
    });
    return users.map((u) => ({ userId: u.id, points: u.xpTotal }));
  }
  const rows = await prisma.$queryRaw<{ user_id: string; points: bigint }[]>`
    SELECT d.user_id, SUM(d.xp) AS points FROM daily_activities d JOIN users u ON u.id = d.user_id
    WHERE d.activity_date >= ${r.from.toISOString().slice(0, 10)}::date AND d.activity_date < ${r.to.toISOString().slice(0, 10)}::date AND u.role = 'STUDENT' AND u.deleted_at IS NULL AND u.status = 'ACTIVE'
      AND coalesce((u.settings->>'showOnLeaderboard')::boolean, true)
    GROUP BY d.user_id HAVING SUM(d.xp) > 0 ORDER BY points DESC LIMIT 200`;
  return rows.map((x) => ({ userId: x.user_id, points: Number(x.points) }));
}

async function weeklyRankOf(userId: string) {
  const list = await ranking('week');
  const i = list.findIndex((x) => x.userId === userId);
  return i < 0 ? null : i + 1;
}

progressRouter.get(
  '/leaderboard',
  handler(async (req) => {
    const userId = me(req).id;
    const { period, limit } = parse(z.object({ period: z.enum(['week', 'month', 'all']).default('week'), limit: z.coerce.number().int().min(3).max(100).default(20) }), req.query);
    const [list, prev] = await Promise.all([ranking(period), period === 'all' ? Promise.resolve([]) : ranking(period, 1)]);
    const prevRank = new Map(prev.map((x, i) => [x.userId, i + 1]));
    const ids = list.slice(0, limit).map((x) => x.userId);
    const myIdx = list.findIndex((x) => x.userId === userId);
    if (myIdx >= limit) ids.push(userId);
    const [users, goals] = await Promise.all([
      prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, fullName: true, avatarUrl: true, streakCurrent: true } }),
      prisma.learningGoal.findMany({ where: { userId: { in: ids }, isActive: true } }),
    ]);
    const umap = new Map(users.map((u) => [u.id, u]));
    const gmap = new Map(goals.map((g) => [g.userId, g]));
    const entries = ids.map((id) => {
      const idx = list.findIndex((x) => x.userId === id);
      const u = umap.get(id)!;
      const g = gmap.get(id);
      const pr = prevRank.get(id);
      return {
        rank: idx + 1,
        name: u.fullName,
        initials: initials(u.fullName),
        avatarUrl: u.avatarUrl ?? undefined,
        points: list[idx].points,
        streak: u.streakCurrent,
        delta: pr ? pr - (idx + 1) : 0,
        target: g ? `${g.examType} ${g.targetScore ?? g.targetLevel ?? ''}`.trim() : '',
        isMe: id === userId,
      };
    });
    return { period, entries, myRank: myIdx < 0 ? null : myIdx + 1 };
  })
);

// ---------------- Tổng quan tiến độ ----------------
progressRouter.get(
  '/progress',
  handler(async (req) => {
    const userId = me(req).id;
    const today = vnDate();
    const from112 = addDays(today, -16 * 7 + 1);
    const [user, acts, fullAttempts, answerStats, cardsDue, mistakesOpen, attemptsCount, wordsMastered, speed] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      prisma.dailyActivity.findMany({ where: { userId, activityDate: { gte: from112 } }, orderBy: { activityDate: 'asc' } }),
      prisma.examAttempt.findMany({
        where: { userId, mode: 'FULL', status: 'COMPLETED' },
        include: { test: { select: { examType: true } } },
        orderBy: { submittedAt: 'asc' },
        take: 50,
      }),
      prisma.$queryRaw<{ part: string; skill: string; correct: bigint; total: bigint }[]>`
        SELECT q.part::text AS part, q.skill::text AS skill,
               count(*) FILTER (WHERE a.is_correct) AS correct, count(*) AS total
        FROM attempt_answers a JOIN exam_attempts e ON e.id = a.attempt_id JOIN questions q ON q.id = a.question_id
        WHERE e.user_id = ${userId}::uuid AND a.is_correct IS NOT NULL GROUP BY q.part, q.skill`,
      prisma.srsCard.count({ where: { userId, status: { not: 'SUSPENDED' }, nextReviewAt: { lte: new Date() } } }),
      prisma.mistakeEntry.count({ where: { userId, isResolved: false } }),
      prisma.examAttempt.count({ where: { userId, status: { in: ['COMPLETED', 'GRADING'] } } }),
      prisma.srsCard.count({ where: { userId, wordId: { not: null }, status: 'MASTERED' } }),
      prisma.$queryRaw<{ avg_ms: number | null }[]>`SELECT avg(a.time_spent_ms) AS avg_ms FROM attempt_answers a JOIN exam_attempts e ON e.id = a.attempt_id
        WHERE e.user_id = ${userId}::uuid AND a.time_spent_ms > 0`,
    ]);

    const actMap = new Map(acts.map((a) => [a.activityDate.toISOString().slice(0, 10), a]));
    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6).toISOString().slice(0, 10);
      const a = actMap.get(d);
      return { date: d, minutes: a?.minutes ?? 0, questions: a?.questionsAnswered ?? 0 };
    });
    const heatmap: Record<string, number> = {};
    for (let i = 0; i < 16 * 7; i++) {
      const d = addDays(today, -i).toISOString().slice(0, 10);
      heatmap[d] = actMap.get(d)?.minutes ?? 0;
    }

    // Accuracy theo Part (SKILL_SCORES) và theo kỹ năng (RADAR)
    const byPart = new Map<string, { c: number; t: number }>();
    const bySkill = { Listening: { c: 0, t: 0 }, Reading: { c: 0, t: 0 }, Grammar: { c: 0, t: 0 }, Vocabulary: { c: 0, t: 0 } };
    for (const r of answerStats) {
      const fe = partToFe(r.part as never);
      const agg = byPart.get(fe) ?? { c: 0, t: 0 };
      agg.c += Number(r.correct);
      agg.t += Number(r.total);
      byPart.set(fe, agg);
      const key = r.skill === 'GRAMMAR' || r.part === 'TOEIC_P5' ? 'Grammar' : r.skill === 'VOCABULARY' ? 'Vocabulary' : isListeningPart(r.part as never) ? 'Listening' : 'Reading';
      bySkill[key].c += Number(r.correct);
      bySkill[key].t += Number(r.total);
    }
    const pct = (x: { c: number; t: number }) => (x.t ? Math.round((x.c / x.t) * 100) : 0);
    const partOrder = ['PART_1', 'PART_2', 'PART_3', 'PART_4', 'PART_5', 'PART_6', 'PART_7', 'VSTEP_LISTENING', 'VSTEP_READING'];
    const skillScores = partOrder.filter((p) => byPart.has(p)).map((p) => ({ skill: p.startsWith('PART_') ? `Part ${p.slice(5)}` : p.replace('VSTEP_', 'VSTEP ').toLowerCase().replace(/^vstep (\w)/, (_, c) => `VSTEP ${c.toUpperCase()}`), score: pct(byPart.get(p)!), max: 100 }));
    const avgSec = speed[0]?.avg_ms ? Number(speed[0].avg_ms) / 1000 : null;
    const radar = [
      { label: 'Listening', value: pct(bySkill.Listening) },
      { label: 'Reading', value: pct(bySkill.Reading) },
      { label: 'Grammar', value: pct(bySkill.Grammar) },
      { label: 'Vocabulary', value: pct(bySkill.Vocabulary) },
      // Tốc độ: 30 giây/câu = 100, mỗi giây chậm hơn trừ 2 điểm
      { label: 'Speed', value: avgSec === null ? 0 : Math.max(0, Math.min(100, Math.round(100 - (avgSec - 30) * 2))) },
    ];

    const toeicHistory = fullAttempts.filter((a) => a.test?.examType === 'TOEIC').map((a) => Number(a.scoreTotal ?? 0));
    const vstepHistory = fullAttempts.filter((a) => a.test?.examType === 'VSTEP').map((a) => Number(a.scoreTotal ?? 0));
    const totalMinutes = await prisma.dailyActivity.aggregate({ where: { userId }, _sum: { minutes: true, questionsAnswered: true } });
    return {
      dailyActivity,
      heatmap,
      scoreHistory: toeicHistory.slice(-7),
      vstepScoreHistory: vstepHistory.slice(-7),
      skillScores,
      radar,
      totals: {
        minutes: totalMinutes._sum.minutes ?? 0,
        questions: totalMinutes._sum.questionsAnswered ?? 0,
        attempts: attemptsCount,
        streak: user.streakCurrent,
        longestStreak: user.streakLongest,
        xp: user.xpTotal,
        cardsDue,
        mistakesOpen,
        wordsMastered,
        bestToeic: toeicHistory.length ? Math.max(...toeicHistory) : null,
        latestToeic: toeicHistory.at(-1) ?? null,
        todayMinutes: actMap.get(today.toISOString().slice(0, 10))?.minutes ?? 0,
        dailyGoalMinutes: Number((user.settings as { dailyGoalMinutes?: number } | null)?.dailyGoalMinutes ?? 20),
      },
    };
  })
);

/** Ghi thời gian học (xem video, đọc bài…) để tính streak/heatmap */
progressRouter.post(
  '/activity',
  handler(async (req) => {
    const body = parse(z.object({ minutes: z.number().int().min(1).max(240), lessons: z.number().int().min(0).max(20).optional() }), req.body);
    const { recordActivity } = await import('./learner.shared');
    await prisma.$transaction((tx) => recordActivity(tx, me(req).id, { minutes: body.minutes, lessons: body.lessons, xp: body.minutes }));
    return { ok: true };
  })
);
