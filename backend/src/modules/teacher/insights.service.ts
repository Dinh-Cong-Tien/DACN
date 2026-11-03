/**
 * Số liệu "nhìn vào học viên" dùng chung cho giáo viên và trưởng bộ môn/admin:
 * tiến độ tự học, sổ lỗi sai, chi tiết một lượt làm bài, bảng xếp hạng lớp.
 * Mỗi role tự kiểm tra phạm vi trước khi gọi.
 */
import { prisma } from '../../lib/prisma';
import { notFound } from '../../core/http';
import { iso, ymd } from '../../core/dto';
import { resultOf } from '../learner/attempts';
import { partToFe } from '../learner/learner.shared';
import { initialsOf } from './teacher.service';

export const MODE_LABEL: Record<string, string> = { FULL: 'Thi thử', PRACTICE: 'Luyện Part', ADAPTIVE: 'Thích ứng', DRILL: 'Luyện điểm yếu', PART_SESSION: 'Luyện Part', LESSON_QUIZ: 'Bài kiểm tra', DICTATION: 'Chép chính tả' };

type StudentRow = { id: string; streakCurrent: number; xpTotal: number; lastActiveAt: Date | null; createdAt: Date };

/** Tự học: mục tiêu, 7 ngày gần nhất, từ vựng, lỗi sai chưa xử lý, khoá học — như trang Tổng quan của học viên */
export async function selfStudyOf(user: StudentRow) {
  const weekAgo = new Date(Date.now() - 7 * 86400_000);
  const [goal, activity, cardsLearned, cardsDue, openMistakes, enrollments] = await Promise.all([
    prisma.learningGoal.findFirst({ where: { userId: user.id, isActive: true } }),
    prisma.dailyActivity.findMany({ where: { userId: user.id, activityDate: { gte: weekAgo } }, select: { minutes: true, questionsAnswered: true, lessonsCompleted: true, cardsReviewed: true } }),
    prisma.srsCard.count({ where: { userId: user.id, repetitions: { gt: 0 } } }),
    prisma.srsCard.count({ where: { userId: user.id, nextReviewAt: { lte: new Date() } } }),
    prisma.mistakeEntry.count({ where: { userId: user.id, isResolved: false } }),
    prisma.courseEnrollment.findMany({ where: { userId: user.id }, include: { course: { select: { title: true, slug: true } } }, orderBy: { updatedAt: 'desc' }, take: 6 }),
  ]);
  const sum = (k: 'minutes' | 'questionsAnswered' | 'lessonsCompleted' | 'cardsReviewed') => activity.reduce((a, d) => a + d[k], 0);
  return {
    goal: goal ? { examType: goal.examType, score: goal.targetScore ? String(goal.targetScore) : (goal.targetLevel ?? ''), examDate: ymd(goal.targetDate) } : null,
    week: { minutes: sum('minutes'), questions: sum('questionsAnswered'), lessons: sum('lessonsCompleted'), cards: sum('cardsReviewed'), activeDays: activity.filter((d) => d.minutes > 0 || d.questionsAnswered > 0).length },
    streak: user.streakCurrent,
    xp: user.xpTotal,
    lastActiveAt: (user.lastActiveAt ?? user.createdAt).toISOString(),
    vocab: { learned: cardsLearned, due: cardsDue },
    openMistakes,
    courses: enrollments.map((e) => ({ slug: e.course.slug, title: e.course.title, progress: Math.round(Number(e.progressPct)), completed: !!e.completedAt })),
  };
}

/** Sổ lỗi sai: nguyên nhân + 5 chủ điểm sai nhiều nhất (chưa xử lý) */
export async function mistakeSummaryOf(userId: string) {
  const [causes, tags] = await Promise.all([
    prisma.mistakeEntry.groupBy({ by: ['cause'], where: { userId, isResolved: false }, _count: { _all: true } }),
    prisma.mistakeEntry.groupBy({ by: ['tagId'], where: { userId, isResolved: false, tagId: { not: null } }, _count: { _all: true }, orderBy: { _count: { tagId: 'desc' } }, take: 5 }),
  ]);
  const tagRows = tags.length ? await prisma.skillTag.findMany({ where: { id: { in: tags.map((t) => t.tagId!) } }, select: { id: true, name: true } }) : [];
  return {
    mistakeCauses: causes.map((c) => ({ cause: c.cause, count: c._count._all })).sort((a, b) => b.count - a.count),
    weakTags: tags.map((t) => ({ tagId: t.tagId!, name: tagRows.find((r) => r.id === t.tagId)?.name ?? '', count: t._count._all })),
  };
}

