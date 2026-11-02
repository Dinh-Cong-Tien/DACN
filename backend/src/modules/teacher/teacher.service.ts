/**
 * Nghiệp vụ dùng chung của module giáo viên: kiểm tra quyền sở hữu lớp, tính số liệu lớp/học viên
 * và mapper DB → DTO theo hợp đồng frontend (ClassRoom, ClassStudent, Assignment, Submission, ClassSession…).
 */
import { Prisma, type Assignment, type AssignmentSubmission, type Class, type ClassSession, type User } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { forbidden, notFound, type AuthUser } from '../../core/http';
import { iso, num, ymd } from '../../core/dto';
import { aggregateStudents, classGradient, classMetrics, marksOf, rateOf, riskLevel, round1, syncRiskCache } from '../../core/metrics';

// ---------------- Quyền sở hữu ----------------

/** Điều kiện lọc lớp giáo viên được thao tác: ADMIN xem mọi lớp, còn lại chỉ lớp mình phụ trách. */
export const ownClassWhere = (u: AuthUser): Prisma.ClassWhereInput => (u.role === 'ADMIN' ? { deletedAt: null } : { deletedAt: null, teacherId: u.id });

export async function myClassIds(u: AuthUser, includeArchived = true): Promise<string[]> {
  const rows = await prisma.class.findMany({ where: { ...ownClassWhere(u), ...(includeArchived ? {} : { isArchived: false }) }, select: { id: true } });
  return rows.map((r) => r.id);
}

export async function assertClass(u: AuthUser, classId: string): Promise<Class> {
  const c = await prisma.class.findFirst({ where: { id: classId, deletedAt: null } });
  if (!c) throw notFound('Lớp học');
  if (u.role !== 'ADMIN' && c.teacherId !== u.id) throw forbidden('Bạn không phụ trách lớp này');
  return c;
}

/** Học viên phải đang thuộc ít nhất một lớp của giáo viên. */
export async function assertStudent(u: AuthUser, studentId: string) {
  const exists = await prisma.user.findFirst({ where: { id: studentId, role: 'STUDENT', deletedAt: null }, select: { id: true } });
  if (!exists) throw notFound('Học viên');
  const ids = await myClassIds(u);
  const m = await prisma.classMember.findFirst({ where: { studentId, classId: { in: ids } } });
  if (!m) throw forbidden('Học viên không thuộc lớp nào của bạn');
  return prisma.user.findUniqueOrThrow({ where: { id: studentId } });
}

export async function assertAssignment(u: AuthUser, id: string) {
  const a = await prisma.assignment.findFirst({ where: { id, deletedAt: null }, include: { class: true } });
  if (!a) throw notFound('Bài giao');
  if (u.role !== 'ADMIN' && a.class.teacherId !== u.id) throw forbidden('Bài giao không thuộc lớp của bạn');
  return a;
}

// ---------------- Tiện ích ----------------

export const gradientOf = classGradient;

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

export { round1, pct } from '../../core/metrics';
export const hhmm = (d: Date) => d.toISOString().slice(11, 16);
export const timeOf = (s: string) => new Date(`1970-01-01T${s.length === 5 ? `${s}:00` : s}Z`);
export const dateOf = (s: string) => new Date(`${s}T00:00:00Z`);

export const formatSize = (bytes?: bigint | number | null) => {
  if (bytes === null || bytes === undefined) return '—';
  const b = Number(bytes);
  if (b >= 1024 ** 3) return `${round1(b / 1024 ** 3)} GB`;
  if (b >= 1024 ** 2) return `${round1(b / 1024 ** 2)} MB`;
  if (b >= 1024) return `${Math.round(b / 1024)} KB`;
  return `${b} B`;
};

/** Bài đã nộp (tính hoàn thành) */
export const DONE_STATUSES = ['SUBMITTED', 'LATE', 'GRADED'] as const;

type AttendanceJson = Record<string, { mark: string; note?: string } | string>;
/** Chuẩn hoá attendance JSONB → { studentId: mark } */
export { marksOf };
export function notesOf(att: Prisma.JsonValue | null): Record<string, string> {
  if (!att || typeof att !== 'object' || Array.isArray(att)) return {};
  return Object.fromEntries(
    Object.entries(att as AttendanceJson)
      .filter(([, v]) => typeof v !== 'string' && v.note)
      .map(([k, v]) => [k, (v as { note: string }).note])
  );
}

