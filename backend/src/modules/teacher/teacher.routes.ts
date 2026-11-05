/**
 * Module giáo viên — /api/v1/teacher (chức năng cơ bản).
 * Mọi route: đăng nhập + vai trò TEACHER/HEAD_TEACHER (ADMIN luôn được phép); chỉ thao tác trên lớp mình phụ trách.
 * Luồng ghi: #7 GV chấm bài, #12 Điểm danh (KE_HOACH mục 10.7).
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { Router, type Request } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { z } from 'zod';
import { Prisma, type ExamPart } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { allow, auth, liveUser } from '../../core/auth';
import { badRequest, forbidden, handler, me, notFound, parse, unauthorized } from '../../core/http';
import { iso, num, ymd } from '../../core/dto';
import {
  DONE_STATUSES,
  activeStudentIds,
  assertAssignment,
  assertClass,
  assertStudent,
  dateOf,
  formatSize,
  myClassIds,
  notifyUsers,
  ownClassWhere,
  pct,
  recomputeRisk,
  round1,
  submissionInclude,
  timeOf,
  toAssignments,
  toClassRooms,
  toClassStudents,
  toSession,
  toSubmission,
} from './teacher.service';

import { contentRouter } from './teacher.content';
import { insightsRouter } from './teacher.insights';
import { MODE_LABEL, mistakeSummaryOf, selfStudyOf } from './insights.service';
import { completedAttempts } from '../catalog/counts';
import { gradeLessonAssignments } from '../catalog/lesson-assignments';
import { toExercises } from '../catalog/lesson-exercises';
import { byTitleNatural, levelLabel } from '../catalog/mappers';
import { CLASS_TRACK, classCourseData, classCourseProgress, classCourseSelect, classTrackData, enrollClassCourse, nextClassName } from '../catalog/class-track';

export const teacherRouter = Router();

// =====================================================================
// FILE TÀI LIỆU LỚP — đặt TRƯỚC middleware vai trò để học viên trong lớp cũng mở được.
// Thẻ <a>/<iframe> không gửi được header nên nhận access token qua ?token= (hoặc header Bearer).
// =====================================================================
export const MATERIAL_DIR = path.resolve(__dirname, '../../../uploads/materials');
const MIME_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/plain': 'txt',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};
const FILE_NAME = /^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

teacherRouter.get(
  '/files/:key',
  handler(async (req, res) => {
    const key = String(req.params.key);
    const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined;
    const raw = typeof req.query.token === 'string' ? req.query.token : bearer;
    if (!raw) throw unauthorized('Bạn cần đăng nhập để mở tài liệu');
    let viewer: { id: string; role: string };
    try {
      const p = jwt.verify(raw, env.JWT_SECRET) as { sub: string; role: string };
      viewer = { id: p.sub, role: p.role };
    } catch {
      throw unauthorized('Phiên đăng nhập hết hạn, tải lại trang rồi mở lại tài liệu');
    }
    // Trạng thái/vai trò thật trong DB (tài khoản bị khoá/xoá không mở được tài liệu dù token còn hạn)
    const live = await liveUser(viewer.id);
    if (!live || live.deleted || live.status === 'LOCKED') throw unauthorized('Tài khoản không còn hiệu lực');
    viewer.role = live.role;
    if (!FILE_NAME.test(key)) throw notFound('Tài liệu');
    const url = `/api/v1/teacher/files/${key}`;
    const m = await prisma.material.findFirst({ where: { fileUrl: url, deletedAt: null }, include: { class: { select: { teacherId: true } } } });
    if (!m || !m.classId) throw notFound('Tài liệu');
    const member = await prisma.classMember.findFirst({ where: { classId: m.classId, studentId: viewer.id, status: 'ACTIVE' }, select: { id: true } });
    const allowed = viewer.role === 'ADMIN' || viewer.role === 'HEAD_TEACHER' || m.class?.teacherId === viewer.id || !!member;
    if (!allowed) throw forbidden('Chỉ thành viên lớp mới mở được tài liệu này');
    const file = path.join(MATERIAL_DIR, key);
    if (!fs.existsSync(file)) throw notFound('Tệp tài liệu');
    const media = await prisma.mediaFile.findFirst({ where: { storageKey: `materials/${key}` }, select: { mimeType: true } });
    // Học viên mở tài liệu → tính một lượt tải
    if (member) await prisma.material.update({ where: { id: m.id }, data: { downloadsCount: { increment: 1 } } });
    const ext = key.split('.').pop();
    res.setHeader('Content-Type', media?.mimeType ?? 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(`${m.title}.${ext}`)}`);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.sendFile(file);
  })
);

teacherRouter.use(auth, allow('TEACHER', 'HEAD_TEACHER'));
/** Học liệu giáo viên tự soạn, gửi trưởng bộ môn duyệt */
teacherRouter.use('/content', contentRouter);
teacherRouter.use(insightsRouter);

// Id trên URL phải là UUID (bài tự luyện dùng dạng `ans:<uuid>`), sai định dạng → 404 thay vì lỗi Prisma
for (const name of ['id', 'studentId']) {
  teacherRouter.param(name, (_req, _res, next, value: string) => {
    const v = value.startsWith('ans:') ? value.slice(4) : value;
    next(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ? undefined : notFound('Dữ liệu'));
  });
}

/** Express 5 typings: params có thể là string[] */
const P = (req: Request, k = 'id') => String(req.params[k]);
const uuid = z.string().uuid();
const isUuid = (s: string) => uuid.safeParse(s).success;
const ymdStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const hm = z.string().regex(/^\d{2}:\d{2}$/);
const classInclude = { teacher: { select: { fullName: true } }, course: classCourseSelect } as const;

/** PART_1 ↔ TOEIC_P1 (frontend dùng PART_n cho TOEIC, VSTEP_LISTENING… cho VSTEP). */
const FE_PART: Record<string, string> = { TOEIC_P1: 'PART_1', TOEIC_P2: 'PART_2', TOEIC_P3: 'PART_3', TOEIC_P4: 'PART_4', TOEIC_P5: 'PART_5', TOEIC_P6: 'PART_6', TOEIC_P7: 'PART_7' };
const toDbParts = (parts: string[]): ExamPart[] =>
  parts.flatMap((p) => {
    const m = /^PART_(\d)$/.exec(p);
    if (m) return [`TOEIC_P${m[1]}` as ExamPart];
    if (p === 'VSTEP_LISTENING') return ['VSTEP_L1', 'VSTEP_L2', 'VSTEP_L3'] as ExamPart[];
    if (p === 'VSTEP_READING') return ['VSTEP_R1', 'VSTEP_R2', 'VSTEP_R3', 'VSTEP_R4'] as ExamPart[];
    if (p === 'VSTEP_WRITING') return ['VSTEP_W1', 'VSTEP_W2'] as ExamPart[];
    if (p === 'VSTEP_SPEAKING') return ['VSTEP_S1', 'VSTEP_S2', 'VSTEP_S3'] as ExamPart[];
    return /^(TOEIC|VSTEP)_/.test(p) ? [p as ExamPart] : [];
  });
const feGroupOfPart = (part: string) => FE_PART[part] ?? (part.startsWith('VSTEP_L') ? 'VSTEP_LISTENING' : part.startsWith('VSTEP_R') ? 'VSTEP_READING' : part.startsWith('VSTEP_W') ? 'VSTEP_WRITING' : 'VSTEP_SPEAKING');

/** Tìm theo id (uuid) hoặc slug. */
const byIdOrSlug = (v: string) => (isUuid(v) ? { OR: [{ id: v }, { slug: v }] } : { slug: v });

// =====================================================================
// DASHBOARD
// =====================================================================

/** Tuần (T2–CN) chứa ngày `d`, theo giờ VN. */
function weekRange(d = new Date()) {
  const vn = new Date(d.getTime() + 7 * 3600_000);
  const day = (vn.getUTCDay() + 6) % 7; // 0 = Thứ Hai
  const from = new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate() - day));
  const to = new Date(from.getTime() + 6 * 86400_000);
  return { from, to };
}

teacherRouter.get(
  '/dashboard',
  handler(async (req) => {
    const u = me(req);
    const classes = await prisma.class.findMany({ where: { ...ownClassWhere(u), isArchived: false }, include: classInclude, orderBy: [{ createdAt: 'asc' }, { name: 'asc' }] });
    const ids = classes.map((c) => c.id);
    const { from, to } = weekRange();
    const todayVn = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
    const [rooms, students, sessions, deadlines, pending, nextRows, unmarkedPast, oldestUnmarked] = await Promise.all([
      toClassRooms(classes),
      toClassStudents(ids),
      prisma.classSession.findMany({ where: { classId: { in: ids }, sessionDate: { gte: from, lte: to } }, include: { class: { select: { name: true } } }, orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }] }),
      prisma.assignment.findMany({ where: { classId: { in: ids }, deletedAt: null, status: 'OPEN', dueAt: { gte: new Date() } }, include: { class: { select: { name: true, examType: true } } }, orderBy: { dueAt: 'asc' }, take: 6 }),
      prisma.assignmentSubmission.findMany({
        where: { status: { in: ['SUBMITTED', 'LATE'] }, assignment: { classId: { in: ids }, deletedAt: null, type: { in: ['ESSAY', 'SPEAKING'] } } },
        include: submissionInclude,
        orderBy: { submittedAt: 'asc' },
      }),
      prisma.classSession.findMany({
        where: { classId: { in: ids }, status: 'UPCOMING', sessionDate: { gte: dateOf(todayVn) } },
        include: { class: { select: { name: true } } },
        orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
        take: 8,
      }),
      // Buổi đã qua (trước hôm nay) mà vẫn UPCOMING = chưa điểm danh
      prisma.classSession.count({ where: { classId: { in: ids }, status: 'UPCOMING', sessionDate: { lt: dateOf(todayVn) } } }),
      prisma.classSession.findFirst({ where: { classId: { in: ids }, status: 'UPCOMING', sessionDate: { lt: dateOf(todayVn) } }, orderBy: [{ sessionDate: 'desc' }, { startTime: 'desc' }], select: { id: true } }),
    ]);
    // Buổi kế tiếp: chưa kết thúc (so theo giờ VN)
    const nowHm = new Date(Date.now() + 7 * 3600_000).toISOString().slice(11, 16);
    const next = nextRows.map(toSession).find((x) => x.date > todayVn || x.end > nowHm);
    // Chuyên cần chung = tổng lượt có mặt / tổng lượt đã điểm danh của mọi lớp (không lấy TB các %)
    const attMarks = rooms.reduce((a, r) => a + r.attendanceMarks, 0);
    const attOk = rooms.reduce((a, r) => a + Math.round((r.attendanceRate / 100) * r.attendanceMarks), 0);
    return {
      stats: {
        classes: rooms.length,
        students: students.length,
        pendingGrading: pending.length,
        lateSubmissions: pending.filter((p) => p.status === 'LATE').length,
        attendanceRate: attMarks ? Math.round((attOk / attMarks) * 100) : 0,
        attendanceMarks: attMarks,
        atRiskCount: students.filter((s) => s.status !== 'GOOD').length,
        sessionsThisWeek: sessions.filter((s) => s.status !== 'CANCELLED').length,
        unmarkedPastSessions: unmarkedPast,
      },
      latestUnmarkedSessionId: oldestUnmarked?.id ?? null,
      classes: rooms,
      atRisk: students.filter((s) => s.status !== 'GOOD').sort((a, b) => (a.status === 'RISK' ? -1 : 1) - (b.status === 'RISK' ? -1 : 1)).slice(0, 6),
      sessions: sessions.map(toSession),
      upcomingDeadlines: await toAssignments(deadlines),
      pendingSubmissions: pending.slice(0, 8).map(toSubmission),
      week: { from: ymd(from), to: ymd(to) },
      nextSession: next ?? null,
    };
  })
);

