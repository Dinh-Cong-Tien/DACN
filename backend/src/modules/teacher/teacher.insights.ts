/**
 * /api/v1/teacher — bám theo các trang của học viên:
 * - Chi tiết một lượt làm bài của học viên (như trang Kết quả bài thi của học viên): theo Part + từng câu.
 * - Bảng xếp hạng lớp (cùng cách tính điểm nỗ lực với Bảng vinh danh của học viên, lọc trong lớp).
 */
import { Router, type Request } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { handler, me, notFound, parse } from '../../core/http';
import { iso } from '../../core/dto';
import { resultOf } from '../learner/attempts';
import { partToFe } from '../learner/learner.shared';
import { assertClass, assertStudent, initialsOf } from './teacher.service';

export const insightsRouter = Router();
const uuid = z.string().uuid();
const P = (req: Request, k = 'id') => parse(uuid, req.params[k]);
const MODE_LABEL: Record<string, string> = { FULL: 'Thi thử', PRACTICE: 'Luyện Part', ADAPTIVE: 'Thích ứng', DRILL: 'Luyện điểm yếu', PART_SESSION: 'Luyện Part', LESSON_QUIZ: 'Bài kiểm tra', DICTATION: 'Chép chính tả' };

insightsRouter.get(
  '/students/:id/attempts/:attemptId',
  handler(async (req) => {
    const student = await assertStudent(me(req), P(req));
    const attemptId = P(req, 'attemptId');
    const a = await prisma.examAttempt.findFirst({ where: { id: attemptId, userId: student.id }, include: { test: { select: { title: true, examType: true } }, passage: { select: { title: true } } } });
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
  })
);

insightsRouter.get(
  '/classes/:id/leaderboard',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    const { period } = parse(z.object({ period: z.enum(['week', 'month', 'all']).default('week') }), req.query);
    const members = await prisma.classMember.findMany({
      where: { classId: c.id, status: 'ACTIVE' },
      include: { student: { select: { id: true, fullName: true, avatarUrl: true, xpTotal: true, streakCurrent: true, lastActiveAt: true } } },
    });
    const ids = members.map((m) => m.studentId);
    let points = new Map<string, number>();
    if (period === 'all') points = new Map(members.map((m) => [m.studentId, m.student.xpTotal]));
    else if (ids.length) {
      // Tuần bắt đầu thứ Hai / tháng bắt đầu ngày 1 (giờ Việt Nam) — giống Bảng vinh danh của học viên
      const now = new Date(Date.now() + 7 * 3600_000);
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const from = period === 'week' ? new Date(today.getTime() - ((today.getUTCDay() + 6) % 7) * 86400_000) : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
      const rows = await prisma.dailyActivity.groupBy({ by: ['userId'], where: { userId: { in: ids }, activityDate: { gte: from } }, _sum: { xp: true, minutes: true } });
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
  })
);
