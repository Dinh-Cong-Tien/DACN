/**
 * Nghiệp vụ dùng chung của module giáo viên: kiểm tra quyền sở hữu lớp, tính số liệu lớp/học viên
 * và mapper DB → DTO theo hợp đồng frontend (ClassRoom, ClassStudent, Assignment, Submission, ClassSession…).
 */
import { Prisma, type Assignment, type AssignmentSubmission, type Class, type ClassSession, type User } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { forbidden, notFound, type AuthUser } from '../../core/http';
import { iso, num, ymd } from '../../core/dto';

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

const GRADIENTS = ['from-indigo-500 to-violet-600', 'from-emerald-500 to-teal-600', 'from-amber-400 to-orange-500', 'from-rose-500 to-pink-600', 'from-sky-500 to-cyan-600', 'from-violet-500 to-fuchsia-600'];
export const gradientOf = (id: string) => GRADIENTS[[...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % GRADIENTS.length];

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

export const round1 = (n: number) => Math.round(n * 10) / 10;
export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
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
export function marksOf(att: Prisma.JsonValue | null): Record<string, string> {
  if (!att || typeof att !== 'object' || Array.isArray(att)) return {};
  return Object.fromEntries(Object.entries(att as AttendanceJson).map(([k, v]) => [k, typeof v === 'string' ? v : v.mark]));
}
export function notesOf(att: Prisma.JsonValue | null): Record<string, string> {
  if (!att || typeof att !== 'object' || Array.isArray(att)) return {};
  return Object.fromEntries(
    Object.entries(att as AttendanceJson)
      .filter(([, v]) => typeof v !== 'string' && v.note)
      .map(([k, v]) => [k, (v as { note: string }).note])
  );
}

// ---------------- Số liệu ----------------

/** Điểm thi thử TB (lượt COMPLETED có điểm) theo học viên. */
async function avgScoreByStudent(studentIds: string[], examType?: 'TOEIC' | 'VSTEP') {
  if (!studentIds.length) return new Map<string, number>();
  const rows = await prisma.examAttempt.groupBy({
    by: ['userId'],
    where: { userId: { in: studentIds }, status: 'COMPLETED', scoreTotal: { not: null }, mode: 'FULL', test: examType ? { examType } : { isNot: null } },
    _avg: { scoreTotal: true },
  });
  return new Map(rows.map((r) => [r.userId, round1(Number(r._avg.scoreTotal ?? 0))]));
}

/** Tỷ lệ hoàn thành bài giao (đã nộp / được giao, bỏ bài nháp) theo học viên, trong tập lớp. */
async function completionByStudent(studentIds: string[], classIds: string[]) {
  if (!studentIds.length) return new Map<string, number>();
  const rows = await prisma.assignmentSubmission.groupBy({
    by: ['studentId', 'status'],
    where: { studentId: { in: studentIds }, assignment: { classId: { in: classIds }, deletedAt: null, status: { not: 'DRAFT' } } },
    _count: { _all: true },
  });
  const acc = new Map<string, { done: number; total: number }>();
  for (const r of rows) {
    const cur = acc.get(r.studentId) ?? { done: 0, total: 0 };
    cur.total += r._count._all;
    if ((DONE_STATUSES as readonly string[]).includes(r.status)) cur.done += r._count._all;
    acc.set(r.studentId, cur);
  }
  return new Map([...acc].map(([k, v]) => [k, pct(v.done, v.total)]));
}

/** Chuyên cần theo học viên: (có mặt + đi muộn) / số buổi đã điểm danh. */
export async function attendanceByStudent(classIds: string[]) {
  const sessions = await prisma.classSession.findMany({ where: { classId: { in: classIds }, status: 'DONE', NOT: { attendance: { equals: Prisma.DbNull } } }, select: { attendance: true } });
  const acc = new Map<string, { ok: number; total: number }>();
  for (const s of sessions) {
    for (const [sid, mark] of Object.entries(marksOf(s.attendance))) {
      const cur = acc.get(sid) ?? { ok: 0, total: 0 };
      cur.total += 1;
      if (mark === 'PRESENT' || mark === 'LATE') cur.ok += 1;
      acc.set(sid, cur);
    }
  }
  return acc;
}

/** Mức rủi ro: chuyên cần < 60% hoặc hoàn thành < 50% → RISK; < 80% / < 70% → WARNING. */
export function riskOf(attendance?: { ok: number; total: number }, completion?: { done: number; total: number }) {
  const a = attendance && attendance.total > 0 ? attendance.ok / attendance.total : 1;
  const c = completion && completion.total > 0 ? completion.done / completion.total : 1;
  // Ít hơn 3 buổi đã điểm danh / 2 bài đến hạn: chưa đủ dữ liệu để kết luận "nguy cơ", tối đa "cần chú ý"
  const enoughA = (attendance?.total ?? 0) >= 3;
  const enoughC = (completion?.total ?? 0) >= 2;
  if ((enoughA && a < 0.6) || (enoughC && c < 0.5)) return 'RISK';
  if (a < 0.8 || c < 0.7) return 'WARNING';
  return 'GOOD';
}

/** Tính lại class_members.risk_level cho cả lớp (sau điểm danh / nộp bài). */
export async function recomputeRisk(classId: string) {
  const members = await prisma.classMember.findMany({ where: { classId, status: 'ACTIVE' }, select: { id: true, studentId: true, riskLevel: true } });
  if (!members.length) return;
  const att = await attendanceByStudent([classId]);
  const subs = await prisma.assignmentSubmission.groupBy({
    by: ['studentId', 'status'],
    where: { studentId: { in: members.map((m) => m.studentId) }, assignment: { classId, deletedAt: null, status: { not: 'DRAFT' }, dueAt: { lt: new Date() } } },
    _count: { _all: true },
  });
  const comp = new Map<string, { done: number; total: number }>();
  for (const r of subs) {
    const cur = comp.get(r.studentId) ?? { done: 0, total: 0 };
    cur.total += r._count._all;
    if ((DONE_STATUSES as readonly string[]).includes(r.status)) cur.done += r._count._all;
    comp.set(r.studentId, cur);
  }
  await prisma.$transaction(
    members
      .map((m) => ({ m, level: riskOf(att.get(m.studentId), comp.get(m.studentId)) }))
      .filter(({ m, level }) => m.riskLevel !== level)
      .map(({ m, level }) => prisma.classMember.update({ where: { id: m.id }, data: { riskLevel: level } }))
  );
}

// ---------------- DTO ----------------

/** ClassRoom (kèm số liệu thật) cho danh sách lớp. */
export async function toClassRooms(classes: (Class & { teacher: Pick<User, 'fullName'> })[]) {
  const ids = classes.map((c) => c.id);
  if (!ids.length) return [];
  const [members, assignments, subs, att] = await Promise.all([
    prisma.classMember.findMany({ where: { classId: { in: ids }, status: 'ACTIVE' }, select: { classId: true, studentId: true } }),
    prisma.assignment.groupBy({ by: ['classId'], where: { classId: { in: ids }, deletedAt: null }, _count: { _all: true } }),
    prisma.assignmentSubmission.findMany({ where: { assignment: { classId: { in: ids }, deletedAt: null, status: { not: 'DRAFT' } } }, select: { status: true, assignment: { select: { classId: true } } } }),
    prisma.classSession.findMany({ where: { classId: { in: ids }, status: 'DONE' }, select: { classId: true, attendance: true } }),
  ]);
  const byClass = <T,>(rows: T[], key: (r: T) => string) => rows.reduce((m, r) => m.set(key(r), [...(m.get(key(r)) ?? []), r]), new Map<string, T[]>());
  const memberMap = byClass(members, (m) => m.classId);
  const subMap = byClass(subs, (s) => s.assignment.classId);
  const attMap = byClass(att, (s) => s.classId);
  const out = [];
  for (const c of classes) {
    const studentIds = (memberMap.get(c.id) ?? []).map((m) => m.studentId);
    const scores = await avgScoreByStudent(studentIds, c.examType);
    const vals = [...scores.values()];
    const cs = subMap.get(c.id) ?? [];
    let ok = 0;
    let total = 0;
    for (const s of attMap.get(c.id) ?? []) for (const mark of Object.values(marksOf(s.attendance))) (total++, (mark === 'PRESENT' || mark === 'LATE') && ok++);
    out.push({
      id: c.id,
      name: c.name,
      code: c.code,
      examType: c.examType,
      level: c.level ?? undefined,
      description: c.description ?? undefined,
      teacherId: c.teacherId,
      teacherName: c.teacher.fullName,
      studentsCount: studentIds.length,
      maxStudents: c.maxStudents ?? undefined,
      assignmentsCount: assignments.find((a) => a.classId === c.id)?._count._all ?? 0,
      avgScore: vals.length ? round1(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
      completionRate: pct(cs.filter((s) => (DONE_STATUSES as readonly string[]).includes(s.status)).length, cs.length),
      attendanceRate: pct(ok, total),
      createdAt: ymd(c.createdAt)!,
      startDate: ymd(c.startDate),
      endDate: ymd(c.endDate),
      schedule: c.scheduleText ?? '',
      room: c.room ?? undefined,
      gradient: gradientOf(c.id),
      coverUrl: c.coverUrl ?? undefined,
      isArchived: c.isArchived,
    });
  }
  return out;
}

/** ClassStudent cho tập học viên thuộc các lớp `classIds`. */
export async function toClassStudents(classIds: string[], examType?: 'TOEIC' | 'VSTEP') {
  const members = await prisma.classMember.findMany({
    where: { classId: { in: classIds }, status: 'ACTIVE' },
    include: { student: true },
    orderBy: { joinedAt: 'asc' },
  });
  const byStudent = new Map<string, { user: User; classIds: string[]; risk: string[] }>();
  for (const m of members) {
    const cur = byStudent.get(m.studentId) ?? { user: m.student, classIds: [], risk: [] };
    cur.classIds.push(m.classId);
    cur.risk.push(m.riskLevel);
    byStudent.set(m.studentId, cur);
  }
  const ids = [...byStudent.keys()];
  const [scores, completion, att] = await Promise.all([avgScoreByStudent(ids, examType), completionByStudent(ids, classIds), attendanceByStudent(classIds)]);
  const rank = { GOOD: 0, WARNING: 1, RISK: 2 } as Record<string, number>;
  return ids.map((id) => {
    const { user, classIds: cids, risk } = byStudent.get(id)!;
    const a = att.get(id);
    return {
      id,
      name: user.fullName,
      initials: initialsOf(user.fullName),
      avatarUrl: user.avatarUrl ?? undefined,
      email: user.email,
      avgScore: scores.get(id) ?? 0,
      completion: completion.get(id) ?? 0,
      attendanceRate: a ? pct(a.ok, a.total) : null,
      streak: user.streakCurrent,
      lastActive: (user.lastActiveAt ?? user.createdAt).toISOString(),
      status: risk.reduce((w, r) => (rank[r]! > rank[w]! ? r : w), 'GOOD') as 'GOOD' | 'WARNING' | 'RISK',
      classIds: cids,
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