// =====================================================================
// LỚP HỌC
// =====================================================================

teacherRouter.get(
  '/classes',
  handler(async (req) => {
    const { archived } = parse(z.object({ archived: z.enum(['true', 'false', 'all']).default('false') }), req.query);
    const classes = await prisma.class.findMany({
      where: { ...ownClassWhere(me(req)), ...(archived === 'all' ? {} : { isArchived: archived === 'true' }) },
      include: classInclude,
      orderBy: [{ createdAt: 'asc' }, { name: 'asc' }],
    });
    return toClassRooms(classes);
  })
);

teacherRouter.get(
  '/classes/:id',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    const full = await prisma.class.findUniqueOrThrow({ where: { id: c.id }, include: classInclude });
    const [room] = await toClassRooms([full]);
    const [students, announcements, materials, assignments, sessions] = await Promise.all([
      toClassStudents([c.id], c.examType),
      prisma.classAnnouncement.findMany({ where: { classId: c.id, deletedAt: null }, orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }] }),
      prisma.material.findMany({ where: { classId: c.id, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.assignment.findMany({ where: { classId: c.id, deletedAt: null }, include: { class: { select: { name: true, examType: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.classSession.findMany({ where: { classId: c.id }, orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }] }),
    ]);
    return {
      ...room,
      students,
      // tiến độ khoá học của từng học viên trong lớp
      courseProgress: c.courseId ? await classCourseProgress(c.courseId, students.map((s) => s.id)) : undefined,
      announcements: announcements.map(toAnnouncement),
      materials: materials.map(toMaterial),
      assignments: await toAssignments(assignments),
      sessions: sessions.map(toSession),
    };
  })
);

const classBody = z.object({
  /** không gửi khi mở lớp → tự đặt "<khoá> · Lớp N" */
  name: z.string().trim().min(2).max(160).optional(),
  /** Khoá học của lớp (id hoặc slug) — lớp nằm trong khoá, mục / kỳ thi lấy theo khoá */
  courseId: z.string().trim().min(1).max(140).optional(),
  /** Lớp chưa gắn khoá: mục TOEIC / VSTEP / THPT (gửi track hoặc examType) */
  track: CLASS_TRACK.optional(),
  examType: z.enum(['TOEIC', 'VSTEP']).optional(),
  level: z.string().max(20).nullish(),
  description: z.string().max(5000).nullish(),
  room: z.string().max(80).nullish(),
  schedule: z.string().max(120).nullish(),
  coverUrl: z.string().url().nullish(),
  startDate: ymdStr.nullish(),
  endDate: ymdStr.nullish(),
  maxStudents: z.number().int().min(1).max(500).nullish(),
});

async function uniqueClassCode() {
  for (let i = 0; i < 20; i++) {
    const code = `ORB-${crypto.randomBytes(3).toString('base64url').replace(/[-_]/g, 'X').slice(0, 4).toUpperCase()}`;
    if (!(await prisma.class.findUnique({ where: { code }, select: { id: true } }))) return code;
  }
  throw badRequest('Không sinh được mã lớp, thử lại');
}

const classData = ({ courseId: _c, ...b }: Partial<z.infer<typeof classBody>>) => ({
  name: b.name,
  ...classTrackData(b),
  level: b.level,
  description: b.description,
  room: b.room,
  scheduleText: b.schedule,
  coverUrl: b.coverUrl,
  startDate: b.startDate === undefined ? undefined : b.startDate ? dateOf(b.startDate) : null,
  endDate: b.endDate === undefined ? undefined : b.endDate ? dateOf(b.endDate) : null,
  maxStudents: b.maxStudents,
});

teacherRouter.post(
  '/classes',
  handler(async (req) => {
    const u = me(req);
    const body = parse(classBody, req.body);
    if (!body.courseId) throw badRequest('Chọn khoá học của lớp', 'COURSE_REQUIRED');
    const cc = await classCourseData(body.courseId);
    const teacher = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    const c = await prisma.class.create({
      data: { ...classData(body), ...cc, name: body.name || (await nextClassName(prisma, cc.courseId)), examType: cc.examType, code: await uniqueClassCode(), teacherId: u.id, departmentId: teacher.departmentId },
      include: classInclude,
    });
    return (await toClassRooms([c]))[0];
  })
);

teacherRouter.patch(
  '/classes/:id',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    const body = parse(classBody.partial(), req.body);
    const cc = body.courseId ? await classCourseData(body.courseId) : null;
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.class.update({ where: { id: c.id }, data: { ...classData(body), ...(cc ?? {}) }, include: classInclude });
      // đổi khoá → học viên đang trong lớp được ghi danh khoá mới
      if (cc && cc.courseId !== c.courseId) await enrollClassCourse(tx, cc.courseId, (await tx.classMember.findMany({ where: { classId: c.id, status: 'ACTIVE' }, select: { studentId: true } })).map((m) => m.studentId));
      return row;
    });
    return (await toClassRooms([updated]))[0];
  })
);

/** Lưu trữ / mở lại lớp. */
teacherRouter.post(
  '/classes/:id/archive',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    const { archived } = parse(z.object({ archived: z.boolean().default(true) }), req.body ?? {});
    await prisma.class.update({ where: { id: c.id }, data: { isArchived: archived } });
    return { id: c.id, isArchived: archived };
  })
);

/** Đổi mã mời lớp. */
teacherRouter.post(
  '/classes/:id/regenerate-code',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    const updated = await prisma.class.update({ where: { id: c.id }, data: { code: await uniqueClassCode() } });
    return { id: c.id, code: updated.code };
  })
);

// ---------- Học viên trong lớp ----------

teacherRouter.get(
  '/classes/:id/students',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    return toClassStudents([c.id], c.examType);
  })
);

teacherRouter.post(
  '/classes/:id/students',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    const body = parse(z.object({ emails: z.array(z.string().trim().toLowerCase().email()).max(200).optional(), studentIds: z.array(uuid).max(200).optional() }).refine((b) => b.emails?.length || b.studentIds?.length, 'Cần emails hoặc studentIds'), req.body);
    const users = await prisma.user.findMany({
      where: { deletedAt: null, role: 'STUDENT', OR: [{ email: { in: body.emails ?? [] } }, { id: { in: body.studentIds ?? [] } }] },
      select: { id: true, email: true },
    });
    const notFoundEmails = (body.emails ?? []).filter((e) => !users.some((u) => u.email.toLowerCase() === e));
    if (c.maxStudents) {
      const cur = await prisma.classMember.count({ where: { classId: c.id, status: 'ACTIVE' } });
      if (cur + users.length > c.maxStudents) throw badRequest(`Lớp tối đa ${c.maxStudents} học viên`);
    }
    await prisma.$transaction(async (tx) => {
      for (const s of users) await tx.classMember.upsert({ where: { classId_studentId: { classId: c.id, studentId: s.id } }, create: { classId: c.id, studentId: s.id }, update: { status: 'ACTIVE', joinedAt: new Date() } });
      // vào lớp = học theo khoá của lớp
      await enrollClassCourse(tx, c.courseId, users.map((s) => s.id));
    });
    // Bài đang mở: tạo sẵn bài nộp TODO cho học viên mới
    const open = await prisma.assignment.findMany({ where: { classId: c.id, deletedAt: null, status: 'OPEN' }, select: { id: true } });
    if (open.length) await prisma.assignmentSubmission.createMany({ data: open.flatMap((a) => users.map((s) => ({ assignmentId: a.id, studentId: s.id }))), skipDuplicates: true });
    await notifyUsers(users.map((s) => s.id), { type: 'CLASS', title: `Bạn đã được thêm vào lớp ${c.name}`, message: `Mã lớp ${c.code}. Xem bảng tin và bài tập trong mục Lớp của tôi.`, link: '/app/classes', refType: 'CLASS', refId: c.id });
    return { added: users.length, notFound: notFoundEmails, students: await toClassStudents([c.id], c.examType) };
  })
);

teacherRouter.delete(
  '/classes/:id/students/:studentId',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    const studentId = P(req, 'studentId');
    const removed = await prisma.$transaction(async (tx) => {
      const r = await tx.classMember.updateMany({ where: { classId: c.id, studentId, status: 'ACTIVE' }, data: { status: 'REMOVED' } });
      if (!r.count) return 0;
      // Bài chưa làm của học viên đã rời lớp không còn tính vào tiến độ lớp
      await tx.assignmentSubmission.deleteMany({ where: { studentId, status: 'TODO', assignment: { classId: c.id } } });
      return r.count;
    });
    if (!removed) throw notFound('Học viên trong lớp');
    await recomputeRisk(c.id);
    return { ok: true };
  })
);

// =====================================================================
// LỊCH DẠY & ĐIỂM DANH (luồng #12)
// =====================================================================

teacherRouter.get(
  '/sessions',
  handler(async (req) => {
    const u = me(req);
    const q = parse(z.object({ from: ymdStr.optional(), to: ymdStr.optional(), classId: uuid.optional() }), req.query);
    const ids = q.classId ? [(await assertClass(u, q.classId)).id] : await myClassIds(u, false);
    const wk = weekRange();
    const rows = await prisma.classSession.findMany({
      where: { classId: { in: ids }, sessionDate: { gte: q.from ? dateOf(q.from) : wk.from, lte: q.to ? dateOf(q.to) : wk.to } },
      include: { class: { select: { name: true } } },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    });
    return rows.map(toSession);
  })
);

async function assertSession(req: Parameters<typeof me>[0], id: string) {
  const s = await prisma.classSession.findUnique({ where: { id } });
  if (!s) throw notFound('Buổi học');
  await assertClass(me(req), s.classId);
  return s;
}

teacherRouter.get(
  '/sessions/:id',
  handler(async (req) => {
    const s = await assertSession(req, P(req));
    const full = await prisma.classSession.findUniqueOrThrow({ where: { id: s.id }, include: { class: { select: { name: true } } } });
    const students = await toClassStudents([s.classId]);
    return { ...toSession(full), students };
  })
);

const sessionBody = z.object({
  date: ymdStr,
  start: hm,
  end: hm,
  room: z.string().max(80).nullish(),
  topic: z.string().max(200).nullish(),
  note: z.string().max(5000).nullish(),
  status: z.enum(['UPCOMING', 'DONE', 'CANCELLED']).optional(),
});

