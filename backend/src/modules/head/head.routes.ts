/**
 * /api/v1/head — Trưởng bộ môn (giám sát chuyên môn trong phạm vi bộ môn của mình).
 * Luồng 10.7: #8 kiểm định chấm, #11 duyệt nội dung.
 */
import { Router, type Request } from 'express';
import { z } from 'zod';
import { Prisma, type ContentStatus, type ExamPart, type SkillType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { allow, auth, refreshLiveAfterWrite } from '../../core/auth';
import { badRequest, conflict, forbidden, handler, me, notFound, pageQuery, paged, parse } from '../../core/http';
import { audit, notify } from '../admin/audit';
import {
  classInclude,
  classStats,
  classWhere,
  deptScope,
  deptStudents,
  gradeOf,
  hhmm,
  lastMonths,
  teacherSummaries,
  ticketInclude,
  toClassRoom,
  toComplaint,
} from './shared';
import { oversightRouter } from './head.oversight';
import { summaryRouter } from './head.summary';

export const headRouter = Router();
headRouter.use(auth, allow('HEAD_TEACHER'), refreshLiveAfterWrite);
headRouter.use(oversightRouter);
headRouter.use(summaryRouter);

const scopeOf = (req: Request) => deptScope(me(req));
const uuid = z.string().uuid();
const idParam = (req: Request) => parse(uuid, req.params.id);

async function scopedClass(req: Request, id: string) {
  const scope = await scopeOf(req);
  const c = await prisma.class.findFirst({ where: { id, ...classWhere(scope) }, include: classInclude });
  if (!c) throw notFound('Lớp học');
  return c;
}

// ======================= Tổng quan =======================
headRouter.get(
  '/dashboard',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const classes = await prisma.class.findMany({ where: { ...classWhere(scope), isArchived: false }, include: { teacher: { select: { fullName: true, status: true, deletedAt: true } } } });
    const stats = await classStats(classes);
    const [pendingApprovals, pendingReviews, newComplaints, upcomingObs, teachers] = await Promise.all([
      scopedQueue(req).then((r) => r.length),
      prisma.grading.count({ where: { reviewStatus: 'PENDING', ...gradingScope(scope) } }),
      prisma.ticket.count({ where: { category: 'ACADEMIC', status: 'OPEN' } }),
      prisma.classSession.count({ where: { observerId: me(req).id, sessionDate: { gte: startOfToday() }, class: classWhere(scope) } }),
      prisma.user.findMany({ where: { deletedAt: null, role: { in: ['TEACHER', 'HEAD_TEACHER'] }, ...(scope ? { departmentId: { in: scope } } : {}) }, select: { status: true } }),
    ]);
    const conflicts = await roomConflicts(scope, startOfWeek(), addDays(startOfWeek(), 7));
    const ss = [...stats.values()];
    return {
      classesCount: classes.length,
      // Học viên KHÁC NHAU trong bộ môn (học viên học 2 lớp chỉ tính 1)
      studentsCount: new Set(ss.flatMap((s) => s.studentIds)).size,
      teachersCount: teachers.length,
      activeTeachers: teachers.filter((t) => t.status === 'ACTIVE').length,
      pendingApprovals,
      pendingReviews,
      newComplaints,
      upcomingObservations: upcomingObs,
      roomConflicts: conflicts.length,
      lowAttendanceClasses: classes.filter((c) => { const s = stats.get(c.id); return !!s && s.attendanceMarks > 0 && s.attendanceRate < 80; }).length,
      classesNeedTeacher: classes.filter((c) => c.teacher.status !== 'ACTIVE' || c.teacher.deletedAt).map((c) => ({ id: c.id, name: c.name, teacherName: c.teacher.fullName })),
    };
  })
);

// ======================= Môn học (bộ môn) =======================
const subjectBody = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(20),
  examType: z.enum(['TOEIC', 'VSTEP']),
  description: z.string().max(2000).nullish(),
  /** Chỉ ADMIN được chỉ định trưởng bộ môn; trưởng bộ môn tạo môn thì tự phụ trách */
  headId: z.string().uuid().nullish(),
});

/** headId phải là tài khoản trưởng bộ môn đang hoạt động */
async function resolveHead(req: Request, headId: string | null | undefined) {
  if (me(req).role !== 'ADMIN') return undefined;
  if (headId === undefined || headId === null) return headId;
  const u = await prisma.user.findFirst({ where: { id: headId, deletedAt: null, role: 'HEAD_TEACHER' }, select: { id: true } });
  if (!u) throw badRequest('Người phụ trách phải là tài khoản trưởng bộ môn', 'INVALID_HEAD');
  return u.id;
}

async function toSubjects(where: Prisma.DepartmentWhereInput) {
  const deps = await prisma.department.findMany({
    where: { deletedAt: null, ...where },
    include: {
      head: { select: { fullName: true } },
      userDepartments: { where: { deletedAt: null, role: { in: ['TEACHER', 'HEAD_TEACHER'] } }, select: { id: true } },
      classDepartments: { where: { deletedAt: null, isArchived: false }, select: { id: true } },
    },
    orderBy: { code: 'asc' },
  });
  const qCount = await prisma.question.groupBy({ by: ['examType'], where: { deletedAt: null, status: 'PUBLISHED' }, _count: true });
  return deps.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    examType: d.examType,
    teachersCount: d.userDepartments.length,
    classesCount: d.classDepartments.length,
    questionsCount: qCount.find((q) => q.examType === d.examType)?._count ?? 0,
    lead: d.head?.fullName ?? '',
    headId: d.headId ?? undefined,
    description: d.description ?? undefined,
  }));
}

headRouter.get(
  '/subjects',
  handler(async (req) => {
    const scope = await scopeOf(req);
    return toSubjects(scope ? { id: { in: scope } } : {});
  })
);
headRouter.post(
  '/subjects',
  handler(async (req) => {
    const { headId, ...body } = parse(subjectBody, req.body);
    const head = await resolveHead(req, headId);
    const d = await prisma.department.create({ data: { ...body, headId: me(req).role === 'ADMIN' ? (head ?? null) : me(req).id } });
    await audit(req, 'DEPARTMENT_CREATE', 'department', d.id, { after: body });
    return (await toSubjects({ id: d.id }))[0];
  })
);
headRouter.patch(
  '/subjects/:id',
  handler(async (req) => {
    const id = idParam(req);
    if (!(await prisma.department.findFirst({ where: { id, deletedAt: null }, select: { id: true } }))) throw notFound('Bộ môn');
    const scope = await scopeOf(req);
    if (scope && !scope.includes(id)) throw forbidden('Bộ môn này không thuộc phạm vi bạn phụ trách');
    const { headId, ...body } = parse(subjectBody.partial(), req.body);
    const head = await resolveHead(req, headId);
    await prisma.department.update({ where: { id }, data: { ...body, ...(head !== undefined ? { headId: head } : {}) } });
    if (head !== undefined) await audit(req, 'DEPARTMENT_HEAD_CHANGE', 'department', id, { after: { headId: head } });
    return (await toSubjects({ id }))[0];
  })
);
headRouter.delete(
  '/subjects/:id',
  handler(async (req) => {
    const id = idParam(req);
    if (!(await prisma.department.findFirst({ where: { id, deletedAt: null }, select: { id: true } }))) throw notFound('Bộ môn');
    const scope = await scopeOf(req);
    if (scope && !scope.includes(id)) throw forbidden('Bộ môn này không thuộc phạm vi bạn phụ trách');
    const inUse = await prisma.class.count({ where: { departmentId: id, deletedAt: null } });
    if (inUse) throw badRequest('Bộ môn còn lớp học, không thể xoá', 'IN_USE');
    await prisma.department.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit(req, 'DEPARTMENT_DELETE', 'department', id, { severity: 'WARN' });
    return { ok: true };
  })
);

// ======================= Giáo viên =======================
headRouter.get(
  '/teachers',
  handler(async (req) => {
    const scope = await scopeOf(req);
    return teacherSummaries(scope ? { departmentId: { in: scope } } : {});
  })
);

