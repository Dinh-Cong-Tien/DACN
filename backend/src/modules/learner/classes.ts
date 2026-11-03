/** Lớp của tôi, bảng tin, tài liệu lớp, bài tập được giao (phía học viên). */
import { Router } from 'express';
import { pid } from './learner.shared';
import { z } from 'zod';
import { onlyStudent } from '../../core/auth';
import type { Assignment, AssignmentSubmission, Class, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { badRequest, conflict, forbidden, handler, me, notFound, parse } from '../../core/http';
import { iso } from '../../core/dto';
import { classGradient, classMetrics } from '../../core/metrics';

export const classesRouter = Router();


async function myMembership(classId: string, userId: string) {
  const m = await prisma.classMember.findUnique({ where: { classId_studentId: { classId, studentId: userId } } });
  if (!m || m.status !== 'ACTIVE') throw forbidden('Bạn không ở trong lớp này');
  return m;
}

/** ClassRoom — số liệu theo định nghĩa chung core/metrics.ts (khớp với giáo viên, trưởng bộ môn, admin) */
async function toClassRoom(c: Class & { teacher: { fullName: string } }) {
  const m = (await classMetrics([c])).get(c.id)!;
  return {
    id: c.id,
    name: c.name,
    code: c.code,
    examType: c.examType,
    teacherName: c.teacher.fullName,
    studentsCount: m.studentsCount,
    assignmentsCount: m.assignmentsCount,
    avgScore: m.avgScore,
    completionRate: m.completionRate,
    attendanceRate: m.attendanceRate,
    createdAt: c.createdAt.toISOString().slice(0, 10),
    schedule: c.scheduleText ?? '',
    room: c.room ?? undefined,
    gradient: classGradient(c.id),
    coverUrl: c.coverUrl ?? undefined,
    level: c.level ?? undefined,
    description: c.description ?? undefined,
  };
}

/** AssignmentTarget: teacher module lưu nguyên AssignmentTarget trong target_config (có `kind`) */
function targetOf(a: Assignment) {
  const cfg = (a.targetConfig ?? {}) as Record<string, unknown>;
  if (cfg.kind) return cfg;
  switch (a.type) {
    case 'MOCK_TEST':
    case 'PRACTICE':
      return { kind: 'EXAM', testId: a.targetId, setup: { mode: a.type === 'MOCK_TEST' ? 'FULL' : 'PRACTICE', parts: (cfg.parts as string[]) ?? [], minutes: (cfg.minutes as number) ?? null } };
    case 'LESSON':
      return { kind: 'LESSON', courseId: a.targetId, lessonIds: (cfg.lessonIds as string[]) ?? [] };
    case 'GRAMMAR':
      return { kind: 'GRAMMAR', slug: (cfg.slug as string) ?? a.targetId };
    case 'VOCAB':
      return { kind: 'VOCAB', topicId: a.targetId };
    case 'ESSAY':
      return { kind: 'WRITING', taskId: a.targetId };
    default:
      return { kind: 'SPEAKING', partId: a.targetId };
  }
}

type AsgRow = Assignment & { class: { name: string } };
async function toAssignment(a: AsgRow) {
  const [total, submitted, avg] = await Promise.all([
    prisma.assignmentSubmission.count({ where: { assignmentId: a.id } }),
    prisma.assignmentSubmission.count({ where: { assignmentId: a.id, status: { in: ['SUBMITTED', 'LATE', 'GRADED'] } } }),
    prisma.assignmentSubmission.aggregate({ where: { assignmentId: a.id, status: 'GRADED' }, _avg: { score: true } }),
  ]);
  return {
    id: a.id,
    classId: a.classId,
    className: a.class.name,
    title: a.title,
    type: a.type,
    dueDate: iso(a.dueAt) ?? '',
    submitted,
    total,
    status: a.status as 'OPEN' | 'CLOSED' | 'DRAFT',
    avgScore: avg._avg.score ? Math.round(Number(avg._avg.score) * 10) / 10 : undefined,
    createdAt: a.createdAt.toISOString().slice(0, 10),
    target: targetOf(a),
    note: a.note ?? undefined,
    maxScore: Number(a.maxScore),
  };
}

/** MyAssignmentState */
function myState(s: AssignmentSubmission | undefined, a: Assignment) {
  if (!s) return { status: 'TODO' as const };
  const overdue = !!a.dueAt && a.dueAt < new Date();
  const status = s.status === 'GRADED' ? 'GRADED' : s.status === 'SUBMITTED' || s.status === 'LATE' ? 'SUBMITTED' : s.status === 'MISSED' || (s.status === 'TODO' && overdue && !a.allowLate) ? 'MISSED' : 'TODO';
  return { status, submittedAt: iso(s.submittedAt), score: s.score === null ? undefined : Number(s.score), feedback: s.feedback ?? undefined } as const;
}

classesRouter.get(
  '/classes',
  handler(async (req) => {
    const rows = await prisma.classMember.findMany({
      where: { studentId: me(req).id, status: 'ACTIVE', class: { deletedAt: null } },
      include: { class: { include: { teacher: { select: { fullName: true } } } } },
      orderBy: { joinedAt: 'desc' },
    });
    return Promise.all(rows.map((r) => toClassRoom(r.class)));
  })
);

classesRouter.post(
  '/classes/join',
  onlyStudent,
  handler(async (req) => {
    const userId = me(req).id;
    const { code } = parse(z.object({ code: z.string().trim().min(3).max(16) }), req.body);
    const c = await prisma.class.findFirst({ where: { code: { equals: code, mode: 'insensitive' }, deletedAt: null }, include: { teacher: { select: { fullName: true } } } });
    if (!c || c.isArchived) throw notFound('Lớp với mã này');
    const existing = await prisma.classMember.findUnique({ where: { classId_studentId: { classId: c.id, studentId: userId } } });
    if (existing?.status === 'ACTIVE') throw conflict('Bạn đã ở trong lớp này', 'ALREADY_MEMBER');
    if (c.maxStudents) {
      const n = await prisma.classMember.count({ where: { classId: c.id, status: 'ACTIVE' } });
      if (n >= c.maxStudents) throw badRequest('Lớp đã đủ sĩ số', 'CLASS_FULL');
    }
    await prisma.$transaction(async (tx) => {
      await tx.classMember.upsert({
        where: { classId_studentId: { classId: c.id, studentId: userId } },
        create: { classId: c.id, studentId: userId },
        update: { status: 'ACTIVE', joinedAt: new Date() },
      });
      // Bài đang mở của lớp → tạo sẵn submission TODO cho học viên mới
      const open = await tx.assignment.findMany({ where: { classId: c.id, deletedAt: null, status: 'OPEN' }, select: { id: true } });
      if (open.length) await tx.assignmentSubmission.createMany({ data: open.map((a) => ({ assignmentId: a.id, studentId: userId })), skipDuplicates: true });
      await tx.notification.create({ data: { userId: c.teacherId, type: 'CLASS', title: `Học viên mới vào lớp ${c.name}`, message: `${(await tx.user.findUniqueOrThrow({ where: { id: userId } })).fullName} đã tham gia bằng mã mời.`, link: `/teacher/classes/${c.id}` } });
    });
    return toClassRoom(c);
  })
);

classesRouter.post(
  '/classes/:id/leave',
  handler(async (req) => {
    const m = await myMembership(pid(req), me(req).id);
    await prisma.classMember.update({ where: { id: m.id }, data: { status: 'LEFT' } });
    return { ok: true };
  })
);

classesRouter.get(
  '/classes/:id',
  handler(async (req) => {
    const userId = me(req).id;
    await myMembership(pid(req), userId);
    const c = await prisma.class.findUniqueOrThrow({ where: { id: pid(req) }, include: { teacher: { select: { fullName: true, avatarUrl: true, email: true } } } });
    const [announcements, materials, assignments, sessions] = await Promise.all([
      prisma.classAnnouncement.findMany({ where: { classId: c.id, deletedAt: null }, orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }] }),
      prisma.material.findMany({ where: { classId: c.id, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.assignment.findMany({ where: { classId: c.id, deletedAt: null, status: { not: 'DRAFT' } }, include: { class: { select: { name: true } } }, orderBy: { dueAt: 'asc' } }),
      prisma.classSession.findMany({ where: { classId: c.id, status: { not: 'CANCELLED' }, sessionDate: { gte: new Date(Date.now() - 86400_000) } }, orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }], take: 10 }),
    ]);
    const subs = await prisma.assignmentSubmission.findMany({ where: { studentId: userId, assignmentId: { in: assignments.map((a) => a.id) } } });
    const smap = new Map(subs.map((s) => [s.assignmentId, s]));
    return {
      class: { ...(await toClassRoom(c)), teacherAvatarUrl: c.teacher.avatarUrl ?? undefined, teacherEmail: c.teacher.email },
      announcements: announcements.map((a) => ({ id: a.id, classId: a.classId, title: a.title, body: a.body, createdAt: a.createdAt.toISOString(), pinned: a.isPinned, readCount: a.readCount })),
      materials: materials.map(toMaterial),
      assignments: await Promise.all(assignments.map(toAssignment)),
      myAssignments: Object.fromEntries(assignments.map((a) => [a.id, myState(smap.get(a.id), a)])),
      upcomingSessions: sessions.map((s) => ({
        id: s.id,
        classId: s.classId,
        date: s.sessionDate.toISOString().slice(0, 10),
        start: s.startTime.toISOString().slice(11, 16),
        end: s.endTime.toISOString().slice(11, 16),
        room: s.room ?? c.room ?? '',
        topic: s.topic ?? '',
        status: s.status as 'DONE' | 'UPCOMING' | 'CANCELLED',
      })),
    };
  })
);