/** Thêm buổi (dạy bù / buổi ngoài lịch). */
teacherRouter.post(
  '/classes/:id/sessions',
  handler(async (req) => {
    const u = me(req);
    const c = await assertClass(u, P(req));
    const b = parse(sessionBody, req.body);
    if (b.end <= b.start) throw badRequest('Giờ kết thúc phải sau giờ bắt đầu');
    const s = await prisma.classSession.create({
      data: { classId: c.id, teacherId: u.id, sessionDate: dateOf(b.date), startTime: timeOf(b.start), endTime: timeOf(b.end), room: b.room ?? c.room, topic: b.topic, note: b.note, status: b.status ?? 'UPCOMING' },
      include: { class: { select: { name: true } } },
    });
    const ids = await activeStudentIds(c.id);
    await notifyUsers(ids, { type: 'CLASS', title: `Lịch học mới — ${c.name}`, message: `${b.date.split('-').reverse().join('/')} · ${b.start}–${b.end}${b.room ?? c.room ? ` · ${b.room ?? c.room}` : ''}`, link: '/app/classes', refType: 'SESSION', refId: s.id });
    return toSession(s);
  })
);

/** Cập nhật giáo án, ghi chú, đổi lịch, huỷ buổi. */
teacherRouter.patch(
  '/sessions/:id',
  handler(async (req) => {
    const s = await assertSession(req, P(req));
    const b = parse(sessionBody.partial(), req.body);
    const start = b.start ?? s.startTime.toISOString().slice(11, 16);
    const end = b.end ?? s.endTime.toISOString().slice(11, 16);
    if (end <= start) throw badRequest('Giờ kết thúc phải sau giờ bắt đầu');
    const updated = await prisma.classSession.update({
      where: { id: s.id },
      data: {
        sessionDate: b.date ? dateOf(b.date) : undefined,
        startTime: b.start ? timeOf(b.start) : undefined,
        endTime: b.end ? timeOf(b.end) : undefined,
        room: b.room,
        topic: b.topic,
        note: b.note,
        status: b.status,
      },
      include: { class: { select: { name: true } } },
    });
    if (b.status === 'CANCELLED' && s.status !== 'CANCELLED') {
      await notifyUsers(await activeStudentIds(s.classId), { type: 'CLASS', title: `Nghỉ học — ${updated.class.name}`, message: `Buổi ${ymd(updated.sessionDate)!.split('-').reverse().join('/')} ${start} được huỷ.${b.note ? ` ${b.note}` : ''}`, link: '/app/classes', refType: 'SESSION', refId: s.id });
    }
    return toSession(updated);
  })
);

const MARK = z.enum(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']);

/** Điểm danh: attendance { studentId: mark | {mark, note} } → status DONE → tính lại mức rủi ro. */
teacherRouter.put(
  '/sessions/:id/attendance',
  handler(async (req) => {
    const s = await assertSession(req, P(req));
    const b = parse(z.object({ attendance: z.record(uuid, z.union([MARK, z.object({ mark: MARK, note: z.string().max(300).optional() })])), note: z.string().max(5000).nullish(), topic: z.string().max(200).nullish() }), req.body);
    const members = new Set(await activeStudentIds(s.classId));
    const stray = Object.keys(b.attendance).filter((id) => !members.has(id));
    if (stray.length) throw badRequest(`Có ${stray.length} học viên không thuộc lớp`);
    const attendance = Object.fromEntries(Object.entries(b.attendance).map(([k, v]) => [k, typeof v === 'string' ? { mark: v } : v]));
    const updated = await prisma.classSession.update({
      where: { id: s.id },
      data: { attendance: attendance as Prisma.InputJsonObject, status: 'DONE', note: b.note, topic: b.topic },
      include: { class: { select: { name: true } } },
    });
    await recomputeRisk(s.classId);
    return toSession(updated);
  })
);

// =====================================================================
// BẢNG TIN & TÀI LIỆU LỚP
// =====================================================================

function toAnnouncement(a: { id: string; classId: string; title: string; body: string; createdAt: Date; isPinned: boolean; readCount: number }) {
  return { id: a.id, classId: a.classId, title: a.title, body: a.body, createdAt: a.createdAt.toISOString(), pinned: a.isPinned || undefined, readCount: a.readCount };
}

teacherRouter.get(
  '/announcements',
  handler(async (req) => {
    const u = me(req);
    const q = parse(z.object({ classId: uuid.optional() }), req.query);
    const ids = q.classId ? [(await assertClass(u, q.classId)).id] : await myClassIds(u);
    const rows = await prisma.classAnnouncement.findMany({ where: { classId: { in: ids }, deletedAt: null }, orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }] });
    // readCount: số học viên đã đọc thông báo (notifications ref ANNOUNCEMENT có read_at)
    const reads = rows.length
      ? await prisma.notification.groupBy({ by: ['refId'], where: { refType: 'ANNOUNCEMENT', refId: { in: rows.map((r) => r.id) }, readAt: { not: null } }, _count: { _all: true } })
      : [];
    return rows.map((r) => toAnnouncement({ ...r, readCount: reads.find((x) => x.refId === r.id)?._count._all ?? r.readCount }));
  })
);

const annBody = z.object({ classId: uuid, title: z.string().trim().min(2).max(200), body: z.string().trim().min(1).max(10000), pinned: z.boolean().optional() });

teacherRouter.post(
  '/announcements',
  handler(async (req) => {
    const u = me(req);
    const b = parse(annBody, req.body);
    const c = await assertClass(u, b.classId);
    const a = await prisma.classAnnouncement.create({ data: { classId: c.id, authorId: u.id, title: b.title, body: b.body, isPinned: b.pinned ?? false } });
    await notifyUsers(await activeStudentIds(c.id), { type: 'CLASS', title: `${c.name}: ${b.title}`, message: b.body.slice(0, 280), link: '/app/classes', refType: 'ANNOUNCEMENT', refId: a.id });
    return toAnnouncement(a);
  })
);

async function assertAnnouncement(req: Parameters<typeof me>[0], id: string) {
  const a = await prisma.classAnnouncement.findFirst({ where: { id, deletedAt: null } });
  if (!a) throw notFound('Thông báo');
  await assertClass(me(req), a.classId);
  return a;
}

teacherRouter.patch(
  '/announcements/:id',
  handler(async (req) => {
    const a = await assertAnnouncement(req, P(req));
    const b = parse(annBody.omit({ classId: true }).partial(), req.body);
    return toAnnouncement(await prisma.classAnnouncement.update({ where: { id: a.id }, data: { title: b.title, body: b.body, isPinned: b.pinned } }));
  })
);

teacherRouter.delete(
  '/announcements/:id',
  handler(async (req) => {
    const a = await assertAnnouncement(req, P(req));
    await prisma.classAnnouncement.update({ where: { id: a.id }, data: { deletedAt: new Date() } });
    return { ok: true };
  })
);

function toMaterial(m: { id: string; classId: string | null; title: string; description: string | null; type: string; category: string | null; fileUrl: string | null; sizeBytes: bigint | null; pages: number | null; downloadsCount: number; createdAt: Date }) {
  return {
    id: m.id,
    classId: m.classId ?? '',
    title: m.title,
    description: m.description ?? undefined,
    type: m.type as 'VIDEO' | 'PDF' | 'DOC' | 'AUDIO' | 'LINK',
    category: m.category ?? undefined,
    fileUrl: m.fileUrl ?? undefined,
    size: formatSize(m.sizeBytes),
    pages: m.pages ?? undefined,
    uploadedAt: ymd(m.createdAt)!,
    downloads: m.downloadsCount,
  };
}

teacherRouter.get(
  '/materials',
  handler(async (req) => {
    const u = me(req);
    const q = parse(z.object({ classId: uuid.optional() }), req.query);
    const ids = q.classId ? [(await assertClass(u, q.classId)).id] : await myClassIds(u);
    const rows = await prisma.material.findMany({ where: { classId: { in: ids }, deletedAt: null }, orderBy: { createdAt: 'desc' } });
    return rows.map(toMaterial);
  })
);

const matBody = z.object({
  classId: uuid,
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullish(),
  type: z.enum(['VIDEO', 'PDF', 'DOC', 'AUDIO', 'LINK']),
  category: z.string().max(60).nullish(),
  fileUrl: z.string().url(),
  sizeBytes: z.number().int().min(0).nullish(),
  pages: z.number().int().min(0).max(30000).nullish(),
  notify: z.boolean().optional(),
});

teacherRouter.post(
  '/materials',
  handler(async (req) => {
    const u = me(req);
    const b = parse(matBody, req.body);
    const c = await assertClass(u, b.classId);
    const m = await prisma.material.create({
      data: { classId: c.id, uploadedById: u.id, title: b.title, description: b.description, type: b.type, category: b.category, fileUrl: b.fileUrl, sizeBytes: b.sizeBytes === null || b.sizeBytes === undefined ? null : BigInt(b.sizeBytes), pages: b.pages },
    });
    if (b.notify !== false) await notifyUsers(await activeStudentIds(c.id), { type: 'CLASS', title: `Tài liệu mới — ${c.name}`, message: b.title, link: '/app/classes', refType: 'MATERIAL', refId: m.id });
    return toMaterial(m);
  })
);