headRouter.get(
  '/teachers/:id',
  handler(async (req) => {
    const id = idParam(req);
    const scope = await scopeOf(req);
    const [summary] = await teacherSummaries({ id, ...(scope ? { departmentId: { in: scope } } : {}) });
    if (!summary) throw notFound('Giáo viên');
    const classes = await prisma.class.findMany({ where: { teacherId: id, deletedAt: null }, include: classInclude, orderBy: { name: 'asc' } });
    const stats = await classStats(classes);
    const from = startOfWeek();
    const sessions = await prisma.classSession.findMany({
      where: { OR: [{ teacherId: id }, { class: { teacherId: id } }], sessionDate: { gte: from, lt: addDays(from, 14) } },
      include: { class: { select: { id: true, name: true } } },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    });
    const observations = await prisma.classSession.findMany({
      where: { class: { teacherId: id }, observation: { not: Prisma.DbNull }, observerId: { not: null } },
      include: { class: { select: { id: true, teacher: { select: { fullName: true } } } } },
      orderBy: { sessionDate: 'desc' },
    });
    const reviews = await prisma.grading.findMany({ where: { graderId: id, reviewStatus: { not: null } }, select: { reviewStatus: true, totalScore: true, reviewTotal: true } });
    return {
      teacher: summary,
      classes: classes.map((c) => toClassRoom(c, stats.get(c.id))),
      sessions: sessions.map(toSessionRow),
      observations: observations.filter((o) => o.observation).map(toObservation),
      review: {
        total: reviews.length,
        agreed: reviews.filter((r) => r.reviewStatus === 'AGREED').length,
        adjusted: reviews.filter((r) => r.reviewStatus === 'ADJUSTED').length,
        pending: reviews.filter((r) => r.reviewStatus === 'PENDING').length,
        avgDeviation: avg(reviews.filter((r) => r.reviewTotal !== null).map((r) => Math.abs(Number(r.reviewTotal) - Number(r.totalScore)))),
      },
    };
  })
);

/** Gửi nhận xét chuyên môn cho giáo viên (thông báo) */
headRouter.post(
  '/teachers/:id/note',
  handler(async (req) => {
    const id = idParam(req);
    const scope = await scopeOf(req);
    const { text } = parse(z.object({ text: z.string().trim().min(2).max(2000) }), req.body);
    const t = await prisma.user.findFirst({ where: { id, deletedAt: null, role: { in: ['TEACHER', 'HEAD_TEACHER'] }, ...(scope ? { departmentId: { in: scope } } : {}) }, select: { id: true, fullName: true } });
    if (!t) throw notFound('Giáo viên');
    await notify([t.id], { type: 'REVIEW', title: 'Nhận xét từ trưởng bộ môn', message: text, link: '/teacher/dashboard', refType: 'USER', refId: t.id });
    await audit(req, 'TEACHER_NOTE', 'user', t.id, { after: { target: t.fullName, text: text.slice(0, 200) } });
    return { ok: true };
  })
);

/** Duyệt hồ sơ giáo viên (PENDING → ACTIVE) hoặc tạm khoá trong bộ môn */
headRouter.patch(
  '/teachers/:id',
  handler(async (req) => {
    const id = idParam(req);
    const scope = await scopeOf(req);
    const body = parse(z.object({ status: z.enum(['ACTIVE', 'LOCKED']), reason: z.string().max(500).optional() }), req.body);
    const t = await prisma.user.findFirst({ where: { id, deletedAt: null, role: 'TEACHER', ...(scope ? { departmentId: { in: scope } } : {}) } });
    if (!t) throw notFound('Giáo viên');
    await prisma.user.update({ where: { id }, data: { status: body.status, lockedReason: body.status === 'LOCKED' ? (body.reason ?? null) : null } });
    await audit(req, body.status === 'LOCKED' ? 'USER_LOCK' : 'USER_ACTIVATE', 'user', id, { severity: 'WARN', before: { status: t.status }, after: body });
    return (await teacherSummaries({ id }))[0];
  })
);

// ======================= Lớp học bộ môn =======================
headRouter.get(
  '/classes',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const classes = await prisma.class.findMany({ where: classWhere(scope), include: classInclude, orderBy: { createdAt: 'asc' } });
    const stats = await classStats(classes);
    return classes.map((c) => toClassRoom(c, stats.get(c.id)));
  })
);

headRouter.get(
  '/classes/:id',
  handler(async (req) => {
    const c = await scopedClass(req, idParam(req));
    const stats = (await classStats([c])).get(c.id);
    const [students, sessions, assignments] = await Promise.all([
      deptStudents([c]),
      prisma.classSession.findMany({ where: { classId: c.id }, include: { class: { select: { id: true, name: true } } }, orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }] }),
      prisma.assignment.findMany({
        where: { classId: c.id, deletedAt: null },
        include: { assignmentSubmissionAssignments: { select: { status: true, score: true } } },
        orderBy: { dueAt: 'desc' },
      }),
    ]);
    return {
      class: toClassRoom(c, stats),
      analytics: await classAnalytics(c.id, c.examType),
      students,
      sessions: sessions.map(toSessionRow),
      observations: sessions.filter((s) => s.observation).map((s) => toObservation({ ...s, class: { id: c.id, teacher: { fullName: c.teacher.fullName } } })),
      assignments: assignments.map((a) => {
        const subs = a.assignmentSubmissionAssignments;
        const graded = subs.filter((s) => s.score !== null);
        return {
          id: a.id,
          title: a.title,
          type: a.type,
          dueAt: a.dueAt?.toISOString(),
          status: a.status,
          submitted: subs.filter((s) => ['SUBMITTED', 'LATE', 'GRADED'].includes(s.status)).length,
          total: subs.length,
          avgScore: graded.length ? avg(graded.map((s) => Number(s.score))) : null,
          maxScore: Number(a.maxScore),
        };
      }),
    };
  })
);

/** Xu hướng điểm thi thử theo tháng + tỷ lệ đúng theo Part của học viên trong lớp (dữ liệu thật) */
async function classAnalytics(classId: string, examType: 'TOEIC' | 'VSTEP') {
  const ids = (await prisma.classMember.findMany({ where: { classId, status: 'ACTIVE' }, select: { studentId: true } })).map((m) => m.studentId);
  if (!ids.length) return { trend: { labels: [] as string[], values: [] as number[] }, accuracy: [] as { part: string; rate: number; total: number }[] };
  const ms = lastMonths(6);
  const attempts = await prisma.examAttempt.findMany({
    where: { userId: { in: ids }, status: 'COMPLETED', mode: 'FULL', scoreTotal: { not: null }, submittedAt: { gte: ms[0].start }, test: { examType } },
    select: { scoreTotal: true, submittedAt: true },
  });
  const trend = {
    labels: ms.map((m) => m.label),
    values: ms.map((m) => avg(attempts.filter((a) => a.submittedAt! >= m.start && a.submittedAt! < m.end).map((a) => Number(a.scoreTotal)))),
  };
  const rows = await prisma.$queryRaw<{ part: string; total: bigint; correct: bigint }[]>`
    SELECT q.part::text AS part, count(*)::bigint AS total, count(*) FILTER (WHERE a.is_correct)::bigint AS correct
    FROM attempt_answers a JOIN questions q ON q.id = a.question_id JOIN exam_attempts e ON e.id = a.attempt_id
    WHERE e.user_id = ANY(${ids}::uuid[]) AND a.is_correct IS NOT NULL AND q.exam_type = ${examType}::exam_type
    GROUP BY q.part ORDER BY q.part`;
  return { trend, accuracy: rows.map((r) => ({ part: r.part, total: Number(r.total), rate: Math.round((Number(r.correct) / Number(r.total)) * 100) })) };
}