const fmtSize = (b: bigint | null) => {
  if (b === null) return '';
  const n = Number(b);
  return n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
};
const toMaterial = (m: Prisma.MaterialGetPayload<object>) => ({
  id: m.id,
  classId: m.classId ?? '',
  title: m.title,
  type: (m.type === 'LINK' ? 'DOC' : m.type) as 'VIDEO' | 'PDF' | 'DOC' | 'AUDIO',
  size: fmtSize(m.sizeBytes),
  uploadedAt: m.createdAt.toISOString().slice(0, 10),
  downloads: m.downloadsCount,
  fileUrl: m.fileUrl ?? undefined,
  description: m.description ?? undefined,
});

/** Tất cả bài được giao cho tôi (trang "Bài tập của tôi") */
classesRouter.get(
  '/assignments',
  handler(async (req) => {
    const userId = me(req).id;
    const subs = await prisma.assignmentSubmission.findMany({
      where: { studentId: userId, assignment: { deletedAt: null, status: { not: 'DRAFT' }, class: { deletedAt: null } } },
      include: { assignment: { include: { class: { select: { name: true } } } } },
      orderBy: { assignment: { dueAt: 'asc' } },
    });
    return {
      assignments: await Promise.all(subs.map((s) => toAssignment(s.assignment))),
      states: Object.fromEntries(subs.map((s) => [s.assignmentId, myState(s, s.assignment)])),
    };
  })
);