/** Tải file tài liệu lên (body nhị phân, tối đa 25 MB). Query: classId, title, type?, notify?; tên file gốc qua header X-File-Name (encodeURIComponent). */
teacherRouter.post(
  '/materials/upload',
  express.raw({ type: () => true, limit: '25mb' }),
  handler(async (req) => {
    const u = me(req);
    const q = parse(
      z.object({ classId: uuid, title: z.string().trim().min(1).max(200), type: z.enum(['VIDEO', 'PDF', 'DOC', 'AUDIO', 'LINK']).optional(), notify: z.enum(['true', 'false']).optional() }),
      req.query
    );
    const c = await assertClass(u, q.classId);
    const buf = req.body as Buffer;
    if (!Buffer.isBuffer(buf) || buf.length === 0) throw badRequest('Tệp tải lên trống');
    const mime = String(req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
    let original = '';
    try {
      original = decodeURIComponent(String(req.headers['x-file-name'] ?? ''));
    } catch {
      original = '';
    }
    const ext = MIME_EXT[mime] ?? (/\.([a-z0-9]{2,5})$/i.exec(original)?.[1].toLowerCase() ?? '');
    if (!ext || !Object.values(MIME_EXT).includes(ext)) throw badRequest('Định dạng tệp không được hỗ trợ (PDF, Word, PowerPoint, Excel, TXT, MP3, MP4, ảnh)');
    const type = q.type ?? (ext === 'pdf' ? 'PDF' : ['mp3', 'm4a', 'wav'].includes(ext) ? 'AUDIO' : ['mp4', 'webm'].includes(ext) ? 'VIDEO' : 'DOC');
    const realMime = mime && mime !== 'application/octet-stream' ? mime : (Object.entries(MIME_EXT).find(([, e]) => e === ext)?.[0] ?? 'application/octet-stream');
    fs.mkdirSync(MATERIAL_DIR, { recursive: true });
    const key = `${crypto.randomUUID()}.${ext}`;
    fs.writeFileSync(path.join(MATERIAL_DIR, key), buf);
    const url = `/api/v1/teacher/files/${key}`;
    try {
      const m = await prisma.$transaction(async (tx) => {
        await tx.mediaFile.create({
          data: { ownerId: u.id, storageKey: `materials/${key}`, url, mimeType: realMime, sizeBytes: BigInt(buf.length), checksumSha256: crypto.createHash('sha256').update(buf).digest('hex'), purpose: 'MATERIAL', isPrivate: true },
        });
        return tx.material.create({ data: { classId: c.id, uploadedById: u.id, title: q.title, type, fileUrl: url, sizeBytes: BigInt(buf.length) } });
      });
      if (q.notify !== 'false') await notifyUsers(await activeStudentIds(c.id), { type: 'CLASS', title: `Tài liệu mới — ${c.name}`, message: q.title, link: '/app/classes', refType: 'MATERIAL', refId: m.id });
      return toMaterial(m);
    } catch (e) {
      fs.rmSync(path.join(MATERIAL_DIR, key), { force: true });
      throw e;
    }
  })
);

async function assertMaterial(req: Parameters<typeof me>[0], id: string) {
  const m = await prisma.material.findFirst({ where: { id, deletedAt: null } });
  if (!m || !m.classId) throw notFound('Tài liệu');
  await assertClass(me(req), m.classId);
  return m;
}

teacherRouter.patch(
  '/materials/:id',
  handler(async (req) => {
    const m = await assertMaterial(req, P(req));
    const b = parse(matBody.omit({ classId: true, notify: true }).partial(), req.body);
    return toMaterial(
      await prisma.material.update({
        where: { id: m.id },
        data: { title: b.title, description: b.description, type: b.type, category: b.category, fileUrl: b.fileUrl, pages: b.pages, sizeBytes: b.sizeBytes === undefined ? undefined : b.sizeBytes === null ? null : BigInt(b.sizeBytes) },
      })
    );
  })
);

teacherRouter.delete(
  '/materials/:id',
  handler(async (req) => {
    const m = await assertMaterial(req, P(req));
    await prisma.material.update({ where: { id: m.id }, data: { deletedAt: new Date() } });
    return { ok: true };
  })
);

// =====================================================================
// GIAO BÀI
// =====================================================================

const examSetup = z.object({ mode: z.enum(['FULL', 'PRACTICE']), parts: z.array(z.string()).default([]), minutes: z.number().int().min(1).max(300).nullable() });
const targetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('EXAM'), testId: z.string().min(1), setup: examSetup }),
  z.object({ kind: z.literal('LESSON'), courseId: z.string().min(1), lessonIds: z.array(z.string()).default([]) }),
  z.object({ kind: z.literal('GRAMMAR'), slug: z.string().min(1) }),
  z.object({ kind: z.literal('VOCAB'), topicId: z.string().min(1) }),
  z.object({ kind: z.literal('WRITING'), taskId: z.string().min(1) }),
  z.object({ kind: z.literal('SPEAKING'), partId: z.string().min(1) }),
  z.object({ kind: z.literal('DICTATION'), passageId: z.string().min(1) }),
]);
type Target = z.infer<typeof targetSchema>;
const KIND_OF: Record<string, Target['kind']> = { MOCK_TEST: 'EXAM', PRACTICE: 'EXAM', LESSON: 'LESSON', GRAMMAR: 'GRAMMAR', VOCAB: 'VOCAB', ESSAY: 'WRITING', SPEAKING: 'SPEAKING', DICTATION: 'DICTATION' };

/** Kiểm tra nội dung bài giao có thật trong DB; trả target_id (uuid) và điểm tối đa mặc định. */
async function resolveTarget(type: string, t: Target, examType: 'TOEIC' | 'VSTEP'): Promise<{ targetId: string; maxScore: number; target: Target }> {
  if (KIND_OF[type] !== t.kind) throw badRequest(`Loại bài ${type} không khớp nội dung ${t.kind}`);
  switch (t.kind) {
    case 'EXAM': {
      const test = await prisma.mockTest.findFirst({ where: { ...byIdOrSlug(t.testId), deletedAt: null, status: 'PUBLISHED' } });
      if (!test) throw badRequest('Đề thi không tồn tại hoặc chưa xuất bản');
      if (type === 'MOCK_TEST') {
        const parts = await prisma.mockTestQuestion.findMany({ where: { testId: test.id }, distinct: ['part'], select: { part: true }, orderBy: { part: 'asc' } });
        const feParts = [...new Set(parts.map((p) => feGroupOfPart(p.part)))];
        return { targetId: test.id, maxScore: test.examType === 'TOEIC' ? 990 : 10, target: { ...t, setup: { mode: 'FULL', parts: feParts, minutes: t.setup.minutes ?? test.durationMin } } };
      }
      const parts = toDbParts(t.setup.parts);
      if (!parts.length) throw badRequest('Chọn ít nhất một Part');
      const n = await prisma.mockTestQuestion.count({ where: { testId: test.id, part: { in: parts } } });
      if (!n) throw badRequest('Đề không có câu hỏi ở các Part đã chọn');
      return { targetId: test.id, maxScore: n, target: t };
    }
    case 'LESSON': {
      const course = await prisma.course.findFirst({ where: { ...byIdOrSlug(t.courseId), deletedAt: null, status: 'PUBLISHED' } });
      if (!course) throw badRequest('Khoá học không tồn tại hoặc chưa xuất bản');
      const ids = t.lessonIds.filter(isUuid);
      if (ids.length) {
        const n = await prisma.lesson.count({ where: { id: { in: ids }, deletedAt: null, status: 'PUBLISHED', section: { courseId: course.id } } });
        if (n !== ids.length) throw badRequest('Có bài giảng không thuộc khoá học');
      }
      return { targetId: course.id, maxScore: 10, target: t };
    }
    case 'GRAMMAR': {
      const g = await prisma.grammarTopic.findFirst({ where: { ...byIdOrSlug(t.slug), deletedAt: null, status: 'PUBLISHED' } });
      if (!g) throw badRequest('Chủ điểm ngữ pháp không tồn tại hoặc chưa xuất bản');
      return { targetId: g.id, maxScore: 10, target: { kind: 'GRAMMAR', slug: g.slug } };
    }
    case 'VOCAB': {
      const v = await prisma.vocabTopic.findFirst({ where: { ...byIdOrSlug(t.topicId), deletedAt: null } });
      if (!v) throw badRequest('Bộ từ vựng không tồn tại');
      return { targetId: v.id, maxScore: 10, target: t };
    }
    case 'DICTATION': {
      const p = isUuid(t.passageId) ? await prisma.passage.findFirst({ where: { id: t.passageId, purpose: 'DICTATION', deletedAt: null, status: 'PUBLISHED' } }) : null;
      if (!p) throw badRequest('Bài chép chính tả không tồn tại');
      // Điểm = % chép đúng (0–100), chấm tự động khi học viên nộp ở trang Chép chính tả
      return { targetId: p.id, maxScore: 100, target: t };
    }
    case 'WRITING':
    case 'SPEAKING': {
      const qid = t.kind === 'WRITING' ? t.taskId : t.partId;
      const q = isUuid(qid) ? await prisma.question.findFirst({ where: { id: qid, deletedAt: null, status: 'PUBLISHED', type: t.kind === 'WRITING' ? 'ESSAY' : 'SPEAKING_RESPONSE' } }) : null;
      if (!q) throw badRequest(t.kind === 'WRITING' ? 'Đề Viết không tồn tại' : 'Đề Nói không tồn tại');
      void examType;
      return { targetId: q.id, maxScore: 10, target: t };
    }
  }
}

const assignBody = z.object({
  classId: uuid,
  title: z.string().trim().min(2).max(200),
  type: z.enum(['MOCK_TEST', 'PRACTICE', 'LESSON', 'GRAMMAR', 'VOCAB', 'ESSAY', 'SPEAKING', 'DICTATION']),
  target: targetSchema,
  note: z.string().max(5000).nullish(),
  dueDate: z.string().datetime({ offset: true }).nullish(),
  openAt: z.string().datetime({ offset: true }).nullish(),
  status: z.enum(['DRAFT', 'OPEN']).default('OPEN'),
  maxScore: z.number().positive().max(9999).optional(),
  allowLate: z.boolean().optional(),
});

const assignInclude = { class: { select: { name: true, examType: true } } } as const;

teacherRouter.get(
  '/assignments',
  handler(async (req) => {
    const u = me(req);
    const q = parse(z.object({ classId: uuid.optional(), status: z.enum(['OPEN', 'CLOSED', 'DRAFT']).optional() }), req.query);
    const ids = q.classId ? [(await assertClass(u, q.classId)).id] : await myClassIds(u);
    const rows = await prisma.assignment.findMany({ where: { classId: { in: ids }, deletedAt: null, status: q.status }, include: assignInclude, orderBy: { createdAt: 'desc' } });
    return toAssignments(rows);
  })
);

teacherRouter.get(
  '/assignments/:id',
  handler(async (req) => {
    const a = await assertAssignment(me(req), P(req));
    const full = await prisma.assignment.findUniqueOrThrow({ where: { id: a.id }, include: assignInclude });
    const subs = await prisma.assignmentSubmission.findMany({ where: { assignmentId: a.id }, include: submissionInclude, orderBy: [{ submittedAt: 'desc' }] });
    return {
      ...(await toAssignments([full]))[0],
      submissions: subs.map((s) => ({ ...toSubmission(s), state: s.status })),
    };
  })
);

teacherRouter.post(
  '/assignments',
  handler(async (req) => {
    const u = me(req);
    const b = parse(assignBody, req.body);
    const c = await assertClass(u, b.classId);
    if (b.dueDate && new Date(b.dueDate) < new Date() && b.status === 'OPEN') throw badRequest('Hạn nộp phải ở tương lai');
    const r = await resolveTarget(b.type, b.target, c.examType);
    const students = await activeStudentIds(c.id);
    const a = await prisma.$transaction(async (tx) => {
      const created = await tx.assignment.create({
        data: {
          classId: c.id,
          createdById: u.id,
          title: b.title,
          type: b.type,
          targetId: r.targetId,
          targetConfig: r.target as Prisma.InputJsonObject,
          note: b.note,
          openAt: b.openAt ? new Date(b.openAt) : b.status === 'OPEN' ? new Date() : null,
          dueAt: b.dueDate ? new Date(b.dueDate) : null,
          allowLate: b.allowLate ?? true,
          maxScore: b.maxScore ?? r.maxScore,
          status: b.status,
        },
        include: assignInclude,
      });
      await tx.assignmentSubmission.createMany({ data: students.map((studentId) => ({ assignmentId: created.id, studentId })), skipDuplicates: true });
      return created;
    });
    if (b.status === 'OPEN') await notifyAssigned(a.id, a.title, c.name, a.dueAt, students);
    if (b.status === 'OPEN' && b.type === 'LESSON') await gradeLearnedLessons(a.id, r.targetId, students);
    return (await toAssignments([a]))[0];
  })
);