/** Gửi nhận xét của trưởng bộ môn cho giáo viên phụ trách lớp */
headRouter.post(
  '/classes/:id/note',
  handler(async (req) => {
    const c = await scopedClass(req, idParam(req));
    const { text } = parse(z.object({ text: z.string().trim().min(2).max(2000) }), req.body);
    await notify([c.teacherId], { type: 'REVIEW', title: `Nhận xét về lớp ${c.name}`, message: text, link: `/teacher/classes/${c.id}`, refType: 'CLASS', refId: c.id });
    await audit(req, 'CLASS_NOTE', 'class', c.id, { after: { target: c.name, text: text.slice(0, 200) } });
    return { ok: true };
  })
);

const classBody = z.object({
  name: z.string().trim().min(2).max(160),
  code: z.string().trim().min(3).max(16).optional(),
  examType: z.enum(['TOEIC', 'VSTEP']),
  teacherId: uuid,
  departmentId: uuid.optional(),
  level: z.string().max(20).nullish(),
  description: z.string().max(2000).nullish(),
  room: z.string().max(80).nullish(),
  scheduleText: z.string().max(120).nullish(),
  coverUrl: z.string().url().nullish(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  maxStudents: z.number().int().min(1).max(500).nullish(),
});
const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

/** Mở lớp mới trong bộ môn */
headRouter.post(
  '/classes',
  handler(async (req) => {
    const body = parse(classBody, req.body);
    const scope = await scopeOf(req);
    const departmentId = body.departmentId ?? scope?.[0];
    if (scope && departmentId && !scope.includes(departmentId)) throw forbidden();
    await assertTeacherInScope(body.teacherId, scope);
    const c = await prisma.class.create({ data: { ...body, departmentId, code: body.code ?? genCode() }, include: classInclude });
    await audit(req, 'CLASS_CREATE', 'class', c.id, { after: { name: c.name, teacherId: c.teacherId } });
    await notify([c.teacherId], { type: 'CLASS', title: 'Bạn được phân công lớp mới', message: `${c.name} · mã lớp ${c.code}`, link: `/teacher/classes/${c.id}`, refType: 'CLASS', refId: c.id });
    return toClassRoom(c);
  })
);

/** Đổi giáo viên phụ trách / cập nhật thông tin lớp / lưu trữ */
headRouter.patch(
  '/classes/:id',
  handler(async (req) => {
    const c = await scopedClass(req, idParam(req));
    const body = parse(classBody.partial().extend({ isArchived: z.boolean().optional() }), req.body);
    const scope = await scopeOf(req);
    if (body.teacherId) await assertTeacherInScope(body.teacherId, scope);
    const updated = await prisma.class.update({ where: { id: c.id }, data: body, include: classInclude });
    if (body.teacherId && body.teacherId !== c.teacherId) {
      await audit(req, 'CLASS_REASSIGN', 'class', c.id, { severity: 'WARN', before: { teacherId: c.teacherId }, after: { teacherId: body.teacherId } });
      await notify([body.teacherId], { type: 'CLASS', title: 'Bạn được phân công phụ trách lớp', message: updated.name, link: `/teacher/classes/${c.id}`, refType: 'CLASS', refId: c.id });
      await prisma.classSession.updateMany({ where: { classId: c.id, sessionDate: { gte: startOfToday() }, teacherId: c.teacherId }, data: { teacherId: body.teacherId } });
    }
    return toClassRoom(updated, (await classStats([updated])).get(updated.id));
  })
);

async function assertTeacherInScope(teacherId: string, scope: string[] | null) {
  const t = await prisma.user.findFirst({ where: { id: teacherId, deletedAt: null, role: { in: ['TEACHER', 'HEAD_TEACHER'] }, status: 'ACTIVE', ...(scope ? { departmentId: { in: scope } } : {}) } });
  if (!t) throw badRequest('Giáo viên không thuộc bộ môn hoặc chưa hoạt động', 'INVALID_TEACHER');
}

// ======================= Học viên bộ môn =======================
headRouter.get(
  '/students',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const classes = await prisma.class.findMany({ where: { ...classWhere(scope), isArchived: false }, select: { id: true, examType: true } });
    return deptStudents(classes);
  })
);

/** Nhắc giáo viên chủ nhiệm về học viên có nguy cơ */
headRouter.post(
  '/students/:id/remind-teacher',
  handler(async (req) => {
    const studentId = idParam(req);
    const { classId, note } = parse(z.object({ classId: uuid, note: z.string().max(500).optional() }), req.body);
    const c = await scopedClass(req, classId);
    const member = await prisma.classMember.findUnique({ where: { classId_studentId: { classId: c.id, studentId } }, include: { student: { select: { fullName: true } } } });
    if (!member || member.status !== 'ACTIVE') throw notFound('Học viên trong lớp');
    const s = member.student;
    await notify([c.teacherId], { type: 'CLASS', title: `Theo dõi học viên ${s.fullName}`, message: note ?? `Trưởng bộ môn đề nghị liên hệ học viên ${s.fullName} (lớp ${c.name}).`, link: `/teacher/students?id=${studentId}`, refType: 'CLASS', refId: c.id });
    return { ok: true };
  })
);

// ======================= Lịch dạy bộ môn =======================
headRouter.get(
  '/schedule',
  handler(async (req) => {
    const q = parse(z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() }), req.query);
    const scope = await scopeOf(req);
    const from = q.from ?? startOfWeek();
    const to = q.to ?? addDays(from, 7);
    const sessions = await prisma.classSession.findMany({
      where: { sessionDate: { gte: from, lt: to }, class: classWhere(scope) },
      include: { class: { select: { id: true, name: true, examType: true, teacher: { select: { fullName: true } } } }, teacher: { select: { fullName: true } } },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    });
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      sessions: sessions.map((s) => ({ ...toSessionRow(s), teacher: s.teacher?.fullName ?? s.class.teacher.fullName, examType: s.class.examType })),
      conflicts: await roomConflicts(scope, from, to),
    };
  })
);

/** Trùng phòng: 2 buổi cùng ngày, cùng phòng, khoảng giờ giao nhau */
async function roomConflicts(scope: string[] | null, from: Date, to: Date) {
  const sessions = await prisma.classSession.findMany({
    where: { sessionDate: { gte: from, lt: to }, status: { not: 'CANCELLED' }, class: classWhere(scope) },
    include: { class: { select: { id: true, name: true, room: true } } },
  });
  const out: { date: string; room: string; start: string; end: string; sessions: { id: string; classId: string; className: string; start: string; end: string }[] }[] = [];
  for (let i = 0; i < sessions.length; i++)
    for (let j = i + 1; j < sessions.length; j++) {
      const a = sessions[i];
      const b = sessions[j];
      const roomA = (a.room ?? a.class.room ?? '').trim().toLowerCase();
      const roomB = (b.room ?? b.class.room ?? '').trim().toLowerCase();
      if (!roomA || roomA !== roomB || /online/.test(roomA) || a.sessionDate.getTime() !== b.sessionDate.getTime()) continue;
      if (a.startTime < b.endTime && b.startTime < a.endTime)
        out.push({
          date: a.sessionDate.toISOString().slice(0, 10),
          room: a.room ?? a.class.room ?? '',
          start: hhmm(a.startTime < b.startTime ? a.startTime : b.startTime),
          end: hhmm(a.endTime > b.endTime ? a.endTime : b.endTime),
          sessions: [a, b].map((s) => ({ id: s.id, classId: s.class.id, className: s.class.name, start: hhmm(s.startTime), end: hhmm(s.endTime) })),
        });
    }
  return out;
}

// ======================= Phê duyệt học liệu =======================
type QueueRow = { resource_type: string; id: string; title: string | null; author_id: string | null; updated_at: Date };

/**
 * Hàng chờ phê duyệt trong phạm vi bộ môn: nội dung do giáo viên thuộc bộ môn mình gửi lên.
 * Nội dung của admin/hệ thống (tác giả không thuộc bộ môn nào) hiện cho mọi trưởng bộ môn.
 */
