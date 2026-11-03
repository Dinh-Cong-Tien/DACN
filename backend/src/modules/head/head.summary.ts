/**
 * GET /api/v1/head/reports/summary — Thống kê tổng kết bộ môn (phạm vi bộ môn; admin = toàn hệ thống).
 * Gom 6 mảng: học viên · giảng dạy (buổi học, chuyên cần) · bài tập · kết quả thi · học liệu · chất lượng (kiểm định, khiếu nại).
 * Mọi số đếm lấy trực tiếp từ CSDL, chuỗi theo tháng dùng cùng mốc lastMonths().
 */
import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { handler, me, parse } from '../../core/http';
import { marksOf } from '../../core/metrics';
import { classWhere, deptScope, deptStudents, lastMonths } from './shared';

export const summaryRouter = Router();

const TOEIC_BANDS = [
  { label: '10–295', min: 0, max: 299 },
  { label: '300–495', min: 300, max: 499 },
  { label: '500–695', min: 500, max: 699 },
  { label: '700–845', min: 700, max: 849 },
  { label: '850–990', min: 850, max: 990 },
];
const RISK_ORDER = { GOOD: 0, WARNING: 1, RISK: 2 } as const;

summaryRouter.get(
  '/reports/summary',
  handler(async (req) => {
    const q = parse(z.object({ months: z.coerce.number().int().min(3).max(12).default(6), departmentId: z.string().uuid().optional() }), req.query);
    const scope = await deptScope(me(req));
    const deptIds = q.departmentId ? (scope && !scope.includes(q.departmentId) ? [] : [q.departmentId]) : scope;
    const months = lastMonths(q.months);
    const from = months[0].start;
    const bucket = <T>(rows: T[], dateOf: (r: T) => Date | null | undefined) =>
      months.map((m) => rows.filter((r) => { const d = dateOf(r); return !!d && d >= m.start && d < m.end; }).length);

    const classes = await prisma.class.findMany({
      where: { ...classWhere(deptIds), isArchived: false },
      select: { id: true, name: true, examType: true, teacherId: true, teacher: { select: { fullName: true } } },
    });
    const classIds = classes.map((c) => c.id);
    const departments = await prisma.department.findMany({ where: { deletedAt: null, ...(deptIds ? { id: { in: deptIds } } : {}) }, select: { examType: true } });
    const examTypes = [...new Set(departments.map((d) => d.examType))];

    const [members, sessions, assignments, subs] = await Promise.all([
      prisma.classMember.findMany({ where: { classId: { in: classIds } }, select: { classId: true, studentId: true, status: true, riskLevel: true, joinedAt: true } }),
      prisma.classSession.findMany({ where: { classId: { in: classIds }, sessionDate: { gte: from } }, select: { sessionDate: true, status: true, attendance: true, observation: true } }),
      prisma.assignment.findMany({ where: { classId: { in: classIds }, deletedAt: null, status: { not: 'DRAFT' }, createdAt: { gte: from } }, select: { id: true, type: true, createdAt: true, dueAt: true } }),
      prisma.assignmentSubmission.findMany({ where: { assignment: { classId: { in: classIds }, deletedAt: null, status: { not: 'DRAFT' } } }, select: { status: true, assignment: { select: { dueAt: true } } } }),
    ]);
    const active = members.filter((m) => m.status === 'ACTIVE');
    const studentIds = [...new Set(active.map((m) => m.studentId))];

    // ---------- Học viên ----------
    // mức rủi ro tính từ dữ liệu thật (cùng cách tính với trang Học viên), không dùng cột risk_level lưu sẵn
    const computed = await deptStudents(classes);
    const worst = new Map<string, keyof typeof RISK_ORDER>();
    for (const m of computed.map((s) => ({ studentId: s.id, riskLevel: s.status as string }))) {
      const r = (m.riskLevel in RISK_ORDER ? m.riskLevel : 'GOOD') as keyof typeof RISK_ORDER;
      if (!worst.has(m.studentId) || RISK_ORDER[r] > RISK_ORDER[worst.get(m.studentId)!]) worst.set(m.studentId, r);
    }
    const byExam = (['TOEIC', 'VSTEP'] as const).map((e) => ({
      key: e,
      value: new Set(active.filter((m) => classes.find((c) => c.id === m.classId)?.examType === e).map((m) => m.studentId)).size,
    }));

    // ---------- Giáo viên: lớp + học viên phụ trách ----------
    const teacherMap = new Map<string, { name: string; classes: number; students: Set<string> }>();
    for (const c of classes) {
      const t = teacherMap.get(c.teacherId) ?? { name: c.teacher.fullName, classes: 0, students: new Set<string>() };
      t.classes++;
      active.filter((m) => m.classId === c.id).forEach((m) => t.students.add(m.studentId));
      teacherMap.set(c.teacherId, t);
    }

    // ---------- Giảng dạy: buổi học + lượt điểm danh ----------
    const today = new Date();
    const marks = { PRESENT: 0, LATE: 0, ABSENT: 0, EXCUSED: 0 } as Record<string, number>;
    for (const s of sessions) for (const v of Object.values(marksOf(s.attendance))) marks[v] = (marks[v] ?? 0) + 1;
    const past = sessions.filter((s) => s.sessionDate < today);

    // ---------- Bài tập ----------
    const now = new Date();
    const subState = { GRADED: 0, SUBMITTED: 0, LATE: 0, MISSING: 0, TODO: 0 } as Record<string, number>;
    for (const s of subs) {
      const k = s.status === 'TODO' && s.assignment.dueAt && s.assignment.dueAt < now ? 'MISSING' : s.status;
      subState[k] = (subState[k] ?? 0) + 1;
    }
    const byType = new Map<string, number>();
    for (const a of assignments) byType.set(a.type, (byType.get(a.type) ?? 0) + 1);

    // ---------- Kết quả thi ----------
    const attempts = studentIds.length
      ? await prisma.examAttempt.findMany({
          where: { userId: { in: studentIds }, status: { in: ['SUBMITTED', 'GRADING', 'COMPLETED'] }, submittedAt: { gte: from } },
          select: { mode: true, submittedAt: true, scoreTotal: true, test: { select: { examType: true } } },
        })
      : [];
    const toeicFull = attempts.filter((a) => a.mode === 'FULL' && a.test?.examType === 'TOEIC' && a.scoreTotal !== null).map((a) => Number(a.scoreTotal));
    const avgToeicByMonth = months.map((m) => {
      const xs = attempts.filter((a) => a.mode === 'FULL' && a.test?.examType === 'TOEIC' && a.scoreTotal !== null && a.submittedAt! >= m.start && a.submittedAt! < m.end).map((a) => Number(a.scoreTotal));
      return xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : null;
    });

    // ---------- Học liệu (ngân hàng câu hỏi theo kỳ thi của bộ môn) ----------
    const qWhere: Prisma.QuestionWhereInput = { deletedAt: null, ...(deptIds ? { examType: { in: examTypes.length ? examTypes : ['TOEIC'] } } : {}) };
    const [qByPart, qByStatus, testsByStatus] = await Promise.all([
      prisma.question.groupBy({ by: ['part'], where: { ...qWhere, status: 'PUBLISHED' }, _count: { _all: true } }),
      prisma.question.groupBy({ by: ['status'], where: qWhere, _count: { _all: true } }),
      prisma.mockTest.groupBy({ by: ['status'], where: { deletedAt: null, ...(deptIds ? { examType: { in: examTypes.length ? examTypes : ['TOEIC'] } } : {}) }, _count: { _all: true } }),
    ]);

    // ---------- Chất lượng ----------
    const gScope: Prisma.GradingWhereInput = deptIds ? { OR: [{ submission: { assignment: { class: { departmentId: { in: deptIds } } } } }, { grader: { departmentId: { in: deptIds } } }] } : {};
    const [reviews, tickets] = await Promise.all([
      prisma.grading.groupBy({ by: ['reviewStatus'], where: { reviewStatus: { not: null }, ...gScope }, _count: { _all: true } }),
      prisma.ticket.groupBy({ by: ['status'], where: { category: 'ACADEMIC' }, _count: { _all: true } }),
    ]);
    const observed = sessions.filter((s) => s.observation && typeof s.observation === 'object' && (s.observation as { rating?: number }).rating).length;

    return {
      months: months.map((m) => m.label),
      students: {
        total: studentIds.length,
        byExam,
        byRisk: (['GOOD', 'WARNING', 'RISK'] as const).map((k) => ({ key: k, value: [...worst.values()].filter((v) => v === k).length })),
        joined: bucket(members, (m) => m.joinedAt),
        left: members.filter((m) => m.status !== 'ACTIVE').length,
      },
      teachers: [...teacherMap.values()].map((t) => ({ name: t.name, classes: t.classes, students: t.students.size })).sort((a, b) => b.students - a.students),
      teaching: {
        classes: classes.length,
        // chỉ buổi giáo viên đã đánh dấu đã dạy; buổi đã qua nhưng chưa cập nhật tính riêng
        sessionsDone: bucket(past.filter((s) => s.status === 'DONE'), (s) => s.sessionDate),
        sessionsUnreported: past.filter((s) => s.status === 'SCHEDULED').length,
        sessionsCancelled: past.filter((s) => s.status === 'CANCELLED').length,
        sessionsUpcoming: sessions.filter((s) => s.sessionDate >= today && s.status !== 'CANCELLED').length,
        marks: (['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'] as const).map((k) => ({ key: k, value: marks[k] ?? 0 })),
        observed,
      },
      assignments: {
        created: bucket(assignments, (a) => a.createdAt),
        byType: [...byType.entries()].map(([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value),
        submissions: (['GRADED', 'SUBMITTED', 'LATE', 'MISSING', 'TODO'] as const).map((k) => ({ key: k, value: subState[k] ?? 0 })),
      },
      results: {
        attempts: bucket(attempts, (a) => a.submittedAt),
        fullTests: attempts.filter((a) => a.mode === 'FULL').length,
        toeicBands: TOEIC_BANDS.map((b) => ({ key: b.label, value: toeicFull.filter((x) => x >= b.min && x <= b.max).length })),
        avgToeicByMonth,
      },
      content: {
        byPart: qByPart.map((p) => ({ key: p.part, value: p._count._all })).sort((a, b) => a.key.localeCompare(b.key)),
        questionsByStatus: qByStatus.map((s) => ({ key: s.status, value: s._count._all })),
        testsByStatus: testsByStatus.map((s) => ({ key: s.status, value: s._count._all })),
      },
      quality: {
        reviews: (['AGREED', 'ADJUSTED', 'PENDING'] as const).map((k) => ({ key: k, value: reviews.find((r) => r.reviewStatus === k)?._count._all ?? 0 })),
        complaints: (['OPEN', 'IN_REVIEW', 'PENDING', 'RESOLVED', 'REJECTED'] as const).map((k) => ({ key: k, value: tickets.find((t) => t.status === k)?._count._all ?? 0 })),
      },
    };
  })
);