/** Bài giao "Bài giảng": học viên đã học xong các bài này từ trước → có điểm ngay, không phải học lại */
async function gradeLearnedLessons(assignmentId: string, courseId: string, students: string[]) {
  for (const id of students) await prisma.$transaction((tx) => gradeLessonAssignments(tx, id, courseId, { assignmentId, notify: false }));
}

async function notifyAssigned(id: string, title: string, className: string, dueAt: Date | null, students: string[]) {
  const due = dueAt ? ` · hạn ${new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(dueAt)}` : '';
  await notifyUsers(students, { type: 'ASSIGNMENT', title: `Bài tập mới: ${title}`, message: `Lớp ${className}${due}`, link: '/app/classes', refType: 'ASSIGNMENT', refId: id });
}

teacherRouter.patch(
  '/assignments/:id',
  handler(async (req) => {
    const u = me(req);
    const a = await assertAssignment(u, P(req));
    const b = parse(assignBody.omit({ classId: true, type: true, target: true }).partial().extend({ status: z.enum(['DRAFT', 'OPEN', 'CLOSED']).optional() }), req.body);
    if (a.status !== 'DRAFT' && b.status === 'DRAFT') throw badRequest('Bài đã giao không thể chuyển về nháp');
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.assignment.update({
        where: { id: a.id },
        data: {
          title: b.title,
          note: b.note,
          dueAt: b.dueDate === undefined ? undefined : b.dueDate ? new Date(b.dueDate) : null,
          openAt: b.status === 'OPEN' && a.status === 'DRAFT' ? new Date() : b.openAt === undefined ? undefined : b.openAt ? new Date(b.openAt) : null,
          maxScore: b.maxScore,
          allowLate: b.allowLate,
          status: b.status,
        },
        include: assignInclude,
      });
      // Đóng bài: học viên chưa nộp → MISSED
      if (b.status === 'CLOSED' && a.status !== 'CLOSED') await tx.assignmentSubmission.updateMany({ where: { assignmentId: a.id, status: 'TODO' }, data: { status: 'MISSED' } });
      // Mở lại: MISSED → TODO
      if (b.status === 'OPEN' && a.status === 'CLOSED') await tx.assignmentSubmission.updateMany({ where: { assignmentId: a.id, status: 'MISSED' }, data: { status: 'TODO' } });
      return row;
    });
    if (b.status === 'OPEN' && a.status === 'DRAFT') await notifyAssigned(a.id, updated.title, updated.class.name, updated.dueAt, await activeStudentIds(a.classId));
    if (b.status === 'OPEN' && a.status !== 'OPEN' && a.type === 'LESSON' && a.targetId) await gradeLearnedLessons(a.id, a.targetId, await activeStudentIds(a.classId));
    if (b.status === 'CLOSED') await recomputeRisk(a.classId);
    return (await toAssignments([updated]))[0];
  })
);

teacherRouter.delete(
  '/assignments/:id',
  handler(async (req) => {
    const a = await assertAssignment(me(req), P(req));
    const done = await prisma.assignmentSubmission.count({ where: { assignmentId: a.id, status: { in: [...DONE_STATUSES] } } });
    if (done > 0 && a.status !== 'DRAFT') {
      // Đã có bài nộp: xoá mềm để giữ lịch sử điểm
      await prisma.assignment.update({ where: { id: a.id }, data: { deletedAt: new Date(), status: 'CLOSED' } });
    } else {
      await prisma.assignment.update({ where: { id: a.id }, data: { deletedAt: new Date() } });
    }
    return { ok: true };
  })
);

// =====================================================================
// CHẤM BÀI (luồng #7)
// =====================================================================

/** Bài tự luyện Viết/Nói (không thuộc bài giao) của học viên lớp mình chưa có điểm chính thức. */
async function practiceAnswers(classIds: string[], status: 'pending' | 'graded' | 'all') {
  const students = (await prisma.classMember.findMany({ where: { classId: { in: classIds }, status: 'ACTIVE' }, select: { studentId: true, classId: true } })).reduce(
    (m, r) => m.set(r.studentId, r.classId),
    new Map<string, string>()
  );
  if (!students.size) return [];
  const answers = await prisma.attemptAnswer.findMany({
    where: {
      attempt: { userId: { in: [...students.keys()] }, assignmentId: null, status: { in: ['SUBMITTED', 'GRADING', 'COMPLETED'] } },
      question: { type: { in: ['ESSAY', 'SPEAKING_RESPONSE'] } },
      OR: [{ textAnswer: { not: null } }, { audioUrl: { not: null } }],
      ...(status === 'pending' ? { gradingAnswers: { none: { graderType: 'TEACHER', isFinal: true } } } : status === 'graded' ? { gradingAnswers: { some: { graderType: 'TEACHER', isFinal: true } } } : {}),
    },
    include: {
      attempt: { select: { userId: true, user: { select: { id: true, fullName: true, avatarUrl: true } } } },
      question: { select: { stem: true, type: true } },
      gradingAnswers: { where: { graderType: 'TEACHER' }, orderBy: { gradedAt: 'desc' }, take: 1 },
    },
    orderBy: { answeredAt: 'asc' },
    take: 200,
  });
  return answers.map((a) => {
    const g = a.gradingAnswers[0];
    const name = a.attempt.user.fullName;
    return {
      id: `ans:${a.id}`,
      assignmentId: '',
      assignmentTitle: `Tự luyện · ${a.question.stem.replace(/<[^>]+>/g, '').slice(0, 80)}`,
      classId: students.get(a.attempt.userId)!,
      studentId: a.attempt.user.id,
      studentName: name,
      initials: name.split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase(),
      avatarUrl: a.attempt.user.avatarUrl ?? undefined,
      submittedAt: iso(a.answeredAt ?? a.createdAt)!,
      score: g?.isFinal ? num(g.totalScore) : undefined,
      maxScore: 10,
      status: (g?.isFinal ? 'GRADED' : 'PENDING') as 'GRADED' | 'PENDING',
      type: (a.question.type === 'ESSAY' ? 'ESSAY' : 'SPEAKING') as 'ESSAY' | 'SPEAKING',
      content: a.textAnswer ?? undefined,
      audioUrl: a.audioUrl ?? undefined,
      feedback: g?.feedback ?? undefined,
      criteriaScores: (g?.criteriaScores as Record<string, number> | undefined) ?? undefined,
      draft: g && !g.isFinal ? true : undefined,
    };
  });
}

teacherRouter.get(
  '/grading',
  handler(async (req) => {
    const u = me(req);
    const q = parse(z.object({ status: z.enum(['pending', 'graded', 'all']).default('pending'), classId: uuid.optional(), assignmentId: uuid.optional() }), req.query);
    const ids = q.classId ? [(await assertClass(u, q.classId)).id] : await myClassIds(u);
    const subStatus = q.status === 'pending' ? ['SUBMITTED', 'LATE'] : q.status === 'graded' ? ['GRADED'] : ['SUBMITTED', 'LATE', 'GRADED'];
    const subs = await prisma.assignmentSubmission.findMany({
      where: {
        status: { in: subStatus as ('SUBMITTED' | 'LATE' | 'GRADED')[] },
        assignment: { classId: { in: ids }, deletedAt: null, type: { in: ['ESSAY', 'SPEAKING'] }, ...(q.assignmentId ? { id: q.assignmentId } : {}) },
      },
      include: submissionInclude,
      orderBy: { submittedAt: 'asc' },
    });
    const practice = q.assignmentId ? [] : await practiceAnswers(ids, q.status);
    const items = [...subs.map(toSubmission), ...practice].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
    return enrichGrading(items);
  })
);

type GradingItem = { id: string; assignmentId: string; classId: string; type: string };

/** Thêm đề bài (stem), số từ tối thiểu, tên lớp, tiêu chí chấm cho từng bài trong hàng chấm. */
async function enrichGrading<T extends GradingItem>(items: T[]) {
  if (!items.length) return [];
  const classes = await prisma.class.findMany({ where: { id: { in: [...new Set(items.map((i) => i.classId))] } }, select: { id: true, name: true, examType: true } });
  const asgIds = [...new Set(items.map((i) => i.assignmentId).filter(Boolean))];
  const asgs = asgIds.length ? await prisma.assignment.findMany({ where: { id: { in: asgIds } }, select: { id: true, targetId: true } }) : [];
  const answerIds = items.filter((i) => i.id.startsWith('ans:')).map((i) => i.id.slice(4));
  const answers = answerIds.length ? await prisma.attemptAnswer.findMany({ where: { id: { in: answerIds } }, select: { id: true, questionId: true } }) : [];
  const qIds = [...new Set([...asgs.map((a) => a.targetId), ...answers.map((a) => a.questionId)].filter((x): x is string => !!x))];
  const questions = qIds.length ? await prisma.question.findMany({ where: { id: { in: qIds } }, select: { id: true, stem: true, taskConfig: true, rubricId: true, examType: true, imageUrl: true } }) : [];
  const rubricCache = new Map<string, Awaited<ReturnType<typeof rubricFor>>>();
  const out = [];
  for (const it of items) {
    const cls = classes.find((c) => c.id === it.classId);
    const qid = it.id.startsWith('ans:') ? answers.find((a) => a.id === it.id.slice(4))?.questionId : asgs.find((a) => a.id === it.assignmentId)?.targetId;
    const qn = questions.find((x) => x.id === qid);
    const kind = it.type === 'SPEAKING' ? 'SPEAKING' : 'ESSAY';
    const examType = qn?.examType ?? cls?.examType ?? 'TOEIC';
    const key = `${kind}|${examType}|${qn?.rubricId ?? ''}`;
    if (!rubricCache.has(key)) rubricCache.set(key, await rubricFor(kind, examType, qn?.rubricId));
    const rubric = rubricCache.get(key);
    const cfg = (qn?.taskConfig ?? {}) as { minWords?: number };
    out.push({
      ...it,
      className: cls?.name,
      prompt: qn ? qn.stem.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : undefined,
      promptImageUrl: qn?.imageUrl ?? undefined,
      minWords: cfg.minWords,
      rubric: rubric
        ? { id: rubric.id, name: rubric.name, criteria: ((rubric.criteria as { key: string; label: string; description?: string; desc?: string; weight?: number }[]) ?? []).map((c) => ({ key: c.key, label: c.label, desc: c.description ?? c.desc ?? '', weight: c.weight })) }
        : undefined,
    });
  }
  return out;
}