async function scopedQueue(req: Request, id?: string): Promise<QueueRow[]> {
  const scope = await scopeOf(req);
  const rows = id
    ? await prisma.$queryRaw<QueueRow[]>`SELECT resource_type, id::text AS id, title, author_id::text AS author_id, updated_at FROM v_review_queue WHERE id = ${id}::uuid`
    : await prisma.$queryRaw<QueueRow[]>`SELECT resource_type, id::text AS id, title, author_id::text AS author_id, updated_at FROM v_review_queue ORDER BY updated_at ASC`;
  if (!scope) return rows;
  const authorIds = [...new Set(rows.map((r) => r.author_id).filter((x): x is string => !!x))];
  const authors = await prisma.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, departmentId: true } });
  const deptOf = new Map(authors.map((a) => [a.id, a.departmentId]));
  return rows.filter((r) => {
    const d = r.author_id ? deptOf.get(r.author_id) : null;
    return !d || scope.includes(d);
  });
}
const APPROVAL_TYPE: Record<string, 'QUESTION' | 'TEST' | 'LESSON' | 'POST'> = {
  COURSE: 'LESSON',
  LESSON: 'LESSON',
  PASSAGE: 'QUESTION',
  QUESTION: 'QUESTION',
  TEST: 'TEST',
  GRAMMAR: 'POST',
  SPEAKING: 'POST',
  POST: 'POST',
};
const RESOURCE_TYPES = ['COURSE', 'LESSON', 'PASSAGE', 'QUESTION', 'TEST', 'GRAMMAR', 'SPEAKING', 'POST'] as const;
type ResourceType = (typeof RESOURCE_TYPES)[number];

async function summaryOf(type: string, id: string): Promise<string> {
  switch (type) {
    case 'COURSE':
      return (await prisma.course.findUnique({ where: { id }, select: { description: true } }))?.description.slice(0, 200) ?? '';
    case 'LESSON':
      return (await prisma.lesson.findUnique({ where: { id }, select: { summary: true, type: true, durationMin: true } }).then((l) => (l ? `${l.type} · ${l.durationMin} phút${l.summary ? ` · ${l.summary}` : ''}` : ''))) ?? '';
    case 'QUESTION':
      return (await prisma.question.findUnique({ where: { id }, select: { part: true, stem: true } }).then((q) => (q ? `${q.part} · ${q.stem.slice(0, 160)}` : ''))) ?? '';
    case 'PASSAGE':
      return (await prisma.passage.findUnique({ where: { id }, select: { part: true, _count: { select: { questionPassages: true } } } }).then((p) => (p ? `${p.part ?? ''} · ${p._count.questionPassages} câu hỏi` : ''))) ?? '';
    case 'TEST':
      return (await prisma.mockTest.findUnique({ where: { id }, select: { totalQuestions: true, durationMin: true, examType: true } }).then((t) => (t ? `${t.examType} · ${t.totalQuestions} câu · ${t.durationMin} phút` : ''))) ?? '';
    case 'POST':
      return (await prisma.post.findUnique({ where: { id }, select: { excerpt: true } }))?.excerpt ?? '';
    case 'GRAMMAR':
      return (await prisma.grammarTopic.findUnique({ where: { id }, select: { summary: true } }))?.summary.slice(0, 200) ?? '';
    default:
      return '';
  }
}

