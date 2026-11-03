/**
 * Mapper + thống kê dùng chung cho module head và admin.
 * DTO khớp `frontend/src/shared/types/index.ts` (ClassRoom, ClassStudent, DeptStudent, TeacherSummary, SupportTicket…).
 */
import { Prisma, type Class, type ExamType, type User, type UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { forbidden } from '../../core/http';
import { iso, num, planOf, ymd } from '../../core/dto';
import { classGradient, classMetrics, rateOf, round1, type ClassMetrics } from '../../core/metrics';

const GRADIENTS = [
  'from-indigo-500 via-violet-500 to-fuchsia-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-amber-400 via-orange-500 to-rose-500',
  'from-sky-500 via-blue-500 to-indigo-500',
  'from-rose-500 via-pink-500 to-fuchsia-500',
  'from-violet-500 via-purple-500 to-indigo-500',
];
export const gradientOf = (key: string) => {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
};
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
export { round1, pct } from '../../core/metrics';

/** Phạm vi bộ môn của trưởng bộ môn: departments.head_id = mình, hoặc users.department_id. ADMIN = mọi bộ môn. */
export async function deptScope(user: { id: string; role: UserRole }): Promise<string[] | null> {
  if (user.role === 'ADMIN') return null;
  const [led, me] = await Promise.all([
    prisma.department.findMany({ where: { headId: user.id, deletedAt: null }, select: { id: true } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { departmentId: true } }),
  ]);
  const ids = new Set(led.map((d) => d.id));
  if (me?.departmentId) ids.add(me.departmentId);
  if (!ids.size) throw forbidden('Bạn chưa được gán bộ môn nào');
  return [...ids];
}
/** where cho Class trong phạm vi */
export const classWhere = (scope: string[] | null): Prisma.ClassWhereInput => ({ deletedAt: null, ...(scope ? { departmentId: { in: scope } } : {}) });

/** Số liệu lớp — định nghĩa thống nhất ở core/metrics.ts (dùng chung với giáo viên, học viên, admin) */
export type ClassStats = ClassMetrics;
export const classStats = (classes: Pick<Class, 'id' | 'examType'>[]) => classMetrics(classes);

type ClassWithTeacher = Class & { teacher: Pick<User, 'fullName'> };
export const classInclude = { teacher: { select: { fullName: true } } } as const;

/** ClassRoom */
export function toClassRoom(c: ClassWithTeacher, s?: ClassStats) {
  return {
    id: c.id,
    name: c.name,
    code: c.code,
    examType: c.examType,
    teacherName: c.teacher.fullName,
    teacherId: c.teacherId,
    departmentId: c.departmentId,
    studentsCount: s?.studentsCount ?? 0,
    /** Để đếm học viên KHÁC NHAU khi gộp nhiều lớp (không cộng sĩ số) */
    studentIds: s?.studentIds ?? [],
    assignmentsCount: s?.assignmentsCount ?? 0,
    avgScore: s?.avgScore ?? 0,
    completionRate: s?.completionRate ?? 0,
    attendanceRate: s?.attendanceRate ?? 0,
    attendanceMarks: s?.attendanceMarks ?? 0,
    createdAt: c.createdAt.toISOString(),
    schedule: c.scheduleText ?? '',
    room: c.room ?? undefined,
    gradient: classGradient(c.id),
    coverUrl: c.coverUrl ?? undefined,
    level: c.level ?? undefined,
    description: c.description ?? undefined,
    startDate: ymd(c.startDate),
    endDate: ymd(c.endDate),
    maxStudents: c.maxStudents ?? undefined,
    isArchived: c.isArchived,
  };
}

/** DeptStudent cho danh sách học viên của các lớp */
export async function deptStudents(classes: Pick<Class, 'id' | 'examType'>[]) {
  const stats = await classStats(classes);
  const members = await prisma.classMember.findMany({
    where: { classId: { in: classes.map((c) => c.id) }, status: 'ACTIVE' },
    include: { student: true },
    orderBy: { joinedAt: 'asc' },
  });
  return members.map((m) => {
    const p = stats.get(m.classId)?.perStudent.get(m.studentId);
    return {
      id: m.student.id,
      name: m.student.fullName,
      initials: initials(m.student.fullName),
      avatarUrl: m.student.avatarUrl ?? undefined,
      email: m.student.email,
      avgScore: p?.avgScore ?? 0,
      completion: rateOf(p?.completion) ?? 0,
      streak: m.student.streakCurrent,
      lastActive: (m.student.lastActiveAt ?? m.student.createdAt).toISOString(),
      status: p?.risk ?? 'GOOD',
      classId: m.classId,
      attendance: rateOf(p?.attendance) ?? 0,
    };
  });
}

/** TeacherSummary cho danh sách giáo viên */
export async function teacherSummaries(where: Prisma.UserWhereInput) {
  const teachers = await prisma.user.findMany({
    where: { deletedAt: null, role: { in: ['TEACHER', 'HEAD_TEACHER'] }, ...where },
    include: { department: { select: { name: true } }, classTeachers: { where: { deletedAt: null, isArchived: false }, select: { id: true, examType: true } } },
    orderBy: { fullName: 'asc' },
  });
  const stats = await classStats(teachers.flatMap((t) => t.classTeachers));
  return teachers.map((t) => {
    const ss = t.classTeachers.map((c) => stats.get(c.id)!).filter(Boolean);
    const scored = ss.filter((s) => s.hasScore);
    return {
      id: t.id,
      name: t.fullName,
      initials: initials(t.fullName),
      avatarUrl: t.avatarUrl ?? undefined,
      email: t.email,
      subject: t.department?.name ?? '',
      classesCount: ss.length,
      // Số học viên KHÁC NHAU qua các lớp (khớp tổng quan của giáo viên và trang đội ngũ)
      studentsCount: new Set(ss.flatMap((s) => s.studentIds)).size,
      avgClassScore: scored.length ? round1(scored.reduce((a, s) => a + s.avgScore, 0) / scored.length) : 0,
      status: t.status,
      role: t.role,
      departmentId: t.departmentId,
      bio: t.bio ?? undefined,
      phone: t.phone ?? undefined,
      joinedAt: t.createdAt.toISOString(),
    };
  });
}

/** Xếp loại lớp theo điểm (quy về %) + chuyên cần */
export function gradeOf(examType: ExamType, avgScore: number, attendance: number): 'A' | 'B' | 'C' | 'D' {
  const scorePct = examType === 'TOEIC' ? (avgScore / 990) * 100 : avgScore * 10;
  const v = avgScore ? scorePct * 0.7 + attendance * 0.3 : attendance;
  return v >= 75 ? 'A' : v >= 65 ? 'B' : v >= 50 ? 'C' : 'D';
}

/** ClassSession → dòng lịch (dùng cho lịch dạy, dự giờ) */
export const hhmm = (d: Date) => d.toISOString().slice(11, 16);

/** SupportTicket / Complaint */
type TicketFull = Prisma.TicketGetPayload<{
  include: { user: true; assignee: { select: { fullName: true } }; question: { select: { id: true; part: true; stem: true } }; submission: { select: typeof submissionRef }; ticketMessageTickets: true };
}>;
/** Bài nộp được phúc khảo: tên bài, lớp, điểm hiện tại */
const submissionRef = { id: true, score: true, assignment: { select: { title: true, type: true, maxScore: true, class: { select: { id: true, name: true } } } } } as const;
export const ticketInclude = {
  user: true,
  assignee: { select: { fullName: true } },
  question: { select: { id: true, part: true, stem: true } },
  submission: { select: submissionRef },
  ticketMessageTickets: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.TicketInclude;

const TICKET_STATUS: Record<string, 'OPEN' | 'PENDING' | 'RESOLVED'> = { OPEN: 'OPEN', IN_REVIEW: 'PENDING', PENDING: 'PENDING', RESOLVED: 'RESOLVED', REJECTED: 'RESOLVED' };
export async function toSupportTicket(t: TicketFull) {
  return {
    id: t.id,
    userName: t.user?.fullName ?? t.guestName ?? 'Khách',
    email: t.user?.email ?? t.guestEmail ?? '',
    avatarUrl: t.user?.avatarUrl ?? undefined,
    plan: t.userId ? await planOf(t.userId) : ('FREE' as const),
    channel: (t.channel === 'IN_APP' ? 'CHAT' : t.channel) as 'CHAT' | 'EMAIL' | 'PHONE',
    category: (t.category === 'ACADEMIC' ? 'CONTENT' : t.category) as 'ACCOUNT' | 'PAYMENT' | 'EXAM' | 'CONTENT' | 'OTHER',
    subject: t.subject,
    status: TICKET_STATUS[t.status] ?? 'OPEN',
    rawStatus: t.status,
    priority: t.priority as 'LOW' | 'NORMAL' | 'HIGH',
    createdAt: t.createdAt.toISOString(),
    assignee: t.assignee?.fullName,
    assigneeId: t.assigneeId ?? undefined,
    resolution: t.resolution ?? undefined,
    messages: t.ticketMessageTickets.map((m) => ({ from: (m.senderType === 'USER' ? 'USER' : 'STAFF') as 'USER' | 'STAFF', text: m.text, at: m.createdAt.toISOString() })),
  };
}

const COMPLAINT_STATUS: Record<string, 'NEW' | 'IN_REVIEW' | 'RESOLVED'> = { OPEN: 'NEW', IN_REVIEW: 'IN_REVIEW', PENDING: 'IN_REVIEW', RESOLVED: 'RESOLVED', REJECTED: 'RESOLVED' };
const PART_LABEL = (p?: string | null) => (p ? p.replace('TOEIC_P', 'Part ').replace('VSTEP_', 'VSTEP ') : '');
export function toComplaint(t: TicketFull) {
  const first = t.ticketMessageTickets.find((m) => m.senderType === 'USER') ?? t.ticketMessageTickets[0];
  return {
    id: t.id,
    student: t.user?.fullName ?? t.guestName ?? 'Khách',
    studentEmail: t.user?.email ?? t.guestEmail ?? undefined,
    avatarUrl: t.user?.avatarUrl ?? undefined,
    subject: t.subject,
    questionRef: t.question
      ? `${PART_LABEL(t.question.part)} · ${t.question.stem.slice(0, 60)}`
      : t.submission
        ? `${t.submission.assignment.class.name} · ${t.submission.assignment.title} · ${t.submission.score === null ? 'chưa có điểm' : `${Number(t.submission.score)}/${Number(t.submission.assignment.maxScore)}`}`
        : (t.academicIssue ?? ''),
    questionId: t.questionId ?? undefined,
    /** Phúc khảo bài nộp (Viết / Nói) */
    submissionId: t.submissionId ?? undefined,
    kind: t.submissionId ? ('APPEAL' as const) : t.questionId ? ('QUESTION' as const) : ('OTHER' as const),
    issue: t.academicIssue ?? undefined,
    content: first?.text ?? '',
    status: COMPLAINT_STATUS[t.status] ?? 'NEW',
    createdAt: t.createdAt.toISOString(),
    resolution: t.resolution ?? undefined,
    messages: t.ticketMessageTickets.map((m) => ({ from: m.senderType, text: m.text, at: m.createdAt.toISOString() })),
  };
}

/** Số tháng gần nhất dạng nhãn Th5…Th10 + khoảng thời gian */
export function lastMonths(n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (n - 1 - i), 1));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    return { label: `Th${d.getUTCMonth() + 1}`, start: d, end };
  });
}

export { iso, num };