// ---------------- Số liệu (định nghĩa chung ở core/metrics.ts) ----------------

/** Chuyên cần theo học viên trong các lớp: (có mặt + đi muộn) / lượt đã điểm danh. */
export async function attendanceByStudent(classIds: string[]) {
  const classes = await prisma.class.findMany({ where: { id: { in: classIds } }, select: { id: true, examType: true } });
  const agg = aggregateStudents(await classMetrics(classes));
  return new Map([...agg].map(([k, v]) => [k, { ok: v.attendance.ok, total: v.attendance.total }]));
}

/** Mức nguy cơ — xem core/metrics.riskLevel */
export function riskOf(attendance?: { ok: number; total: number }, completion?: { done: number; total: number }) {
  return riskLevel(attendance, completion ? { ok: completion.done, total: completion.total } : undefined);
}

/** Tính lại class_members.risk_level cho cả lớp (sau điểm danh / nộp bài / chấm / đóng bài). */
export const recomputeRisk = (classId: string) => syncRiskCache([classId]);

// ---------------- DTO ----------------

/** ClassRoom (kèm số liệu thật) cho danh sách lớp. */
export async function toClassRooms(classes: (Class & { teacher: Pick<User, 'fullName'> })[]) {
  if (!classes.length) return [];
  const metrics = await classMetrics(classes);
  return classes.map((c) => {
    const m = metrics.get(c.id)!;
    return {
      id: c.id,
      name: c.name,
      code: c.code,
      examType: c.examType,
      level: c.level ?? undefined,
      description: c.description ?? undefined,
      teacherId: c.teacherId,
      teacherName: c.teacher.fullName,
      studentsCount: m.studentsCount,
      studentIds: m.studentIds,
      maxStudents: c.maxStudents ?? undefined,
      assignmentsCount: m.assignmentsCount,
      avgScore: m.avgScore,
      completionRate: m.completionRate,
      attendanceRate: m.attendanceRate,
      attendanceMarks: m.attendanceMarks,
      createdAt: ymd(c.createdAt)!,
      startDate: ymd(c.startDate),
      endDate: ymd(c.endDate),
      schedule: c.scheduleText ?? '',
      room: c.room ?? undefined,
      gradient: classGradient(c.id),
      coverUrl: c.coverUrl ?? undefined,
      isArchived: c.isArchived,
    };
  });
}

/** ClassStudent cho tập học viên thuộc các lớp `classIds` (gộp số liệu nếu học viên ở nhiều lớp). */
export async function toClassStudents(classIds: string[], _examType?: 'TOEIC' | 'VSTEP') {
  const classes = await prisma.class.findMany({ where: { id: { in: classIds } }, select: { id: true, examType: true } });
  const agg = aggregateStudents(await classMetrics(classes));
  const users = await prisma.user.findMany({ where: { id: { in: [...agg.keys()] } } });
  const byId = new Map(users.map((u) => [u.id, u]));
  return [...agg.entries()]
    .filter(([id]) => byId.has(id))
    .map(([id, v]) => {
      const user = byId.get(id)!;
      return {
        id,
        name: user.fullName,
        initials: initialsOf(user.fullName),
        avatarUrl: user.avatarUrl ?? undefined,
        email: user.email,
        avgScore: v.avgScore ?? 0,
        completion: rateOf(v.completion) ?? 0,
        attendanceRate: rateOf(v.attendance),
        streak: user.streakCurrent,
        lastActive: (user.lastActiveAt ?? user.createdAt).toISOString(),
        status: v.risk,
        classIds: v.classIds,
      };
    });
}

export function toSession(s: ClassSession & { class?: Pick<Class, 'name'> | null }) {
  const marks = marksOf(s.attendance);
  return {
    id: s.id,
    classId: s.classId,
    className: s.class?.name,
    date: ymd(s.sessionDate)!,
    start: hhmm(s.startTime),
    end: hhmm(s.endTime),
    room: s.room ?? '',
    topic: s.topic ?? '',
    status: s.status as 'DONE' | 'UPCOMING' | 'CANCELLED',
    attendance: Object.keys(marks).length ? marks : undefined,
    attendanceNotes: Object.keys(notesOf(s.attendance)).length ? notesOf(s.attendance) : undefined,
    note: s.note ?? undefined,
  };
}