headRouter.get(
  '/approvals',
  handler(async (req) => {
    const rows = await scopedQueue(req);
    const authors = await prisma.user.findMany({ where: { id: { in: rows.map((r) => r.author_id).filter((x): x is string => !!x) } }, select: { id: true, fullName: true, avatarUrl: true } });
    const pending = await Promise.all(
      rows.map(async (r) => {
        const a = authors.find((x) => x.id === r.author_id);
        return {
          id: r.id,
          resourceType: r.resource_type,
          type: APPROVAL_TYPE[r.resource_type] ?? 'POST',
          title: r.title ?? '(không tiêu đề)',
          author: a?.fullName ?? 'Hệ thống',
          authorAvatar: a?.avatarUrl ?? undefined,
          submittedAt: r.updated_at.toISOString(),
          status: 'PENDING' as const,
          summary: await summaryOf(r.resource_type, r.id),
        };
      })
    );
    // Lịch sử duyệt lấy từ audit_logs (mọi thao tác duyệt đều được ghi)
    const logs = await prisma.auditLog.findMany({
      where: { action: { in: ['CONTENT_APPROVE', 'CONTENT_REJECT'] }, ...(me(req).role === 'ADMIN' ? {} : { actorId: me(req).id }) },
      include: { actor: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const history = logs.map((l) => {
      const after = (l.afterData ?? {}) as { title?: string; author?: string; note?: string; summary?: string };
      return {
        id: l.resourceId ?? l.id,
        resourceType: l.resourceType,
        type: APPROVAL_TYPE[l.resourceType] ?? 'POST',
        title: after.title ?? '',
        author: after.author ?? '',
        submittedAt: l.createdAt.toISOString(),
        status: (l.action === 'CONTENT_APPROVE' ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED',
        summary: after.summary ?? '',
        reviewer: l.actor?.fullName,
        note: after.note,
      };
    });
    return [...pending, ...history];
  })
);

/** Đổi trạng thái nội dung chờ duyệt (luồng #11) */
async function review(req: Request, decision: 'APPROVE' | 'REJECT') {
  const type = parse(z.enum(RESOURCE_TYPES), String(req.params.type).toUpperCase()) as ResourceType;
  const id = idParam(req);
  const { note } = parse(z.object({ note: z.string().trim().max(2000).optional() }), req.body ?? {});
  if (decision === 'REJECT' && !note) throw badRequest('Cần ghi lý do từ chối', 'NOTE_REQUIRED');
  const status: ContentStatus = decision === 'APPROVE' ? 'PUBLISHED' : 'REJECTED';
  const reviewer = me(req).id;
  const row = (await scopedQueue(req, id))[0];
  if (!row || row.resource_type !== type) throw notFound('Nội dung chờ duyệt');
  const summary = await summaryOf(type, id);
  const data = { status, reviewNote: note ?? null };
  await prisma.$transaction(async (tx) => {
    switch (type) {
      case 'COURSE':
        await tx.course.update({ where: { id }, data: { ...data, reviewedById: reviewer, publishedAt: status === 'PUBLISHED' ? new Date() : undefined } });
        break;
      case 'LESSON':
        await tx.lesson.update({ where: { id }, data: { ...data, reviewedById: reviewer } });
        break;
      case 'PASSAGE':
        await tx.passage.update({ where: { id }, data: { ...data, reviewedById: reviewer } });
        break;
      case 'QUESTION':
        await tx.question.update({ where: { id }, data: { ...data, reviewedById: reviewer } });
        break;
      case 'TEST': {
        await tx.mockTest.update({ where: { id }, data: { ...data, reviewedById: reviewer } });
        // Câu hỏi mới của chính tác giả nằm trong đề được duyệt/từ chối cùng đề
        const own = await tx.mockTestQuestion.findMany({ where: { testId: id, question: { status: 'PENDING_REVIEW', authorId: row.author_id ?? undefined, deletedAt: null } }, select: { questionId: true } });
        if (own.length) await tx.question.updateMany({ where: { id: { in: own.map((o) => o.questionId) } }, data: { ...data, reviewedById: reviewer } });
        break;
      }
      case 'POST':
        await tx.post.update({ where: { id }, data: { status, publishedAt: status === 'PUBLISHED' ? new Date() : undefined } });
        break;
      case 'GRAMMAR':
        await tx.grammarTopic.update({ where: { id }, data: { status } });
        break;
      case 'SPEAKING':
        await tx.speakingMaterial.update({ where: { id }, data: { status } });
        break;
    }
    const author = row.author_id ? await tx.user.findUnique({ where: { id: row.author_id }, select: { fullName: true } }) : null;
    await audit(req, decision === 'APPROVE' ? 'CONTENT_APPROVE' : 'CONTENT_REJECT', type, id, { tx, after: { title: row.title, author: author?.fullName, note, summary } });
    await notify(
      [row.author_id],
      {
        type: 'REVIEW',
        title: decision === 'APPROVE' ? 'Học liệu đã được duyệt' : 'Học liệu bị từ chối',
        message: decision === 'APPROVE' ? `"${row.title}" đã được xuất bản tới học viên.` : `"${row.title}": ${note}`,
        refType: type,
        refId: id,
      },
      tx
    );
  });
  return { id, status };
}
headRouter.post('/approvals/:type/:id/approve', handler((req) => review(req, 'APPROVE')));
headRouter.post('/approvals/:type/:id/reject', handler((req) => review(req, 'REJECT')));

// ======================= Ngân hàng câu hỏi (xem) =======================
const EXAM_PARTS = ['TOEIC_P1', 'TOEIC_P2', 'TOEIC_P3', 'TOEIC_P4', 'TOEIC_P5', 'TOEIC_P6', 'TOEIC_P7', 'VSTEP_L1', 'VSTEP_L2', 'VSTEP_L3', 'VSTEP_R1', 'VSTEP_R2', 'VSTEP_R3', 'VSTEP_R4', 'VSTEP_W1', 'VSTEP_W2', 'VSTEP_S1', 'VSTEP_S2', 'VSTEP_S3'] as const;
const SKILLS = ['LISTENING', 'READING', 'WRITING', 'SPEAKING', 'VOCABULARY', 'GRAMMAR'] as const;
export const questionFilter = pageQuery.extend({
  examType: z.enum(['TOEIC', 'VSTEP']).optional(),
  part: z.enum(EXAM_PARTS).optional(),
  skill: z.enum(SKILLS).optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED']).optional(),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE_NOT_GIVEN', 'FILL_IN_BLANK', 'MATCHING', 'ESSAY', 'SPEAKING_RESPONSE']).optional(),
});

/** Câu hỏi dạng gọn cho bảng (CrudEditor) */
export const toQuestionRow = (q: Prisma.QuestionGetPayload<{ include: { passage: { select: { id: true; title: true } } } }>) => ({
  id: q.id,
  examType: q.examType,
  part: q.part,
  skill: q.skill,
  type: q.type,
  level: q.level ?? undefined,
  stem: q.stem,
  options: (q.options ?? []) as { key: string; text: string }[],
  correctAnswer: ((q.correctAnswer as { keys?: string[] } | null)?.keys ?? [])[0] ?? '',
  explanation: q.explanationMd ?? '',
  translationVi: q.translationVi ?? undefined,
  audioUrl: q.audioUrl ?? undefined,
  imageUrl: q.imageUrl ?? undefined,
  // dạng bài Viết / Nói (TOEIC S&W chưa có part riêng trong enum → nhận diện qua task_config)
  taskConfig: (q.taskConfig as Record<string, unknown> | null) ?? undefined,
  passageId: q.passageId ?? undefined,
  passageTitle: q.passage?.title ?? undefined,
  tagIds: q.tagIds,
  status: q.status,
  reviewNote: q.reviewNote ?? undefined,
  authorId: q.authorId ?? undefined,
  source: q.source,
  version: q.version,
  difficulty: Number(q.irtB),
  correctRate: q.correctRate === null ? undefined : Number(q.correctRate),
  hasExplanation: !!q.explanationMd,
  createdAt: q.createdAt.toISOString(),
});

export async function listQuestions(raw: unknown, extra: Prisma.QuestionWhereInput = {}) {
  const f = parse(questionFilter, raw);
  const where: Prisma.QuestionWhereInput = {
    deletedAt: null,
    ...extra,
    ...(f.examType ? { examType: f.examType } : {}),
    ...(f.part ? { part: f.part as ExamPart } : {}),
    ...(f.skill ? { skill: f.skill as SkillType } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.type ? { type: f.type } : {}),
    ...(f.q ? { stem: { contains: f.q, mode: 'insensitive' } } : {}),
  };
  const [items, total, byPart] = await Promise.all([
    prisma.question.findMany({ where, include: { passage: { select: { id: true, title: true } } }, orderBy: [{ part: 'asc' }, { createdAt: 'asc' }], skip: (f.page - 1) * f.pageSize, take: f.pageSize }),
    prisma.question.count({ where }),
    prisma.question.groupBy({ by: ['part'], where, _count: true }),
  ]);
  return { ...paged(items.map(toQuestionRow), total, f), byPart: byPart.map((b) => ({ part: b.part, count: b._count })) };
}

async function scopedQuestion(req: Request) {
  const scope = await scopeOf(req);
  const examTypes = scope ? [...new Set((await prisma.department.findMany({ where: { id: { in: scope } }, select: { examType: true } })).map((d) => d.examType))] : null;
  const q = await prisma.question.findFirst({ where: { id: idParam(req), deletedAt: null, ...(examTypes ? { examType: { in: examTypes } } : {}) } });
  if (!q) throw notFound('Câu hỏi');
  return q;
}
const qEditBody = z.object({
  stem: z.string().trim().min(1).optional(),
  options: z.array(z.object({ key: z.string().max(4), text: z.string() })).nullish(),
  correctAnswer: z.string().max(4).nullish(),
  explanation: z.string().max(20000).nullish(),
  translationVi: z.string().max(20000).nullish(),
});
/** Hiệu đính câu hỏi (vd sau khiếu nại). Câu nằm trong đề đã xuất bản: trigger CSDL lưu phiên bản cũ; trưởng bộ môn tự sửa nên xuất bản lại ngay. */
headRouter.patch(
  '/question-bank/:id',
  handler(async (req) => {
    const q = await scopedQuestion(req);
    const b = parse(qEditBody, req.body);
    const data: Prisma.QuestionUpdateInput = {
      ...(b.stem !== undefined ? { stem: b.stem } : {}),
      ...(b.options !== undefined ? { options: b.options ?? Prisma.JsonNull } : {}),
      ...(b.correctAnswer !== undefined ? { correctAnswer: b.correctAnswer ? { keys: [b.correctAnswer] } : Prisma.JsonNull } : {}),
      ...(b.explanation !== undefined ? { explanationMd: b.explanation } : {}),
      ...(b.translationVi !== undefined ? { translationVi: b.translationVi } : {}),
    };
    const inc = { passage: { select: { id: true, title: true } } } as const;
    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.question.update({ where: { id: q.id }, data, include: inc });
      const fixed = q.status === 'PUBLISHED' && u.status === 'PENDING_REVIEW' ? await tx.question.update({ where: { id: q.id }, data: { status: 'PUBLISHED', reviewedById: me(req).id }, include: inc }) : u;
      await audit(req, 'QUESTION_EDIT', 'question', q.id, { tx, before: { stem: q.stem, correctAnswer: q.correctAnswer, version: q.version }, after: { stem: fixed.stem, correctAnswer: fixed.correctAnswer, version: fixed.version } });
      return fixed;
    });
    return toQuestionRow(updated);
  })
);
/** Lưu trữ (ẩn khỏi học viên, bài làm cũ vẫn xem được) hoặc khôi phục câu hỏi */
headRouter.post(
  '/question-bank/:id/archive',
  handler(async (req) => {
    const q = await scopedQuestion(req);
    const { archived } = parse(z.object({ archived: z.boolean().default(true) }), req.body ?? {});
    if (archived && q.status === 'ARCHIVED') throw conflict('Câu hỏi đã được lưu trữ');
    if (!archived && q.status !== 'ARCHIVED') throw conflict('Câu hỏi không ở trạng thái lưu trữ');
    const u = await prisma.question.update({ where: { id: q.id }, data: { status: archived ? 'ARCHIVED' : 'PUBLISHED', reviewedById: me(req).id }, include: { passage: { select: { id: true, title: true } } } });
    await audit(req, archived ? 'QUESTION_ARCHIVE' : 'QUESTION_RESTORE', 'question', q.id, { after: { title: q.stem.slice(0, 80) } });
    return toQuestionRow(u);
  })
);

