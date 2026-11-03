/**
 * /api/v1/head — giám sát những gì giáo viên làm trong lớp và kết quả học viên (phạm vi bộ môn; ADMIN = toàn hệ thống).
 * Bài tập các lớp · Kết quả thi của học viên · Tài liệu & bảng tin lớp · Hồ sơ học tập học viên.
 */
import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { handler, me, notFound, pageQuery, paged, parse } from '../../core/http';
import { iso, num, planOf, ymd } from '../../core/dto';
import { audit, notify } from '../admin/audit';
import { classWhere, deptScope } from './shared';
import { marksOf } from '../../core/metrics';
import { submissionInclude, toAssignments, toSubmission, formatSize } from '../teacher/teacher.service';
import { attemptDetailOf, classLeaderboardOf, mistakeSummaryOf, selfStudyOf } from '../teacher/insights.service';
import { periodQuery } from '../teacher/teacher.insights';

export const oversightRouter = Router();

const uuid = z.string().uuid();
const P = (req: Request) => parse(uuid, req.params.id);
const DONE_ATTEMPT = ['SUBMITTED', 'GRADING', 'COMPLETED'] as const;
const MODE_LABEL: Record<string, string> = { FULL: 'Thi thử', PRACTICE: 'Luyện Part', ADAPTIVE: 'Thích ứng', DRILL: 'Luyện điểm yếu', PART_SESSION: 'Luyện Part', LESSON_QUIZ: 'Bài kiểm tra', DICTATION: 'Chép chính tả' };

/** Học viên trong phạm vi: trưởng bộ môn chỉ xem học viên trong lớp thuộc bộ môn; admin xem mọi học viên */
async function scopeStudent(req: Request, id: string) {
  const classes = await scopeClasses(req);
  const memberships = await prisma.classMember.findMany({ where: { studentId: id, classId: { in: classes.map((c) => c.id) } }, orderBy: { joinedAt: 'desc' } });
  const user = await prisma.user.findFirst({ where: { id, deletedAt: null, role: 'STUDENT' } });
  if (!user || (me(req).role !== 'ADMIN' && !memberships.length)) throw notFound('Học viên');
  return { user, classes, memberships };
}

/** Các lớp trong phạm vi (có thể lọc 1 lớp) */
async function scopeClasses(req: Request, classId?: string) {
  const scope = await deptScope(me(req));
  return prisma.class.findMany({
    where: { ...classWhere(scope), ...(classId ? { id: classId } : {}) },
    select: { id: true, name: true, examType: true, teacherId: true, teacher: { select: { fullName: true } } },
  });
}

// ======================= Bài tập các lớp =======================
oversightRouter.get(
  '/assignments',
  handler(async (req) => {
    const q = parse(z.object({ classId: uuid.optional(), teacherId: uuid.optional(), status: z.enum(['OPEN', 'OVERDUE', 'CLOSED']).optional(), q: z.string().max(100).optional() }), req.query);
    const classes = (await scopeClasses(req, q.classId)).filter((c) => !q.teacherId || c.teacherId === q.teacherId);
    const now = new Date();
    const rows = await prisma.assignment.findMany({
      where: {
        classId: { in: classes.map((c) => c.id) },
        deletedAt: null,
        status: q.status === 'CLOSED' ? 'CLOSED' : q.status ? 'OPEN' : { not: 'DRAFT' },
        ...(q.status === 'OVERDUE' ? { dueAt: { lt: now } } : q.status === 'OPEN' ? { OR: [{ dueAt: null }, { dueAt: { gte: now } }] } : {}),
        ...(q.q ? { title: { contains: q.q, mode: 'insensitive' as const } } : {}),
      },
      include: { class: { select: { name: true, examType: true } }, createdBy: { select: { fullName: true } } },
      orderBy: [{ dueAt: 'desc' }, { createdAt: 'desc' }],
      take: 500,
    });
    const graded = rows.length
      ? await prisma.assignmentSubmission.groupBy({ by: ['assignmentId'], where: { assignmentId: { in: rows.map((r) => r.id) }, status: 'GRADED' }, _count: { _all: true } })
      : [];
    const mapped = await toAssignments(rows);
    return mapped.map((a, i) => {
      const r = rows[i];
      const c = classes.find((x) => x.id === r.classId);
      return {
        ...a,
        examType: r.class.examType,
        teacherId: c?.teacherId,
        teacherName: r.createdBy?.fullName ?? c?.teacher.fullName ?? '',
        graded: graded.find((g) => g.assignmentId === r.id)?._count._all ?? 0,
        overdue: r.status === 'OPEN' && !!r.dueAt && r.dueAt < now,
      };
    });
  })
);