/** Rubric theo loại bài + kỳ thi của lớp. */
async function rubricFor(kind: 'ESSAY' | 'SPEAKING', examType: 'TOEIC' | 'VSTEP', questionRubricId?: string | null) {
  if (questionRubricId) {
    const r = await prisma.rubric.findUnique({ where: { id: questionRubricId } });
    if (r) return r;
  }
  const skill = kind === 'ESSAY' ? 'WRITING' : 'SPEAKING';
  const codes = examType === 'VSTEP' ? (kind === 'ESSAY' ? ['VSTEP_WRITING_T2', 'VSTEP_WRITING_T1'] : ['VSTEP_SPEAKING_P2', 'VSTEP_SPEAKING_P1', 'VSTEP_SPEAKING_P3']) : [`TOEIC_${skill}`];
  return (
    (await prisma.rubric.findFirst({ where: { code: { in: codes } }, orderBy: { code: 'asc' } })) ??
    (await prisma.rubric.findFirst({ where: { skill, examType } })) ??
    (await prisma.rubric.findFirst({ where: { skill } }))
  );
}

/** Tiêu chí chấm (RubricCriterion[]) cho bàn chấm. */
teacherRouter.get(
  '/rubrics',
  handler(async () => {
    const rows = await prisma.rubric.findMany({ orderBy: { code: 'asc' } });
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      examType: r.examType,
      skill: r.skill,
      scaleMax: num(r.scaleMax),
      criteria: ((r.criteria as { key: string; label: string; description?: string; desc?: string; weight?: number }[]) ?? []).map((c) => ({ key: c.key, label: c.label, desc: c.description ?? c.desc ?? '', weight: c.weight })),
    }));
  })
);

const gradeBody = z.object({
  criteria: z.record(z.string(), z.number().min(0).max(10)),
  feedback: z.string().max(10000).nullish(),
  /** false = lưu nháp, chưa trả điểm cho học viên */
  release: z.boolean().default(true),
});

/** Lấy mẫu kiểm định: cứ 10 bài GV chấm chính thức thì 1 bài vào hàng kiểm định của trưởng bộ môn. */
async function sampleForReview(graderId: string) {
  const n = await prisma.grading.count({ where: { graderId, graderType: 'TEACHER', isFinal: true } });
  return n % 10 === 0 ? ('PENDING' as const) : null;
}

function scoreOf(criteria: Record<string, number>, rubricCriteria: { key: string; weight?: number }[]) {
  const keys: { key: string; weight?: number }[] = rubricCriteria.length ? rubricCriteria : Object.keys(criteria).map((key) => ({ key }));
  const missing = keys.filter((c) => criteria[c.key] === undefined).map((c) => c.key);
  if (missing.length) throw badRequest(`Thiếu điểm tiêu chí: ${missing.join(', ')}`);
  const wsum = keys.reduce((a, c) => a + (c.weight ?? 1), 0);
  const avg = keys.reduce((a, c) => a + criteria[c.key]! * (c.weight ?? 1), 0) / wsum;
  return Math.round(avg * 2) / 2; // làm tròn 0.5 như bàn chấm
}

teacherRouter.post(
  '/grading/:id',
  handler(async (req) => {
    const u = me(req);
    const b = parse(gradeBody, req.body);
    const id = P(req);

    // ---- Bài tự luyện (attempt_answers) ----
    if (id.startsWith('ans:')) {
      const answerId = id.slice(4);
      const ans = await prisma.attemptAnswer.findUnique({ where: { id: answerId }, include: { attempt: true, question: true } });
      if (!ans || !['ESSAY', 'SPEAKING_RESPONSE'].includes(ans.question.type)) throw notFound('Bài làm');
      await assertStudent(u, ans.attempt.userId);
      const examType = ans.question.examType;
      const rubric = await rubricFor(ans.question.type === 'ESSAY' ? 'ESSAY' : 'SPEAKING', examType, ans.question.rubricId);
      if (!rubric) throw badRequest('Chưa cấu hình rubric chấm');
      const total = scoreOf(b.criteria, rubric.criteria as { key: string; weight?: number }[]);
      const review = b.release ? await sampleForReview(u.id) : null;
      await prisma.$transaction(async (tx) => {
        await tx.grading.updateMany({ where: { answerId, graderType: 'TEACHER' }, data: { isFinal: false } });
        await tx.grading.create({ data: { answerId, graderType: 'TEACHER', graderId: u.id, rubricId: rubric.id, criteriaScores: b.criteria, totalScore: total, feedback: b.feedback, isFinal: b.release, reviewStatus: review } });
        if (b.release) await tx.attemptAnswer.update({ where: { id: answerId }, data: { score: total } });
      });
      if (b.release)
        await notifyUsers([ans.attempt.userId], { type: 'ASSIGNMENT', title: 'Bài luyện đã được chấm', message: `Điểm ${total}/10${b.feedback ? ` — ${b.feedback.slice(0, 160)}` : ''}`, link: ans.question.type === 'ESSAY' ? '/app/writing' : '/app/speaking', refType: 'ATTEMPT', refId: ans.attemptId });
      return { id, score: total, released: b.release, reviewSampled: review === 'PENDING' };
    }

    // ---- Bài nộp theo bài giao ----
    const sub = await prisma.assignmentSubmission.findUnique({ where: { id }, include: { assignment: { include: { class: true } } } });
    if (!sub || sub.assignment.deletedAt) throw notFound('Bài nộp');
    if (u.role !== 'ADMIN' && sub.assignment.class.teacherId !== u.id) throw notFound('Bài nộp');
    if (!['ESSAY', 'SPEAKING'].includes(sub.assignment.type)) throw badRequest('Bài trắc nghiệm được chấm tự động');
    if (!['SUBMITTED', 'LATE', 'GRADED'].includes(sub.status)) throw badRequest('Học viên chưa nộp bài');
    const q = sub.assignment.targetId ? await prisma.question.findUnique({ where: { id: sub.assignment.targetId }, select: { rubricId: true } }) : null;
    const rubric = await rubricFor(sub.assignment.type as 'ESSAY' | 'SPEAKING', sub.assignment.class.examType, q?.rubricId);
    if (!rubric) throw badRequest('Chưa cấu hình rubric chấm');
    const avg10 = scoreOf(b.criteria, rubric.criteria as { key: string; weight?: number }[]);
    const max = Number(sub.assignment.maxScore);
    const score = round1((avg10 / 10) * max);
    const review = b.release ? await sampleForReview(u.id) : null;
    await prisma.$transaction(async (tx) => {
      await tx.grading.updateMany({ where: { submissionId: sub.id, graderType: 'TEACHER' }, data: { isFinal: false } });
      await tx.grading.create({ data: { submissionId: sub.id, graderType: 'TEACHER', graderId: u.id, rubricId: rubric.id, criteriaScores: b.criteria, totalScore: avg10, feedback: b.feedback, isFinal: b.release, reviewStatus: review } });
      if (b.release) await tx.assignmentSubmission.update({ where: { id: sub.id }, data: { status: 'GRADED', score, feedback: b.feedback, gradedAt: new Date() } });
    });
    if (b.release) {
      await notifyUsers([sub.studentId], { type: 'ASSIGNMENT', title: `Đã chấm: ${sub.assignment.title}`, message: `Điểm ${score}/${max}${b.feedback ? ` — ${b.feedback.slice(0, 160)}` : ''}`, link: '/app/classes', refType: 'SUBMISSION', refId: sub.id });
      await recomputeRisk(sub.assignment.classId);
    }
    const full = await prisma.assignmentSubmission.findUniqueOrThrow({ where: { id: sub.id }, include: submissionInclude });
    return { ...toSubmission(full), released: b.release, reviewSampled: review === 'PENDING' };
  })
);

// =====================================================================
// BẢNG ĐIỂM, HỌC VIÊN, GHI CHÚ
// =====================================================================

teacherRouter.get(
  '/classes/:id/gradebook',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    const [assignments, students, subs] = await Promise.all([
      prisma.assignment.findMany({ where: { classId: c.id, deletedAt: null, status: { not: 'DRAFT' } }, orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }] }),
      prisma.classMember.findMany({ where: { classId: c.id, status: 'ACTIVE' }, include: { student: { select: { id: true, fullName: true, avatarUrl: true, email: true } } }, orderBy: { joinedAt: 'asc' } }),
      prisma.assignmentSubmission.findMany({ where: { assignment: { classId: c.id, deletedAt: null, status: { not: 'DRAFT' } } }, select: { assignmentId: true, studentId: true, status: true, score: true } }),
    ]);
    const scores: Record<string, Record<string, number | null>> = {};
    const states: Record<string, Record<string, string>> = {};
    for (const m of students) {
      scores[m.studentId] = {};
      states[m.studentId] = {};
    }
    for (const s of subs) {
      if (!scores[s.studentId]) continue;
      scores[s.studentId]![s.assignmentId] = s.status === 'GRADED' && s.score !== null ? Number(s.score) : null;
      states[s.studentId]![s.assignmentId] = s.status;
    }
    return {
      classId: c.id,
      assignments: assignments.map((a) => ({ id: a.id, title: a.title, type: a.type, maxScore: Number(a.maxScore), dueDate: iso(a.dueAt), status: a.status })),
      students: students.map((m) => ({ id: m.student.id, name: m.student.fullName, avatarUrl: m.student.avatarUrl ?? undefined, email: m.student.email, status: m.riskLevel })),
      scores,
      states,
    };
  })
);

/** Học viên của mọi lớp mình dạy (trang Học viên). */
teacherRouter.get(
  '/students',
  handler(async (req) => {
    const u = me(req);
    const q = parse(z.object({ classId: uuid.optional(), status: z.enum(['GOOD', 'WARNING', 'RISK']).optional(), q: z.string().trim().optional() }), req.query);
    const ids = q.classId ? [(await assertClass(u, q.classId)).id] : await myClassIds(u, false);
    let rows = await toClassStudents(ids);
    if (q.status) rows = rows.filter((r) => r.status === q.status);
    if (q.q) {
      const s = q.q.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s));
    }
    return rows;
  })
);