headRouter.get(
  '/question-bank',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const deps = scope ? await prisma.department.findMany({ where: { id: { in: scope } }, select: { examType: true } }) : [];
    const examTypes = [...new Set(deps.map((d) => d.examType))];
    // Bản nháp là riêng của tác giả cho tới khi gửi duyệt
    return listQuestions(req.query, { NOT: { status: 'DRAFT' }, ...(scope ? { examType: { in: examTypes } } : {}) });
  })
);
headRouter.get(
  '/question-bank/:id',
  handler(async (req) => {
    const q = await prisma.question.findFirst({ where: { id: idParam(req), deletedAt: null }, include: { passage: true } });
    if (!q) throw notFound('Câu hỏi');
    return { ...toQuestionRow(q), passage: q.passage ? { id: q.passage.id, title: q.passage.title, contentMd: q.passage.contentMd, transcript: q.passage.transcript, audioUrl: q.passage.audioUrl, imageUrl: q.passage.imageUrl } : null };
  })
);

// ======================= Kiểm định chấm bài =======================
type Criterion = { key: string; label: string; description?: string; weight?: number };
const gradingInclude = {
  rubric: true,
  grader: { select: { fullName: true } },
  answer: { include: { question: { select: { id: true, stem: true } }, attempt: { include: { user: true } } } },
  submission: { include: { student: true, assignment: { include: { class: { select: { id: true, name: true, teacher: { select: { fullName: true } } } } } } } },
} satisfies Prisma.GradingInclude;
type GradingFull = Prisma.GradingGetPayload<{ include: typeof gradingInclude }>;

function gradingScope(scope: string[] | null): Prisma.GradingWhereInput {
  if (!scope) return {};
  return { OR: [{ submission: { assignment: { class: { departmentId: { in: scope } } } } }, { grader: { departmentId: { in: scope } } }] };
}

function toGradingReview(g: GradingFull) {
  const student = g.submission?.student ?? g.answer?.attempt.user;
  const cls = g.submission?.assignment.class;
  return {
    id: g.id,
    classId: cls?.id ?? '',
    className: cls?.name ?? 'Luyện tập tự do',
    teacher: g.grader?.fullName ?? cls?.teacher.fullName ?? '',
    studentName: student?.fullName ?? '',
    avatarUrl: student?.avatarUrl ?? undefined,
    type: (g.rubric.skill === 'SPEAKING' ? 'SPEAKING' : 'ESSAY') as 'ESSAY' | 'SPEAKING',
    taskId: g.answer?.question.id ?? g.submission?.assignment.targetId ?? '',
    taskTitle: g.answer?.question.stem.slice(0, 160) ?? g.submission?.assignment.title ?? '',
    content: g.submission?.content ?? g.answer?.textAnswer ?? '',
    audioUrl: g.submission?.audioUrl ?? g.answer?.audioUrl ?? undefined,
    gradedAt: g.gradedAt.toISOString(),
    teacherCriteria: g.criteriaScores as Record<string, number>,
    teacherTotal: Number(g.totalScore),
    teacherFeedback: g.feedback ?? '',
    status: (g.reviewStatus ?? 'PENDING') as 'PENDING' | 'AGREED' | 'ADJUSTED',
    headCriteria: (g.reviewScores as Record<string, number> | null) ?? undefined,
    headTotal: g.reviewTotal === null ? undefined : Number(g.reviewTotal),
    headNote: g.reviewNote ?? undefined,
    rubric: { code: g.rubric.code, name: g.rubric.name, scaleMax: Number(g.rubric.scaleMax), criteria: g.rubric.criteria as Criterion[] },
  };
}

headRouter.get(
  '/grading-reviews',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const { status } = parse(z.object({ status: z.enum(['PENDING', 'AGREED', 'ADJUSTED']).optional() }), req.query);
    const rows = await prisma.grading.findMany({
      where: { reviewStatus: status ? status : { not: null }, ...gradingScope(scope) },
      include: gradingInclude,
      orderBy: { gradedAt: 'desc' },
    });
    return rows.map(toGradingReview);
  })
);
headRouter.get(
  '/grading-reviews/:id',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const g = await prisma.grading.findFirst({ where: { id: idParam(req), reviewStatus: { not: null }, ...gradingScope(scope) }, include: gradingInclude });
    if (!g) throw notFound('Bài kiểm định');
    return toGradingReview(g);
  })
);

/** Kết luận kiểm định (luồng #8): AGREED giữ điểm GV; ADJUSTED ghi điểm mới + cập nhật điểm bài nộp */
headRouter.post(
  '/grading-reviews/:id',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const body = parse(
      z.object({ decision: z.enum(['AGREED', 'ADJUSTED']), scores: z.record(z.number().min(0).max(10)).optional(), note: z.string().trim().max(2000).optional() }),
      req.body
    );
    const g = await prisma.grading.findFirst({ where: { id: idParam(req), reviewStatus: { not: null }, ...gradingScope(scope) }, include: gradingInclude });
    if (!g) throw notFound('Bài kiểm định');
    const criteria = g.rubric.criteria as Criterion[];
    let reviewTotal: number | null = null;
    if (body.decision === 'ADJUSTED') {
      if (!body.scores || !body.note) throw badRequest('Điều chỉnh điểm cần điểm từng tiêu chí và lý do', 'NOTE_REQUIRED');
      const missing = criteria.filter((c) => body.scores![c.key] === undefined).map((c) => c.key);
      if (missing.length) throw badRequest(`Thiếu điểm tiêu chí: ${missing.join(', ')}`);
      const wSum = criteria.reduce((a, c) => a + (c.weight ?? 1), 0);
      reviewTotal = Math.round((criteria.reduce((a, c) => a + body.scores![c.key] * (c.weight ?? 1), 0) / wSum) * 10) / 10;
    }
    await prisma.$transaction(async (tx) => {
      await tx.grading.update({
        where: { id: g.id },
        data: {
          reviewStatus: body.decision,
          reviewerId: me(req).id,
          reviewScores: body.decision === 'ADJUSTED' ? body.scores : undefined,
          reviewTotal,
          reviewNote: body.note ?? null,
          reviewedAt: new Date(),
        },
      });
      if (body.decision === 'ADJUSTED' && g.submissionId && reviewTotal !== null) {
        const max = Number(g.submission!.assignment.maxScore);
        const scale = Number(g.rubric.scaleMax) || 10;
        await tx.assignmentSubmission.update({ where: { id: g.submissionId }, data: { score: Math.round((reviewTotal / scale) * max * 10) / 10 } });
      }
      if (body.decision === 'ADJUSTED' && g.answerId && reviewTotal !== null) await tx.attemptAnswer.update({ where: { id: g.answerId }, data: { score: reviewTotal } });
      await audit(req, body.decision === 'ADJUSTED' ? 'SCORE_ADJUST' : 'GRADING_REVIEW_AGREE', 'grading', g.id, {
        tx,
        severity: body.decision === 'ADJUSTED' ? 'WARN' : 'INFO',
        before: { total: Number(g.totalScore), criteria: g.criteriaScores },
        after: { total: reviewTotal, criteria: body.scores, note: body.note },
      });
      const student = g.submission?.studentId ?? g.answer?.attempt.userId;
      await notify([g.graderId], { type: 'REVIEW', title: body.decision === 'AGREED' ? 'Kiểm định: đồng ý điểm chấm' : 'Kiểm định: điểm đã được điều chỉnh', message: body.note ?? 'Trưởng bộ môn đồng ý với điểm bạn chấm.', link: '/teacher/grading', refType: 'GRADING', refId: g.id }, tx);
      if (body.decision === 'ADJUSTED') await notify([student], { type: 'REVIEW', title: 'Điểm bài làm đã được điều chỉnh', message: `Điểm mới: ${reviewTotal}/${Number(g.rubric.scaleMax)}.`, refType: 'GRADING', refId: g.id }, tx);
    });
    const fresh = await prisma.grading.findUniqueOrThrow({ where: { id: g.id }, include: gradingInclude });
    return toGradingReview(fresh);
  })
);