oversightRouter.get(
  '/assignments/:id',
  handler(async (req) => {
    const scope = await deptScope(me(req));
    const a = await prisma.assignment.findFirst({
      where: { id: P(req), deletedAt: null, status: { not: 'DRAFT' }, class: classWhere(scope) },
      include: { class: { select: { name: true, examType: true, teacher: { select: { fullName: true } } } } },
    });
    if (!a) throw notFound('Bài tập');
    const subs = await prisma.assignmentSubmission.findMany({ where: { assignmentId: a.id }, include: submissionInclude, orderBy: [{ submittedAt: 'desc' }] });
    return {
      ...(await toAssignments([a]))[0],
      teacherName: a.class.teacher.fullName,
      submissions: subs.map((s) => ({ ...toSubmission(s), state: s.status })),
    };
  })
);

// ======================= Kết quả thi của học viên =======================
oversightRouter.get(
  '/results',
  handler(async (req) => {
    const q = parse(pageQuery.extend({ classId: uuid.optional(), examType: z.enum(['TOEIC', 'VSTEP']).optional(), mode: z.enum(['FULL', 'PRACTICE', 'OTHER']).optional() }), req.query);
    const skip = (q.page - 1) * q.pageSize;
    const classes = await scopeClasses(req, q.classId);
    const members = await prisma.classMember.findMany({ where: { classId: { in: classes.map((c) => c.id) }, status: 'ACTIVE' }, select: { classId: true, studentId: true } });
    const classOf = new Map<string, string>();
    for (const m of members) if (!classOf.has(m.studentId)) classOf.set(m.studentId, classes.find((c) => c.id === m.classId)?.name ?? '');
    const where: Prisma.ExamAttemptWhereInput = {
      userId: { in: [...classOf.keys()] },
      status: { in: [...DONE_ATTEMPT] },
      ...(q.mode === 'FULL' ? { mode: 'FULL' } : q.mode === 'PRACTICE' ? { mode: { in: ['PRACTICE', 'PART_SESSION'] } } : q.mode === 'OTHER' ? { mode: { notIn: ['FULL', 'PRACTICE', 'PART_SESSION'] } } : {}),
      ...(q.examType ? { OR: [{ test: { examType: q.examType } }, { testId: null, user: { classMemberStudents: { some: { class: { examType: q.examType } } } } }] } : {}),
      ...(q.q ? { user: { fullName: { contains: q.q, mode: 'insensitive' } } } : {}),
    };
    const [total, rows, full] = await Promise.all([
      prisma.examAttempt.count({ where }),
      prisma.examAttempt.findMany({
        where,
        include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true } }, test: { select: { title: true, examType: true } } },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: q.pageSize,
      }),
      prisma.examAttempt.findMany({ where: { ...where, mode: 'FULL', scoreTotal: { not: null } }, select: { userId: true, scoreTotal: true, test: { select: { examType: true } } } }),
    ]);
    const avgOf = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);
    const toeic = full.filter((f) => f.test?.examType === 'TOEIC').map((f) => Number(f.scoreTotal));
    const vstep = full.filter((f) => f.test?.examType === 'VSTEP').map((f) => Number(f.scoreTotal));
    return {
      ...paged(
        rows.map((a) => ({
          id: a.id,
          studentId: a.user.id,
          studentName: a.user.fullName,
          email: a.user.email,
          avatarUrl: a.user.avatarUrl ?? undefined,
          className: classOf.get(a.userId) ?? '',
          testTitle: a.test?.title ?? MODE_LABEL[a.mode] ?? a.mode,
          examType: a.test?.examType,
          mode: a.mode,
          purpose: a.purpose,
          score: num(a.scoreTotal),
          listening: num(a.scoreListening),
          reading: num(a.scoreReading),
          writing: num(a.scoreWriting),
          speaking: num(a.scoreSpeaking),
          cefr: a.cefrResult ?? undefined,
          correct: a.correctCount ?? undefined,
          total: a.totalCount,
          durationSec: a.timeSpentSec,
          status: a.status,
          submittedAt: iso(a.submittedAt),
        })),
        total,
        q
      ),
      summary: { attempts: total, fullTests: full.length, students: new Set(full.map((f) => f.userId)).size, avgToeic: avgOf(toeic), avgVstep: avgOf(vstep) },
    };
  })
);

// ======================= Tài liệu & bảng tin lớp =======================
const classLite = { select: { id: true, name: true, teacher: { select: { fullName: true } } } } as const;