/** Nộp bài tự luận (ESSAY / SPEAKING) hoặc đánh dấu đã hoàn thành (LESSON / GRAMMAR / VOCAB) */
classesRouter.post(
  '/assignments/:id/submit',
  handler(async (req) => {
    const userId = me(req).id;
    const body = parse(z.object({ content: z.string().max(20000).optional(), audioUrl: z.string().max(2000).optional() }), req.body);
    const sub = await prisma.assignmentSubmission.findUnique({ where: { assignmentId_studentId: { assignmentId: pid(req), studentId: userId } }, include: { assignment: { include: { class: true } } } });
    if (!sub || sub.assignment.deletedAt) throw notFound('Bài tập');
    const a = sub.assignment;
    if (a.status === 'CLOSED') throw badRequest('Bài tập đã đóng', 'CLOSED');
    if (sub.status === 'GRADED') throw conflict('Bài đã được chấm', 'ALREADY_GRADED');
    const now = new Date();
    const late = !!a.dueAt && a.dueAt < now;
    if (late && !a.allowLate) throw badRequest('Đã quá hạn nộp', 'OVERDUE');
    if ((a.type === 'ESSAY' || a.type === 'SPEAKING') && !body.content && !body.audioUrl) throw badRequest('Bài nộp trống');
    if (a.type === 'MOCK_TEST' || a.type === 'PRACTICE') throw badRequest('Bài trắc nghiệm được nộp qua phòng thi', 'USE_EXAM');
    if (a.type === 'DICTATION') throw badRequest('Bài chép chính tả được nộp ở trang Chép chính tả', 'USE_DICTATION');
    const updated = await prisma.$transaction(async (tx) => {
      const s = await tx.assignmentSubmission.update({
        where: { id: sub.id },
        data: { content: body.content, audioUrl: body.audioUrl, submittedAt: now, status: late ? 'LATE' : 'SUBMITTED' },
      });
      await tx.notification.create({
        data: { userId: a.class.teacherId, type: 'ASSIGNMENT', title: `Bài nộp mới: ${a.title}`, message: `${(await tx.user.findUniqueOrThrow({ where: { id: userId } })).fullName} vừa nộp bài${late ? ' (trễ hạn)' : ''}.`, link: '/teacher/grading', refType: 'ASSIGNMENT', refId: a.id },
      });
      return s;
    });
    return myState(updated, a);
  })
);