// ======================= Dự giờ =======================
type ObsJson = { status?: 'PLANNED' | 'DONE'; rating?: number; strengths?: string; improvements?: string };
type SessionWithClass = Prisma.ClassSessionGetPayload<{ include: { class: { select: { id: true; name: true } } } }>;
function presentRate(attendance: Prisma.JsonValue | null | undefined): number | null {
  const marks = Object.values((attendance ?? {}) as Record<string, { mark?: string } | string>).map((v) => (typeof v === 'string' ? v : v?.mark)).filter(Boolean);
  return marks.length ? Math.round((marks.filter((m) => m === 'PRESENT' || m === 'LATE').length / marks.length) * 100) : null;
}
function toSessionRow(s: SessionWithClass) {
  return {
    attendanceRate: presentRate(s.attendance),
    note: s.note ?? undefined,
    id: s.id,
    classId: s.class.id,
    className: s.class.name,
    date: s.sessionDate.toISOString().slice(0, 10),
    start: hhmm(s.startTime),
    end: hhmm(s.endTime),
    room: s.room ?? undefined,
    topic: s.topic ?? '',
    status: s.status,
    observerId: s.observerId ?? undefined,
  };
}
function toObservation(s: { id: string; sessionDate: Date; startTime: Date; topic: string | null; observation: Prisma.JsonValue; class: { id: string; teacher: { fullName: string } } }) {
  const o = (s.observation ?? {}) as ObsJson;
  return {
    id: s.id,
    classId: s.class.id,
    teacher: s.class.teacher.fullName,
    date: s.sessionDate.toISOString().slice(0, 10),
    start: hhmm(s.startTime),
    topic: s.topic ?? '',
    status: o.status ?? 'PLANNED',
    rating: o.rating,
    strengths: o.strengths,
    improvements: o.improvements,
  };
}

headRouter.get(
  '/observations',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const rows = await prisma.classSession.findMany({
      where: { observerId: { not: null }, observation: { not: Prisma.DbNull }, class: classWhere(scope) },
      include: { class: { select: { id: true, teacher: { select: { fullName: true } } } } },
      orderBy: { sessionDate: 'desc' },
    });
    return rows.filter((r) => r.observation).map(toObservation);
  })
);

/** Lên lịch dự giờ một buổi học sắp tới */
headRouter.post(
  '/observations',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const body = parse(z.object({ sessionId: uuid, topic: z.string().max(200).optional() }), req.body);
    const s = await prisma.classSession.findFirst({ where: { id: body.sessionId, class: classWhere(scope) }, include: { class: { select: { id: true, name: true, teacherId: true, teacher: { select: { fullName: true } } } } } });
    if (!s) throw notFound('Buổi học');
    if (s.sessionDate < startOfToday()) throw badRequest('Chỉ lên lịch dự giờ cho buổi học sắp tới');
    const updated = await prisma.classSession.update({
      where: { id: s.id },
      data: { observerId: me(req).id, observation: { status: 'PLANNED' }, topic: body.topic ?? s.topic },
      include: { class: { select: { id: true, teacher: { select: { fullName: true } } } } },
    });
    await notify([s.teacherId ?? s.class.teacherId], { type: 'CLASS', title: 'Lịch dự giờ', message: `Trưởng bộ môn sẽ dự giờ lớp ${s.class.name} ngày ${s.sessionDate.toISOString().slice(0, 10)} lúc ${hhmm(s.startTime)}.`, link: '/teacher/schedule', refType: 'SESSION', refId: s.id });
    return toObservation(updated);
  })
);

/** Ghi kết quả dự giờ */
headRouter.patch(
  '/observations/:id',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const body = parse(z.object({ rating: z.number().int().min(1).max(5), strengths: z.string().max(2000).optional(), improvements: z.string().max(2000).optional() }), req.body);
    const s = await prisma.classSession.findFirst({ where: { id: idParam(req), observerId: { not: null }, class: classWhere(scope) }, include: { class: { select: { teacherId: true, name: true } } } });
    if (!s) throw notFound('Buổi dự giờ');
    if (s.sessionDate > startOfToday()) throw badRequest('Chỉ ghi kết quả dự giờ khi buổi học đã diễn ra');
    if (s.status === 'CANCELLED') throw badRequest('Buổi học đã bị huỷ, không thể ghi kết quả dự giờ');
    const updated = await prisma.classSession.update({
      where: { id: s.id },
      data: { observation: { status: 'DONE', ...body } },
      include: { class: { select: { id: true, teacher: { select: { fullName: true } } } } },
    });
    await notify([s.teacherId ?? s.class.teacherId], { type: 'REVIEW', title: 'Kết quả dự giờ', message: `Lớp ${s.class.name}: ${body.rating}/5. ${body.strengths ?? ''}`.trim(), link: '/teacher/dashboard', refType: 'SESSION', refId: s.id });
    return toObservation(updated);
  })
);
headRouter.delete(
  '/observations/:id',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const s = await prisma.classSession.findFirst({ where: { id: idParam(req), observerId: me(req).id, class: classWhere(scope) } });
    if (!s) throw notFound('Buổi dự giờ');
    if ((s.observation as { status?: string } | null)?.status === 'DONE') throw conflict('Buổi dự giờ đã có kết quả, không thể huỷ');
    await prisma.classSession.update({ where: { id: s.id }, data: { observerId: null, observation: Prisma.DbNull } });
    return { ok: true };
  })
);