/** Chi tiết 1 lượt làm bài — cùng nội dung trang Kết quả bài thi của học viên */
export async function attemptDetailOf(studentId: string, attemptId: string) {
  const a = await prisma.examAttempt.findFirst({ where: { id: attemptId, userId: studentId }, include: { test: { select: { title: true, examType: true } }, passage: { select: { title: true } } } });
  if (!a) throw notFound('Lượt làm bài');
  const r = await resultOf(a.id);
  const qs = await prisma.question.findMany({
    where: { id: { in: r.answers.map((x) => x.questionId) } },
    select: { id: true, part: true, stem: true, options: true, correctAnswer: true, explanationMd: true, passage: { select: { title: true } } },
  });
  const qmap = new Map(qs.map((q) => [q.id, q]));
  return {
    id: a.id,
    title: a.test?.title ?? a.passage?.title ?? MODE_LABEL[a.mode] ?? a.mode,
    examType: a.test?.examType,
    mode: a.mode,
    modeLabel: MODE_LABEL[a.mode] ?? a.mode,
    status: a.status,
    submittedAt: iso(a.submittedAt),
    summary: r.summary,
    partResults: r.partResults,
    cefr: r.cefr,
    answers: r.answers.map((x, i) => {
      const q = qmap.get(x.questionId);
      return {
        no: i + 1,
        questionId: x.questionId,
        part: q?.part ? partToFe(q.part) : undefined,
        stem: q?.stem ?? '',
        passageTitle: q?.passage?.title ?? undefined,
        options: (q?.options as { key: string; text: string }[] | null) ?? [],
        correctKey: ((q?.correctAnswer as { keys?: string[] } | null)?.keys ?? [])[0],
        selectedKey: x.selectedKey,
        textAnswer: x.textAnswer,
        audioUrl: x.audioUrl,
        isCorrect: x.isCorrect,
        explanation: q?.explanationMd ?? undefined,
        grading: x.grading,
      };
    }),
  };
}

export type LeaderboardPeriod = 'week' | 'month' | 'all';

/** Xếp hạng trong lớp — cùng cách tính điểm nỗ lực với Bảng vinh danh của học viên */
export async function classLeaderboardOf(classId: string, period: LeaderboardPeriod) {
  const members = await prisma.classMember.findMany({
    where: { classId, status: 'ACTIVE' },
    include: { student: { select: { id: true, fullName: true, avatarUrl: true, xpTotal: true, streakCurrent: true, lastActiveAt: true } } },
  });
  const ids = members.map((m) => m.studentId);
  let points = new Map<string, number>();
  if (period === 'all') points = new Map(members.map((m) => [m.studentId, m.student.xpTotal]));
  else if (ids.length) {
    // Tuần bắt đầu thứ Hai / tháng bắt đầu ngày 1 (giờ Việt Nam)
    const now = new Date(Date.now() + 7 * 3600_000);
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const from = period === 'week' ? new Date(today.getTime() - ((today.getUTCDay() + 6) % 7) * 86400_000) : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const rows = await prisma.dailyActivity.groupBy({ by: ['userId'], where: { userId: { in: ids }, activityDate: { gte: from } }, _sum: { xp: true } });
    points = new Map(rows.map((r) => [r.userId, r._sum.xp ?? 0]));
  }
  const list = members
    .map((m) => ({ userId: m.studentId, name: m.student.fullName, initials: initialsOf(m.student.fullName), avatarUrl: m.student.avatarUrl ?? undefined, points: points.get(m.studentId) ?? 0, streak: m.student.streakCurrent, lastActiveAt: iso(m.student.lastActiveAt) }))
    .sort((x, y) => y.points - x.points || y.streak - x.streak || x.name.localeCompare(y.name, 'vi'));
  let rank = 0;
  let prev = -1;
  return {
    period,
    entries: list.map((e, i) => {
      if (e.points !== prev) rank = i + 1;
      prev = e.points;
      return { ...e, rank };
    }),
  };
}