teacherRouter.get(
  '/students/:id',
  handler(async (req) => {
    const u = me(req);
    const user = await assertStudent(u, P(req));
    const classIds = await myClassIds(u);
    const [card] = (await toClassStudents(classIds)).filter((s) => s.id === user.id);
    const self = await selfStudyOf(user);
    const [attempts, mistakes, subs, notes, sessions] = await Promise.all([
      prisma.examAttempt.findMany({
        where: { userId: user.id, status: { in: ['COMPLETED', 'SUBMITTED', 'GRADING'] } },
        include: { test: { select: { title: true, examType: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 15,
      }),
      mistakeSummaryOf(user.id),
      prisma.assignmentSubmission.findMany({ where: { studentId: user.id, assignment: { classId: { in: classIds }, deletedAt: null, status: { not: 'DRAFT' } } }, include: submissionInclude, orderBy: { updatedAt: 'desc' }, take: 30 }),
      prisma.studentNote.findMany({ where: { studentId: user.id, deletedAt: null, ...(u.role === 'ADMIN' ? {} : { teacherId: u.id }) }, orderBy: [{ noteDate: 'desc' }, { createdAt: 'desc' }] }),
      prisma.classSession.findMany({ where: { classId: { in: classIds }, status: 'DONE' }, select: { id: true, classId: true, sessionDate: true, attendance: true }, orderBy: { sessionDate: 'desc' } }),
    ]);
    const attendanceLog = sessions
      .map((s) => ({ sessionId: s.id, classId: s.classId, date: ymd(s.sessionDate)!, mark: (s.attendance as Record<string, { mark: string } | string> | null)?.[user.id] }))
      .filter((r) => r.mark)
      .map((r) => ({ ...r, mark: typeof r.mark === 'string' ? r.mark : (r.mark as { mark: string }).mark }));
    return {
      student: card ?? null,
      attempts: attempts.map((a) => ({
        id: a.id,
        testTitle: a.test?.title ?? MODE_LABEL[a.mode] ?? a.mode,
        examType: a.test?.examType,
        mode: a.mode,
        score: num(a.scoreTotal),
        correct: a.correctCount ?? undefined,
        total: a.totalCount,
        listening: num(a.scoreListening),
        reading: num(a.scoreReading),
        durationSec: a.timeSpentSec,
        submittedAt: iso(a.submittedAt),
      })),
      ...mistakes,
      submissions: subs.map((s) => ({ ...toSubmission(s), state: s.status })),
      attendance: attendanceLog,
      notes: notes.map(toNote),
      self,
    };
  })
);

function toNote(n: { id: string; studentId: string; classId: string | null; noteDate: Date; kind: string; content: string }) {
  return { id: n.id, studentId: n.studentId, classId: n.classId ?? undefined, date: ymd(n.noteDate)!, kind: n.kind as 'NOTE' | 'REMINDER' | 'CONTACT', text: n.content };
}

const noteBody = z.object({ kind: z.enum(['NOTE', 'REMINDER', 'CONTACT']).default('NOTE'), text: z.string().trim().min(1).max(5000), date: ymdStr.optional(), classId: uuid.nullish() });

teacherRouter.get(
  '/students/:id/notes',
  handler(async (req) => {
    const u = me(req);
    await assertStudent(u, P(req));
    const rows = await prisma.studentNote.findMany({ where: { studentId: P(req), deletedAt: null, ...(u.role === 'ADMIN' ? {} : { teacherId: u.id }) }, orderBy: [{ noteDate: 'desc' }, { createdAt: 'desc' }] });
    return rows.map(toNote);
  })
);

teacherRouter.post(
  '/students/:id/notes',
  handler(async (req) => {
    const u = me(req);
    await assertStudent(u, P(req));
    const b = parse(noteBody, req.body);
    if (b.classId) await assertClass(u, b.classId);
    const n = await prisma.studentNote.create({ data: { teacherId: u.id, studentId: P(req), classId: b.classId ?? null, kind: b.kind, content: b.text, noteDate: b.date ? dateOf(b.date) : new Date() } });
    return toNote(n);
  })
);

async function assertNote(req: Parameters<typeof me>[0], id: string) {
  const u = me(req);
  const n = await prisma.studentNote.findFirst({ where: { id, deletedAt: null } });
  if (!n || (u.role !== 'ADMIN' && n.teacherId !== u.id)) throw notFound('Ghi chú');
  return n;
}

teacherRouter.patch(
  '/notes/:id',
  handler(async (req) => {
    const n = await assertNote(req, P(req));
    const b = parse(noteBody.partial(), req.body);
    return toNote(await prisma.studentNote.update({ where: { id: n.id }, data: { kind: b.kind, content: b.text, noteDate: b.date ? dateOf(b.date) : undefined } }));
  })
);

teacherRouter.delete(
  '/notes/:id',
  handler(async (req) => {
    const n = await assertNote(req, P(req));
    await prisma.studentNote.update({ where: { id: n.id }, data: { deletedAt: new Date() } });
    return { ok: true };
  })
);

// =====================================================================
// THỐNG KÊ LỚP (chỉ từ dữ liệu thật)
// =====================================================================

const TOEIC_BINS: [string, number, number][] = [
  ['Dưới 450', 0, 450],
  ['450–549', 450, 550],
  ['550–649', 550, 650],
  ['650–749', 650, 750],
  ['750–849', 750, 850],
  ['850+', 850, 10000],
];
const VSTEP_BINS: [string, number, number][] = [
  ['Dưới 4.0', 0, 4],
  ['4.0–5.5 (B1)', 4, 6],
  ['6.0–8.0 (B2)', 6, 8.5],
  ['8.5+ (C1)', 8.5, 100],
];

async function classAnalytics(classIds: string[], examType: 'TOEIC' | 'VSTEP') {
  const studentIds = [...new Set((await prisma.classMember.findMany({ where: { classId: { in: classIds }, status: 'ACTIVE' }, select: { studentId: true } })).map((m) => m.studentId))];
  const empty = { students: studentIds.length, weeklyProgress: [], partAccuracy: [], scoreDist: [], mistakeCauses: [], scoreTrend: { labels: [], values: [], min: 0 }, completionByAssignment: [] };
  if (!studentIds.length) return empty;

  const since6w = new Date(Date.now() - 6 * 7 * 86400_000);
  const since6m = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);

  const [weekly, parts, attempts, causes, monthly, asg] = await Promise.all([
    // Độ chính xác TB theo tuần (6 tuần gần nhất)
    prisma.$queryRaw<{ wk: Date; correct: bigint; total: bigint }[]>`
      SELECT date_trunc('week', a.submitted_at) AS wk, sum(coalesce(a.correct_count,0))::bigint AS correct, sum(a.total_count)::bigint AS total
      FROM exam_attempts a
      WHERE a.user_id = ANY(${studentIds}::uuid[]) AND a.status = 'COMPLETED' AND a.submitted_at >= ${since6w} AND a.total_count > 0
      GROUP BY 1 ORDER BY 1`,
    // Độ chính xác theo Part
    prisma.$queryRaw<{ part: string; correct: bigint; total: bigint }[]>`
      SELECT q.part::text AS part, count(*) FILTER (WHERE aa.is_correct)::bigint AS correct, count(*)::bigint AS total
      FROM attempt_answers aa JOIN exam_attempts a ON a.id = aa.attempt_id JOIN questions q ON q.id = aa.question_id
      WHERE a.user_id = ANY(${studentIds}::uuid[]) AND aa.is_correct IS NOT NULL AND q.exam_type = ${examType}::exam_type
      GROUP BY 1`,
    // Điểm thi thử gần nhất của từng học viên (phân bố)
    prisma.$queryRaw<{ user_id: string; score: Prisma.Decimal }[]>`
      SELECT DISTINCT ON (a.user_id) a.user_id, a.score_total AS score
      FROM exam_attempts a JOIN mock_tests t ON t.id = a.test_id
      WHERE a.user_id = ANY(${studentIds}::uuid[]) AND a.status = 'COMPLETED' AND a.mode = 'FULL' AND a.score_total IS NOT NULL AND t.exam_type = ${examType}::exam_type
      ORDER BY a.user_id, a.submitted_at DESC`,
    prisma.mistakeEntry.groupBy({ by: ['cause'], where: { userId: { in: studentIds } }, _count: { _all: true } }),
    // Điểm TB theo tháng (6 tháng)
    prisma.$queryRaw<{ m: Date; avg: Prisma.Decimal }[]>`
      SELECT date_trunc('month', a.submitted_at) AS m, avg(a.score_total) AS avg
      FROM exam_attempts a JOIN mock_tests t ON t.id = a.test_id
      WHERE a.user_id = ANY(${studentIds}::uuid[]) AND a.status = 'COMPLETED' AND a.mode = 'FULL' AND a.score_total IS NOT NULL AND t.exam_type = ${examType}::exam_type AND a.submitted_at >= ${since6m}
      GROUP BY 1 ORDER BY 1`,
    prisma.assignment.findMany({ where: { classId: { in: classIds }, deletedAt: null, status: { not: 'DRAFT' } }, select: { id: true, title: true, dueAt: true }, orderBy: { dueAt: 'asc' } }),
  ]);

  // 6 tuần liên tiếp, tuần không có dữ liệu = null
  const weekStart = (d: Date) => {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
    return x.toISOString().slice(0, 10);
  };
  const weeks = Array.from({ length: 6 }, (_, i) => weekStart(new Date(Date.now() - (5 - i) * 7 * 86400_000)));
  const weeklyMap = new Map(weekly.map((w) => [weekStart(w.wk), w]));

  const groupAcc = new Map<string, { c: number; t: number }>();
  for (const p of parts) {
    const k = feGroupOfPart(p.part);
    const cur = groupAcc.get(k) ?? { c: 0, t: 0 };
    cur.c += Number(p.correct);
    cur.t += Number(p.total);
    groupAcc.set(k, cur);
  }
  const partOrder = examType === 'TOEIC' ? ['PART_1', 'PART_2', 'PART_3', 'PART_4', 'PART_5', 'PART_6', 'PART_7'] : ['VSTEP_LISTENING', 'VSTEP_READING', 'VSTEP_WRITING', 'VSTEP_SPEAKING'];

  const bins = examType === 'TOEIC' ? TOEIC_BINS : VSTEP_BINS;
  const scores = attempts.map((a) => Number(a.score));

  const months = Array.from({ length: 6 }, (_, i) => new Date(since6m.getFullYear(), since6m.getMonth() + i, 1));
  const monthMap = new Map(monthly.map((m) => [`${m.m.getUTCFullYear()}-${m.m.getUTCMonth()}`, Number(m.avg)]));
  const trendValues = months.map((m) => {
    const v = monthMap.get(`${m.getFullYear()}-${m.getMonth()}`);
    return v === undefined ? null : round1(v);
  });
  const nonNull = trendValues.filter((v): v is number => v !== null);

  const asgStats = asg.length
    ? await prisma.assignmentSubmission.groupBy({ by: ['assignmentId', 'status'], where: { assignmentId: { in: asg.map((a) => a.id) } }, _count: { _all: true } })
    : [];

  return {
    students: studentIds.length,
    weeklyProgress: weeks.map((w, i) => {
      const r = weeklyMap.get(w);
      return { label: `T${i + 1}`, weekStart: w, value: r && Number(r.total) > 0 ? pct(Number(r.correct), Number(r.total)) : null, answered: r ? Number(r.total) : 0 };
    }),
    partAccuracy: partOrder.filter((p) => groupAcc.has(p)).map((p) => ({ partId: p, value: pct(groupAcc.get(p)!.c, groupAcc.get(p)!.t), answered: groupAcc.get(p)!.t })),
    scoreDist: scores.length ? bins.map(([label, lo, hi]) => ({ label, value: scores.filter((s) => s >= lo && s < hi).length })) : [],
    mistakeCauses: causes.map((c) => ({ cause: c.cause, count: c._count._all })).sort((a, b) => b.count - a.count),
    scoreTrend: { labels: months.map((m) => `Th${m.getMonth() + 1}`), values: trendValues, min: nonNull.length ? Math.floor(Math.min(...nonNull) * 0.9) : 0 },
    completionByAssignment: asg.map((a) => {
      const st = asgStats.filter((s) => s.assignmentId === a.id);
      const total = st.reduce((x, s) => x + s._count._all, 0);
      const done = st.filter((s) => (DONE_STATUSES as readonly string[]).includes(s.status)).reduce((x, s) => x + s._count._all, 0);
      return { assignmentId: a.id, title: a.title, dueDate: iso(a.dueAt), done, total, rate: pct(done, total) };
    }),
  };
}

teacherRouter.get(
  '/classes/:id/analytics',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    return { classId: c.id, examType: c.examType, ...(await classAnalytics([c.id], c.examType)) };
  })
);