// ======================= Khiếu nại & phúc khảo =======================
/** Khiếu nại thuộc phạm vi: câu hỏi cùng kỳ thi với bộ môn mình phụ trách, hoặc bài nộp của lớp trong bộ môn, hoặc chưa gắn câu/bài */
async function complaintWhere(req: Request): Promise<Prisma.TicketWhereInput> {
  const scope = await scopeOf(req);
  if (!scope) return { category: 'ACADEMIC' };
  const exams = [...new Set((await prisma.department.findMany({ where: { id: { in: scope } }, select: { examType: true } })).map((d) => d.examType))];
  return {
    category: 'ACADEMIC',
    OR: [
      { question: { examType: { in: exams } } },
      { submission: { assignment: { class: classWhere(scope) } } },
      { questionId: null, submissionId: null },
    ],
  };
}
headRouter.get(
  '/complaints',
  handler(async (req) => {
    const rows = await prisma.ticket.findMany({ where: await complaintWhere(req), include: ticketInclude, orderBy: { createdAt: 'desc' } });
    return rows.map(toComplaint);
  })
);
headRouter.patch(
  '/complaints/:id',
  handler(async (req) => {
    const body = parse(z.object({ status: z.enum(['NEW', 'IN_REVIEW', 'RESOLVED']) }), req.body);
    const t = await prisma.ticket.findFirst({ where: { id: idParam(req), ...(await complaintWhere(req)) } });
    if (!t) throw notFound('Khiếu nại');
    const status = body.status === 'NEW' ? 'OPEN' : body.status === 'IN_REVIEW' ? 'IN_REVIEW' : 'RESOLVED';
    const updated = await prisma.ticket.update({
      where: { id: t.id },
      data: { status, assigneeId: t.assigneeId ?? me(req).id, resolvedAt: status === 'RESOLVED' ? new Date() : null },
      include: ticketInclude,
    });
    return toComplaint(updated);
  })
);
headRouter.post(
  '/complaints/:id/reply',
  handler(async (req) => {
    const body = parse(z.object({ text: z.string().trim().min(1).max(5000), resolve: z.boolean().optional(), accepted: z.boolean().optional() }), req.body);
    const t = await prisma.ticket.findFirst({ where: { id: idParam(req), ...(await complaintWhere(req)) } });
    if (!t) throw notFound('Khiếu nại');
    if (body.resolve && (t.status === 'RESOLVED' || t.status === 'REJECTED')) throw conflict('Khiếu nại đã được giải quyết trước đó');
    const updated = await prisma.$transaction(async (tx) => {
      await tx.ticketMessage.create({ data: { ticketId: t.id, senderType: 'STAFF', senderId: me(req).id, text: body.text } });
      const u = await tx.ticket.update({
        where: { id: t.id },
        data: {
          assigneeId: t.assigneeId ?? me(req).id,
          status: body.resolve ? (body.accepted === false ? 'REJECTED' : 'RESOLVED') : 'IN_REVIEW',
          resolution: body.resolve ? body.text : undefined,
          resolvedAt: body.resolve ? new Date() : undefined,
        },
        include: ticketInclude,
      });
      const accepted = body.resolve && body.accepted !== false;
      await notify(
        [t.userId],
        {
          type: 'SYSTEM',
          title: body.resolve ? (accepted ? 'Khiếu nại được chấp nhận' : 'Khiếu nại không được chấp nhận') : 'Phản hồi khiếu nại',
          message: (accepted && t.questionId ? `Cảm ơn bạn đã báo lỗi, bạn được cộng ${CONTRIBUTION_XP} điểm ghi nhận đóng góp. ` : '') + body.text.slice(0, 300),
          refType: 'TICKET',
          refId: t.id,
        },
        tx
      );
      // Báo lỗi câu hỏi được chấp nhận → cộng điểm ghi nhận đóng góp (không tính là ngày học, không đổi streak)
      if (accepted && t.questionId && t.userId) {
        const today = new Date(new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10));
        await tx.dailyActivity.upsert({
          where: { userId_activityDate: { userId: t.userId, activityDate: today } },
          create: { userId: t.userId, activityDate: today, xp: CONTRIBUTION_XP },
          update: { xp: { increment: CONTRIBUTION_XP } },
        });
        await tx.user.update({ where: { id: t.userId }, data: { xpTotal: { increment: CONTRIBUTION_XP } } });
      }
      if (body.resolve && t.submissionId) {
        const sub = await tx.assignmentSubmission.findUnique({ where: { id: t.submissionId }, select: { assignment: { select: { title: true, class: { select: { teacherId: true } } } } } });
        if (sub) await notify([sub.assignment.class.teacherId], { type: 'REVIEW', title: accepted ? 'Phúc khảo được chấp nhận' : 'Phúc khảo không được chấp nhận', message: `"${sub.assignment.title}": ${body.text.slice(0, 240)}`, link: '/teacher/grading', refType: 'TICKET', refId: t.id }, tx);
      }
      if (body.resolve) await audit(req, 'COMPLAINT_RESOLVE', 'ticket', t.id, { tx, after: { accepted: body.accepted !== false } });
      return u;
    });
    return toComplaint(updated);
  })
);

/** Điểm ghi nhận khi báo lỗi câu hỏi được chấp nhận */
const CONTRIBUTION_XP = 20;

// ======================= Báo cáo =======================
headRouter.get(
  '/reports',
  handler(async (req) => {
    const scope = await scopeOf(req);
    const { months, departmentId } = parse(z.object({ months: z.coerce.number().int().min(1).max(12).default(6), departmentId: uuid.optional() }), req.query);
    const where = { ...classWhere(scope), isArchived: false, ...(departmentId ? { departmentId } : {}) };
    const classes = await prisma.class.findMany({ where, include: classInclude, orderBy: { name: 'asc' } });
    const stats = await classStats(classes);

    // Xu hướng: điểm TB lượt thi 30 ngày gần nhất so với 30 ngày trước đó
    const now = Date.now();
    const recent = new Date(now - 30 * 86400_000);
    const prev = new Date(now - 60 * 86400_000);
    const allStudents = [...new Set([...stats.values()].flatMap((s) => s.studentIds))];
    const attempts = allStudents.length
      ? await prisma.examAttempt.findMany({
          where: { userId: { in: allStudents }, status: 'COMPLETED', mode: 'FULL', scoreTotal: { not: null }, submittedAt: { gte: prev } },
          select: { userId: true, scoreTotal: true, submittedAt: true, test: { select: { examType: true } } },
        })
      : [];

    const reports = classes.map((c) => {
      const s = stats.get(c.id)!;
      const mine = attempts.filter((a) => a.test?.examType === c.examType && s.studentIds.includes(a.userId));
      const r = mine.filter((a) => a.submittedAt! >= recent).map((a) => Number(a.scoreTotal));
      const p = mine.filter((a) => a.submittedAt! < recent).map((a) => Number(a.scoreTotal));
      // Cần điểm ở cả 2 kỳ (30 ngày gần nhất và 30 ngày trước đó) mới có xu hướng; thiếu thì null
      const trend = r.length && p.length && avg(p) ? Math.round(((avg(r) - avg(p)) / avg(p)) * 1000) / 10 : null;
      return {
        classId: c.id,
        className: c.name,
        teacher: c.teacher.fullName,
        examType: c.examType,
        students: s.studentsCount,
        avgScore: s.avgScore,
        attendance: s.attendanceRate,
        completion: s.completionRate,
        // Chưa có điểm thi lẫn điểm danh thì chưa xếp loại
        hasAttendance: s.attendanceMarks > 0,
        hasScore: s.hasScore,
        grade: s.hasScore || s.attendanceMarks > 0 ? gradeOf(c.examType, s.hasScore ? s.avgScore : 0, s.attendanceRate) : null,
        trend,
      };
    });

    // Chuyên cần & hoàn thành bài tập theo tháng
    const ms = lastMonths(months);
    const ids = classes.map((c) => c.id);
    const [sessions, subs] = await Promise.all([
      prisma.classSession.findMany({ where: { classId: { in: ids }, status: 'DONE', sessionDate: { gte: ms[0].start } }, select: { sessionDate: true, attendance: true } }),
      prisma.assignmentSubmission.findMany({ where: { assignment: { classId: { in: ids }, deletedAt: null, dueAt: { gte: ms[0].start, lt: ms[ms.length - 1].end } } }, select: { status: true, assignment: { select: { dueAt: true } } } }),
    ]);
    const monthly = {
      labels: ms.map((m) => m.label),
      attendance: ms.map((m) => {
        let ok = 0;
        let all = 0;
        for (const s of sessions.filter((x) => x.sessionDate >= m.start && x.sessionDate < m.end))
          for (const v of Object.values((s.attendance ?? {}) as Record<string, { mark?: string }>)) {
            if (!v?.mark) continue;
            all++;
            if (v.mark === 'PRESENT' || v.mark === 'LATE') ok++;
          }
        return all ? Math.round((ok / all) * 100) : 0;
      }),
      completion: ms.map((m) => {
        const inMonth = subs.filter((x) => x.assignment.dueAt && x.assignment.dueAt >= m.start && x.assignment.dueAt < m.end);
        return inMonth.length ? Math.round((inMonth.filter((x) => ['SUBMITTED', 'LATE', 'GRADED'].includes(x.status)).length / inMonth.length) * 100) : 0;
      }),
    };
    const gradeDist = (['A', 'B', 'C', 'D'] as const).map((g) => ({ grade: g, count: reports.filter((r) => r.grade === g).length }));
    // Tổng hợp: học viên KHÁC NHAU, chuyên cần gộp theo lượt điểm danh (không lấy TB các %)
    const all = [...stats.values()];
    const marks = all.reduce((a, s) => a + s.attendanceMarks, 0);
    const summary = {
      students: new Set(all.flatMap((s) => s.studentIds)).size,
      attendanceRate: marks ? Math.round(all.reduce((a, s) => a + (s.attendanceRate / 100) * s.attendanceMarks, 0) / marks * 100) : null,
    };
    return { classes: reports, monthly, gradeDist, summary };
  })
);

// ======================= tiện ích =======================
function avg(xs: number[]) {
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0;
}
function startOfToday() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
function startOfWeek() {
  const t = startOfToday();
  const dow = (t.getUTCDay() + 6) % 7; // 0 = thứ Hai
  return addDays(t, -dow);
}
function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * 86400_000);
}