oversightRouter.get(
  '/materials',
  handler(async (req) => {
    const q = parse(z.object({ classId: uuid.optional() }), req.query);
    const classes = await scopeClasses(req, q.classId);
    const rows = await prisma.material.findMany({
      where: { classId: { in: classes.map((c) => c.id) }, deletedAt: null },
      include: { class: classLite, uploadedBy: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((m) => ({
      id: m.id,
      classId: m.classId,
      className: m.class?.name ?? '',
      teacherName: m.uploadedBy?.fullName ?? m.class?.teacher.fullName ?? '',
      title: m.title,
      description: m.description ?? undefined,
      type: m.type,
      category: m.category ?? undefined,
      url: m.fileUrl ?? '',
      size: formatSize(m.sizeBytes),
      downloads: m.downloadsCount,
      createdAt: m.createdAt.toISOString(),
    }));
  })
);

oversightRouter.get(
  '/announcements',
  handler(async (req) => {
    const q = parse(z.object({ classId: uuid.optional() }), req.query);
    const classes = await scopeClasses(req, q.classId);
    const rows = await prisma.classAnnouncement.findMany({
      where: { classId: { in: classes.map((c) => c.id) }, deletedAt: null },
      include: { class: classLite, author: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const reads = rows.length
      ? await prisma.notification.groupBy({ by: ['refId'], where: { refType: 'ANNOUNCEMENT', refId: { in: rows.map((r) => r.id) }, readAt: { not: null } }, _count: { _all: true } })
      : [];
    const sizes = rows.length ? await prisma.classMember.groupBy({ by: ['classId'], where: { classId: { in: [...new Set(rows.map((r) => r.classId))] }, status: 'ACTIVE' }, _count: { _all: true } }) : [];
    return rows.map((a) => ({
      id: a.id,
      classId: a.classId,
      className: a.class.name,
      teacherName: a.author?.fullName ?? a.class.teacher.fullName,
      title: a.title,
      body: a.body,
      pinned: a.isPinned,
      readCount: reads.find((r) => r.refId === a.id)?._count._all ?? a.readCount,
      classSize: sizes.find((s) => s.classId === a.classId)?._count._all ?? 0,
      createdAt: a.createdAt.toISOString(),
    }));
  })
);

/** Gỡ tài liệu / bảng tin không phù hợp: xoá mềm, ghi nhật ký, báo giáo viên kèm lý do */
const removeBody = z.object({ reason: z.string().trim().min(3, 'Nhập lý do gỡ (ít nhất 3 ký tự)').max(500) });

oversightRouter.delete(
  '/materials/:id',
  handler(async (req) => {
    const { reason } = parse(removeBody, req.body ?? {});
    const scope = await deptScope(me(req));
    const m = await prisma.material.findFirst({ where: { id: P(req), deletedAt: null, class: classWhere(scope) }, include: { class: { select: { name: true, teacherId: true } } } });
    if (!m) throw notFound('Tài liệu');
    await prisma.material.update({ where: { id: m.id }, data: { deletedAt: new Date() } });
    await audit(req, 'MATERIAL_REMOVE', 'material', m.id, { before: { title: m.title }, after: { reason } });
    const to = m.uploadedById ?? m.class?.teacherId;
    await notify([to], { type: 'CLASS', title: `Tài liệu "${m.title}" đã bị gỡ`, message: `Lớp ${m.class?.name ?? ''} · Lý do: ${reason}`, link: '/teacher/materials' });
    return { ok: true };
  })
);

oversightRouter.delete(
  '/announcements/:id',
  handler(async (req) => {
    const { reason } = parse(removeBody, req.body ?? {});
    const scope = await deptScope(me(req));
    const a = await prisma.classAnnouncement.findFirst({ where: { id: P(req), deletedAt: null, class: classWhere(scope) }, include: { class: { select: { id: true, name: true, teacherId: true } } } });
    if (!a) throw notFound('Bảng tin');
    await prisma.classAnnouncement.update({ where: { id: a.id }, data: { deletedAt: new Date() } });
    await audit(req, 'ANNOUNCEMENT_REMOVE', 'class_announcement', a.id, { before: { title: a.title }, after: { reason } });
    await notify([a.authorId ?? a.class.teacherId], { type: 'CLASS', title: `Bảng tin "${a.title}" đã bị gỡ`, message: `Lớp ${a.class.name} · Lý do: ${reason}`, link: `/teacher/classes/${a.class.id}` });
    return { ok: true };
  })
);

// ======================= Hồ sơ học tập của học viên =======================
oversightRouter.get(
  '/students/:id',
  handler(async (req) => {
    const { user, classes, memberships } = await scopeStudent(req, P(req));
    const id = user.id;
    const classIds = memberships.map((m) => m.classId);
    const [goal, attempts, subs, notes, sessions, self, mistakes] = await Promise.all([
      prisma.learningGoal.findFirst({ where: { userId: id, isActive: true } }),
      prisma.examAttempt.findMany({ where: { userId: id, status: { in: [...DONE_ATTEMPT] } }, include: { test: { select: { title: true, examType: true } } }, orderBy: { submittedAt: 'desc' }, take: 20 }),
      prisma.assignmentSubmission.findMany({ where: { studentId: id, assignment: { classId: { in: classIds }, deletedAt: null, status: { not: 'DRAFT' } } }, include: { ...submissionInclude, assignment: { select: { id: true, title: true, type: true, maxScore: true, classId: true, dueAt: true } } }, orderBy: { updatedAt: 'desc' }, take: 40 }),
      prisma.studentNote.findMany({ where: { studentId: id, deletedAt: null, OR: [{ classId: { in: classIds } }, { classId: null }] }, include: { teacher: { select: { fullName: true } } }, orderBy: [{ noteDate: 'desc' }, { createdAt: 'desc' }], take: 30 }),
      prisma.classSession.findMany({ where: { classId: { in: classIds }, status: 'DONE' }, select: { classId: true, sessionDate: true, attendance: true }, orderBy: { sessionDate: 'desc' } }),
      selfStudyOf(user),
      mistakeSummaryOf(id),
    ]);
    const classRows = memberships.map((m) => {
      const c = classes.find((x) => x.id === m.classId)!;
      const marks = sessions.filter((s) => s.classId === m.classId).map((s) => marksOf(s.attendance)[id]).filter(Boolean);
      const mine = subs.filter((s) => s.assignment.classId === m.classId);
      const done = mine.filter((s) => ['SUBMITTED', 'LATE', 'GRADED'].includes(s.status)).length;
      return {
        id: c.id,
        name: c.name,
        examType: c.examType,
        teacherName: c.teacher.fullName,
        memberStatus: m.status,
        joinedAt: ymd(m.joinedAt),
        attendanceRate: marks.length ? Math.round((marks.filter((k) => k === 'PRESENT' || k === 'LATE').length / marks.length) * 100) : null,
        sessionsMarked: marks.length,
        absent: marks.filter((k) => k === 'ABSENT').length,
        assignmentsDone: done,
        assignmentsTotal: mine.length,
      };
    });
    return {
      student: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
        status: user.status,
        plan: await planOf(user.id),
        joinedAt: user.createdAt.toISOString(),
        lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
        streak: user.streakCurrent,
        xp: user.xpTotal,
        target: goal ? { examType: goal.examType, score: goal.targetScore ? String(goal.targetScore) : (goal.targetLevel ?? ''), examDate: ymd(goal.targetDate) } : undefined,
      },
      classes: classRows,
      attempts: attempts.map((a) => ({
        id: a.id,
        testTitle: a.test?.title ?? MODE_LABEL[a.mode] ?? a.mode,
        examType: a.test?.examType,
        mode: a.mode,
        score: num(a.scoreTotal),
        listening: num(a.scoreListening),
        reading: num(a.scoreReading),
        cefr: a.cefrResult ?? undefined,
        correct: a.correctCount ?? undefined,
        total: a.totalCount,
        durationSec: a.timeSpentSec,
        submittedAt: iso(a.submittedAt),
      })),
      submissions: subs.map((s) => ({ ...toSubmission(s), state: s.status, dueDate: iso(s.assignment.dueAt), className: classes.find((c) => c.id === s.assignment.classId)?.name ?? '' })),
      notes: notes.map((n) => ({ id: n.id, kind: n.kind, text: n.content, date: ymd(n.noteDate)!, teacherName: n.teacher.fullName, className: classes.find((c) => c.id === n.classId)?.name })),
      self,
      ...mistakes,
    };
  })
);

/** Chi tiết 1 lượt làm bài của học viên trong phạm vi */
oversightRouter.get(
  '/students/:id/attempts/:attemptId',
  handler(async (req) => {
    const { user } = await scopeStudent(req, P(req));
    return attemptDetailOf(user.id, parse(uuid, req.params.attemptId));
  })
);

/** Xếp hạng trong lớp — như tab Xếp hạng của giáo viên */
oversightRouter.get(
  '/classes/:id/leaderboard',
  handler(async (req) => {
    const [c] = await scopeClasses(req, P(req));
    if (!c) throw notFound('Lớp');
    return classLeaderboardOf(c.id, parse(periodQuery, req.query).period);
  })
);