/** Thống kê gộp mọi lớp đang dạy theo kỳ thi (trang Thống kê tổng). */
teacherRouter.get(
  '/analytics',
  handler(async (req) => {
    const u = me(req);
    const { examType } = parse(z.object({ examType: z.enum(['TOEIC', 'VSTEP']).default('TOEIC') }), req.query);
    const ids = (await prisma.class.findMany({ where: { ...ownClassWhere(u), isArchived: false, examType }, select: { id: true } })).map((c) => c.id);
    return { examType, classIds: ids, ...(await classAnalytics(ids, examType)) };
  })
);

// =====================================================================
// THƯ VIỆN (nội dung đã xuất bản để giao bài)
// =====================================================================

/** Số lần mỗi nội dung đã được giao (mọi lớp), theo target_id. */
async function usedCounts() {
  const rows = await prisma.assignment.groupBy({ by: ['targetId'], where: { deletedAt: null, targetId: { not: null } }, _count: { _all: true } });
  return new Map(rows.map((r) => [r.targetId!, r._count._all]));
}

const VSTEP_GROUP_TITLE: Record<string, string> = { VSTEP_LISTENING: 'Listening · Nghe', VSTEP_READING: 'Reading · Đọc', VSTEP_WRITING: 'Writing · Viết', VSTEP_SPEAKING: 'Speaking · Nói' };

const PART_TITLE: Record<string, string> = {
  TOEIC_P1: 'Part 1 · Mô tả tranh',
  TOEIC_P2: 'Part 2 · Hỏi – đáp',
  TOEIC_P3: 'Part 3 · Hội thoại',
  TOEIC_P4: 'Part 4 · Bài nói',
  TOEIC_P5: 'Part 5 · Hoàn thành câu',
  TOEIC_P6: 'Part 6 · Hoàn thành đoạn văn',
  TOEIC_P7: 'Part 7 · Đọc hiểu',
};

teacherRouter.get(
  '/library/tests',
  handler(async (req) => {
    const q = parse(z.object({ examType: z.enum(['TOEIC', 'VSTEP']).optional(), q: z.string().trim().optional() }), req.query);
    const tests = await prisma.mockTest.findMany({
      where: { deletedAt: null, status: 'PUBLISHED', examType: q.examType, kind: { in: ['FULL', 'MINI', 'QUIZ'] }, ...(q.q ? { title: { contains: q.q, mode: 'insensitive' } } : {}) },
      orderBy: [{ examType: 'asc' }, { year: 'desc' }, { title: 'asc' }],
    });
    // Test 2 trước Test 10
    tests.sort((a, b) => a.examType.localeCompare(b.examType) || (b.year ?? 0) - (a.year ?? 0) || byTitleNatural(a, b));
    const counts = tests.length ? await prisma.mockTestQuestion.groupBy({ by: ['testId', 'part'], where: { testId: { in: tests.map((t) => t.id) } }, _count: { _all: true } }) : [];
    const [used, attempts] = await Promise.all([usedCounts(), completedAttempts(tests.map((t) => t.id))]);
    /** Gộp Part theo nhóm frontend (TOEIC: PART_n; VSTEP: theo kỹ năng) */
    const partsOf = (testId: string) => {
      const acc = new Map<string, number>();
      for (const c of counts.filter((x) => x.testId === testId).sort((a, b) => a.part.localeCompare(b.part))) acc.set(feGroupOfPart(c.part), (acc.get(feGroupOfPart(c.part)) ?? 0) + c._count._all);
      return [...acc].map(([id, questions]) => ({ id, title: PART_TITLE[Object.keys(FE_PART).find((k) => FE_PART[k] === id) ?? ''] ?? VSTEP_GROUP_TITLE[id] ?? id, questions }));
    };
    return tests.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      examType: t.examType,
      kind: t.kind,
      year: t.year ?? undefined,
      durationMin: t.durationMin,
      totalQuestions: t.totalQuestions,
      isFree: t.isFree,
      coverUrl: t.coverUrl ?? undefined,
      tags: t.tags,
      level: levelLabel(t.level) || undefined,
      attemptsCount: attempts.get(t.id) ?? 0,
      usedCount: used.get(t.id) ?? 0,
      parts: partsOf(t.id),
    }));
  })
);

teacherRouter.get(
  '/library/courses',
  handler(async () => {
    const courses = await prisma.course.findMany({
      where: { deletedAt: null, status: 'PUBLISHED' },
      include: {
        author: { select: { fullName: true } },
        courseSectionCourses: { orderBy: { orderIndex: 'asc' }, include: { lessonSections: { where: { deletedAt: null, status: 'PUBLISHED' }, orderBy: { orderIndex: 'asc' }, select: { id: true, title: true, type: true, durationMin: true, orderIndex: true, exercises: true, passScorePct: true } } } },
      },
      orderBy: [{ track: 'asc' }, { trackOrder: 'asc' }, { title: 'asc' }],
    });
    const used = await usedCounts();
    const enrolled = courses.length ? await prisma.courseEnrollment.groupBy({ by: ['courseId'], where: { courseId: { in: courses.map((c) => c.id) } }, _count: { _all: true } }) : [];
    return courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      category: c.category,
      examType: c.examType ?? undefined,
      track: c.track ?? undefined,
      trackGroup: c.trackGroup ?? undefined,
      level: c.level ?? undefined,
      coverUrl: c.coverUrl ?? undefined,
      // đếm thật từ các bài chưa xoá trong khoá
      lessonsCount: c.courseSectionCourses.reduce((a, s) => a + s.lessonSections.length, 0),
      durationMin: c.courseSectionCourses.reduce((a, s) => a + s.lessonSections.reduce((b, l) => b + l.durationMin, 0), 0),
      teacherName: c.author?.fullName,
      studentsCount: enrolled.find((e) => e.courseId === c.id)?._count._all ?? 0,
      usedCount: used.get(c.id) ?? 0,
      sections: c.courseSectionCourses.map((s) => ({
        id: s.id,
        title: s.title,
        partNo: s.partNo,
        partTitle: s.partTitle ?? undefined,
        // số câu bài tập sau bài + điểm cần đạt — giống học viên thấy
        lessons: s.lessonSections.map(({ exercises, passScorePct, ...l }) => {
          const n = toExercises(exercises).length;
          return { ...l, exercisesCount: n, passScorePct: n ? (passScorePct ?? 70) : undefined };
        }),
      })),
    }));
  })
);

teacherRouter.get(
  '/library/grammar',
  handler(async () => {
    const rows = await prisma.grammarTopic.findMany({ where: { deletedAt: null, status: 'PUBLISHED' }, orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }], select: { id: true, slug: true, title: true, category: true, level: true, summary: true, tagId: true } });
    const used = await usedCounts();
    const tagIds = rows.map((r) => r.tagId).filter((x): x is string => !!x);
    const qCounts = tagIds.length
      ? await prisma.$queryRaw<{ tag: string; n: bigint }[]>`SELECT t AS tag, count(*)::bigint AS n FROM questions q, unnest(q.tag_ids) t WHERE q.deleted_at IS NULL AND q.status = 'PUBLISHED' AND t = ANY(${tagIds}::uuid[]) GROUP BY t`
      : [];
    return rows.map(({ tagId, ...r }) => ({ ...r, level: r.level ?? undefined, questionsCount: Number(qCounts.find((x) => x.tag === tagId)?.n ?? 0), usedCount: used.get(r.id) ?? 0 }));
  })
);

teacherRouter.get(
  '/library/vocab',
  handler(async () => {
    const rows = await prisma.vocabTopic.findMany({ where: { deletedAt: null }, orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }] });
    const used = await usedCounts();
    return rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, icon: r.icon ?? undefined, examType: r.examType ?? undefined, level: r.level ?? undefined, wordsCount: r.wordsCount, isFree: r.isFree, usedCount: used.get(r.id) ?? 0 }));
  })
);

async function promptList(type: 'ESSAY' | 'SPEAKING_RESPONSE', examType?: 'TOEIC' | 'VSTEP') {
  const rows = await prisma.question.findMany({
    where: { deletedAt: null, status: 'PUBLISHED', type, examType },
    orderBy: [{ examType: 'asc' }, { part: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, examType: true, part: true, stem: true, imageUrl: true, audioUrl: true, taskConfig: true, level: true },
    take: 500,
  });
  const used = await usedCounts();
  return rows.map((r) => {
    const text = r.stem.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return { id: r.id, examType: r.examType, part: r.part, title: text.slice(0, 120), prompt: text, imageUrl: r.imageUrl ?? undefined, audioUrl: r.audioUrl ?? undefined, level: r.level ?? undefined, taskConfig: r.taskConfig ?? undefined, usedCount: used.get(r.id) ?? 0 };
  });
}

teacherRouter.get(
  '/library/writing',
  handler(async (req) => promptList('ESSAY', parse(z.object({ examType: z.enum(['TOEIC', 'VSTEP']).optional() }), req.query).examType))
);
teacherRouter.get(
  '/library/speaking',
  handler(async (req) => promptList('SPEAKING_RESPONSE', parse(z.object({ examType: z.enum(['TOEIC', 'VSTEP']).optional() }), req.query).examType))
);

/** Ngân hàng câu hỏi trắc nghiệm đã xuất bản (xem trước khi giao luyện Part). */
teacherRouter.get(
  '/library/questions',
  handler(async (req) => {
    const q = parse(z.object({ examType: z.enum(['TOEIC', 'VSTEP']).optional(), part: z.string().optional(), q: z.string().trim().optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) }), req.query);
    const parts = q.part ? toDbParts([q.part]) : undefined;
    const where: Prisma.QuestionWhereInput = {
      deletedAt: null,
      status: 'PUBLISHED',
      type: { notIn: ['ESSAY', 'SPEAKING_RESPONSE'] },
      examType: q.examType,
      ...(parts?.length ? { part: { in: parts } } : {}),
      ...(q.q ? { stem: { contains: q.q, mode: 'insensitive' } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.question.findMany({ where, orderBy: [{ part: 'asc' }, { createdAt: 'asc' }], skip: (q.page - 1) * q.pageSize, take: q.pageSize, select: { id: true, examType: true, part: true, skill: true, stem: true, options: true, correctAnswer: true, explanationMd: true, level: true, audioUrl: true, imageUrl: true } }),
      prisma.question.count({ where }),
    ]);
    return { items: items.map((i) => ({ ...i, partId: FE_PART[i.part] ?? feGroupOfPart(i.part) })), total, page: q.page, pageSize: q.pageSize };
  })
);