type AssignmentWithClass = Assignment & { class: Pick<Class, 'name' | 'examType'> };

export async function toAssignments(rows: AssignmentWithClass[]) {
  if (!rows.length) return [];
  const stats = await prisma.assignmentSubmission.groupBy({ by: ['assignmentId', 'status'], where: { assignmentId: { in: rows.map((r) => r.id) } }, _count: { _all: true } });
  const avg = await prisma.assignmentSubmission.groupBy({ by: ['assignmentId'], where: { assignmentId: { in: rows.map((r) => r.id) }, status: 'GRADED', score: { not: null } }, _avg: { score: true } });
  return rows.map((a) => {
    const st = stats.filter((s) => s.assignmentId === a.id);
    const g = avg.find((x) => x.assignmentId === a.id)?._avg.score;
    return {
      id: a.id,
      classId: a.classId,
      className: a.class.name,
      title: a.title,
      type: a.type,
      dueDate: iso(a.dueAt) ?? '',
      openAt: iso(a.openAt),
      submitted: st.filter((s) => (DONE_STATUSES as readonly string[]).includes(s.status)).reduce((x, s) => x + s._count._all, 0),
      total: st.reduce((x, s) => x + s._count._all, 0),
      status: a.status as 'OPEN' | 'CLOSED' | 'DRAFT',
      avgScore: g === null || g === undefined ? undefined : round1(Number(g)),
      maxScore: num(a.maxScore),
      allowLate: a.allowLate,
      createdAt: ymd(a.createdAt)!,
      target: a.targetConfig as Prisma.JsonObject,
      note: a.note ?? undefined,
    };
  });
}

type SubmissionRow = AssignmentSubmission & {
  student: Pick<User, 'id' | 'fullName' | 'avatarUrl'>;
  assignment: Pick<Assignment, 'id' | 'title' | 'type' | 'maxScore' | 'classId'>;
  gradingSubmissions?: { criteriaScores: Prisma.JsonValue; isFinal: boolean; gradedAt: Date }[];
};

export function toSubmission(s: SubmissionRow) {
  const finalGrading = s.gradingSubmissions?.find((g) => g.isFinal) ?? s.gradingSubmissions?.[0];
  return {
    id: s.id,
    assignmentId: s.assignmentId,
    assignmentTitle: s.assignment.title,
    classId: s.assignment.classId,
    studentId: s.student.id,
    studentName: s.student.fullName,
    initials: initialsOf(s.student.fullName),
    avatarUrl: s.student.avatarUrl ?? undefined,
    submittedAt: iso(s.submittedAt) ?? '',
    score: num(s.score),
    maxScore: num(s.assignment.maxScore) ?? 10,
    status: (s.status === 'GRADED' ? 'GRADED' : s.status === 'LATE' ? 'LATE' : 'PENDING') as 'PENDING' | 'GRADED' | 'LATE',
    type: s.assignment.type,
    content: s.content ?? undefined,
    audioUrl: s.audioUrl ?? undefined,
    feedback: s.feedback ?? undefined,
    criteriaScores: (finalGrading?.criteriaScores as Record<string, number> | undefined) ?? undefined,
    draft: finalGrading && !finalGrading.isFinal ? true : undefined,
  };
}

export const submissionInclude = {
  student: { select: { id: true, fullName: true, avatarUrl: true } },
  assignment: { select: { id: true, title: true, type: true, maxScore: true, classId: true } },
  gradingSubmissions: { where: { graderType: 'TEACHER' }, orderBy: { gradedAt: 'desc' }, select: { criteriaScores: true, isFinal: true, gradedAt: true } },
} satisfies Prisma.AssignmentSubmissionInclude;

/** Gửi thông báo cho danh sách học viên. */
export async function notifyUsers(userIds: string[], n: { type: 'CLASS' | 'ASSIGNMENT' | 'REVIEW'; title: string; message: string; link?: string; refType?: string; refId?: string }) {
  if (!userIds.length) return;
  await prisma.notification.createMany({ data: userIds.map((userId) => ({ userId, ...n })) });
}

export async function activeStudentIds(classId: string) {
  return (await prisma.classMember.findMany({ where: { classId, status: 'ACTIVE' }, select: { studentId: true } })).map((m) => m.studentId);
}
