/**
 * Chỉ số học tập dùng chung cho MỌI vai trò (giáo viên, trưởng bộ môn, admin, học viên, trang công khai).
 * Một chỉ số chỉ có MỘT định nghĩa — module nào cần số liệu lớp/học viên đều gọi qua đây.
 *
 * Định nghĩa:
 * - Sĩ số: thành viên lớp đang ACTIVE.
 * - Số bài giao: bài chưa xoá, không ở trạng thái nháp (học viên nhìn thấy được).
 * - Điểm TB: chỉ lượt thi ĐỀ FULL đã chấm (mode FULL, COMPLETED) cùng kỳ thi với lớp — TOEIC thang 990, VSTEP thang 10.
 *   Điểm TB học viên = trung bình các lượt của học viên; điểm TB lớp = trung bình điểm TB của các học viên có điểm.
 * - Hoàn thành: bài đã nộp (SUBMITTED/LATE/GRADED) / bài đã đến hạn hoặc đã nộp (không tính bài chưa tới hạn chưa nộp).
 * - Chuyên cần: (Có mặt + Đi muộn) / số lượt đã điểm danh ở các buổi DONE (chỉ tính học viên đang trong lớp).
 * - Mức nguy cơ: chuyên cần < 60% (≥ 3 buổi) hoặc hoàn thành < 50% (≥ 2 bài) → RISK; chuyên cần < 80% hoặc hoàn thành < 70% → WARNING.
 */
import { Prisma, type ExamType } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const DONE_STATUSES = new Set(['SUBMITTED', 'LATE', 'GRADED']);
export const round1 = (n: number) => Math.round(n * 10) / 10;
export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export type RiskLevel = 'GOOD' | 'WARNING' | 'RISK';
export interface Ratio {
  ok: number;
  total: number;
}
/** % hoặc null khi chưa có dữ liệu */
export const rateOf = (r?: Ratio | null) => (r && r.total > 0 ? pct(r.ok, r.total) : null);

type AttendanceJson = Record<string, { mark?: string; note?: string } | string>;
/** attendance JSONB → { studentId: mark } (chấp nhận cả dạng cũ là chuỗi) */
export function marksOf(att: Prisma.JsonValue | null): Record<string, string> {
  if (!att || typeof att !== 'object' || Array.isArray(att)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(att as AttendanceJson)) {
    const m = typeof v === 'string' ? v : v?.mark;
    if (m) out[k] = m;
  }
  return out;
}
export const isPresent = (mark: string) => mark === 'PRESENT' || mark === 'LATE';

/** Mức nguy cơ — định nghĩa duy nhất */
export function riskLevel(attendance?: Ratio | null, completion?: Ratio | null): RiskLevel {
  const a = attendance && attendance.total > 0 ? attendance.ok / attendance.total : 1;
  const c = completion && completion.total > 0 ? completion.ok / completion.total : 1;
  const enoughA = (attendance?.total ?? 0) >= 3;
  const enoughC = (completion?.total ?? 0) >= 2;
  if ((enoughA && a < 0.6) || (enoughC && c < 0.5)) return 'RISK';
  if (a < 0.8 || c < 0.7) return 'WARNING';
  return 'GOOD';
}
const RISK_RANK: Record<RiskLevel, number> = { GOOD: 0, WARNING: 1, RISK: 2 };
export const worstRisk = (xs: RiskLevel[]): RiskLevel => xs.reduce<RiskLevel>((w, r) => (RISK_RANK[r] > RISK_RANK[w] ? r : w), 'GOOD');

export interface StudentInClass {
  attendance: Ratio;
  completion: Ratio;
  /** Điểm các lượt đề full cùng kỳ thi với lớp */
  scores: number[];
  avgScore: number | null;
  risk: RiskLevel;
}
export interface ClassMetrics {
  examType: ExamType;
  studentIds: string[];
  studentsCount: number;
  assignmentsCount: number;
  /** 0 khi chưa có điểm (giữ kiểu number cho DTO cũ); dùng hasScore để phân biệt */
  avgScore: number;
  hasScore: boolean;
  completionRate: number;
  attendanceRate: number;
  /** Số lượt điểm danh đã ghi (0 = chưa điểm danh) */
  attendanceMarks: number;
  perStudent: Map<string, StudentInClass>;
}

/** Bài được tính vào mẫu số "hoàn thành": đã nộp, bị đánh dấu MISSED, hoặc đã quá hạn */
const countsForCompletion = (status: string, dueAt: Date | null, now: Date) => DONE_STATUSES.has(status) || status === 'MISSED' || (!!dueAt && dueAt < now);

/** Số liệu đầy đủ cho nhiều lớp (1 lượt truy vấn cho mỗi bảng) */
export async function classMetrics(classes: { id: string; examType: ExamType }[]): Promise<Map<string, ClassMetrics>> {
  const out = new Map<string, ClassMetrics>();
  const ids = classes.map((c) => c.id);
  if (!ids.length) return out;
  const now = new Date();
  const [members, assignments, sessions] = await Promise.all([
    prisma.classMember.findMany({ where: { classId: { in: ids }, status: 'ACTIVE' }, select: { classId: true, studentId: true } }),
    prisma.assignment.findMany({
      where: { classId: { in: ids }, deletedAt: null, status: { not: 'DRAFT' } },
      select: { classId: true, dueAt: true, assignmentSubmissionAssignments: { select: { studentId: true, status: true } } },
    }),
    prisma.classSession.findMany({ where: { classId: { in: ids }, status: 'DONE', NOT: { attendance: { equals: Prisma.DbNull } } }, select: { classId: true, attendance: true } }),
  ]);
  const studentIds = [...new Set(members.map((m) => m.studentId))];
  const attempts = studentIds.length
    ? await prisma.examAttempt.findMany({
        where: { userId: { in: studentIds }, status: 'COMPLETED', mode: 'FULL', scoreTotal: { not: null }, test: { isNot: null } },
        select: { userId: true, scoreTotal: true, test: { select: { examType: true } } },
      })
    : [];

  for (const c of classes) {
    const sids = members.filter((m) => m.classId === c.id).map((m) => m.studentId);
    const per = new Map<string, StudentInClass>(sids.map((s) => [s, { attendance: { ok: 0, total: 0 }, completion: { ok: 0, total: 0 }, scores: [], avgScore: null, risk: 'GOOD' }]));
    const asg = assignments.filter((a) => a.classId === c.id);
    for (const a of asg)
      for (const s of a.assignmentSubmissionAssignments) {
        const p = per.get(s.studentId);
        if (!p || !countsForCompletion(s.status, a.dueAt, now)) continue;
        p.completion.total++;
        if (DONE_STATUSES.has(s.status)) p.completion.ok++;
      }
    for (const s of sessions)
      if (s.classId === c.id)
        for (const [sid, mark] of Object.entries(marksOf(s.attendance))) {
          const p = per.get(sid);
          if (!p) continue;
          p.attendance.total++;
          if (isPresent(mark)) p.attendance.ok++;
        }
    for (const a of attempts) if (a.test?.examType === c.examType) per.get(a.userId)?.scores.push(Number(a.scoreTotal));

    let attOk = 0, attTotal = 0, compOk = 0, compTotal = 0;
    const studentAvgs: number[] = [];
    for (const p of per.values()) {
      p.avgScore = p.scores.length ? round1(mean(p.scores)) : null;
      if (p.avgScore !== null) studentAvgs.push(p.avgScore);
      p.risk = riskLevel(p.attendance, p.completion);
      attOk += p.attendance.ok;
      attTotal += p.attendance.total;
      compOk += p.completion.ok;
      compTotal += p.completion.total;
    }
    out.set(c.id, {
      examType: c.examType,
      studentIds: sids,
      studentsCount: sids.length,
      assignmentsCount: asg.length,
      avgScore: studentAvgs.length ? round1(mean(studentAvgs)) : 0,
      hasScore: studentAvgs.length > 0,
      completionRate: pct(compOk, compTotal),
      attendanceRate: pct(attOk, attTotal),
      attendanceMarks: attTotal,
      perStudent: per,
    });
  }
  return out;
}

export interface StudentAggregate {
  attendance: Ratio;
  completion: Ratio;
  avgScore: number | null;
  /** Kỳ thi dùng để tính điểm TB (kỳ thi của đa số lớp học viên đang học) */
  examType: ExamType | null;
  risk: RiskLevel;
  classIds: string[];
}

/** Gộp số liệu một học viên qua nhiều lớp (vd. danh sách học viên của giáo viên dạy 2 lớp cùng học viên). */
export function aggregateStudents(metrics: Map<string, ClassMetrics>): Map<string, StudentAggregate> {
  type Acc = StudentAggregate & { _scores: Map<ExamType, number[]>; _risks: RiskLevel[]; _exam: Map<ExamType, number> };
  const out = new Map<string, Acc>();
  for (const [classId, m] of metrics)
    for (const [sid, p] of m.perStudent) {
      const cur: Acc = out.get(sid) ?? { attendance: { ok: 0, total: 0 }, completion: { ok: 0, total: 0 }, avgScore: null, examType: null, risk: 'GOOD', classIds: [], _scores: new Map(), _risks: [], _exam: new Map() };
      cur.classIds.push(classId);
      cur.attendance.ok += p.attendance.ok;
      cur.attendance.total += p.attendance.total;
      cur.completion.ok += p.completion.ok;
      cur.completion.total += p.completion.total;
      // điểm đề full không phụ thuộc lớp → lấy một lần theo kỳ thi
      cur._scores.set(m.examType, p.scores);
      cur._exam.set(m.examType, (cur._exam.get(m.examType) ?? 0) + 1);
      cur._risks.push(p.risk);
      out.set(sid, cur);
    }
  const res = new Map<string, StudentAggregate>();
  for (const [sid, v] of out) {
    const exam = [...v._exam.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const scores = exam ? v._scores.get(exam) ?? [] : [];
    res.set(sid, {
      attendance: v.attendance,
      completion: v.completion,
      avgScore: scores.length ? round1(mean(scores)) : null,
      examType: exam,
      // Nguy cơ tổng = mức xấu nhất ở các lớp (một lớp đang nguy cơ là học viên cần theo dõi)
      risk: worstRisk(v._risks),
      classIds: v.classIds,
    });
  }
  return res;
}

/** Ghi lại cache class_members.risk_level cho các lớp (sau điểm danh / nộp / chấm / đóng bài) */
export async function syncRiskCache(classIds: string[]) {
  if (!classIds.length) return;
  const classes = await prisma.class.findMany({ where: { id: { in: classIds } }, select: { id: true, examType: true } });
  const metrics = await classMetrics(classes);
  const members = await prisma.classMember.findMany({ where: { classId: { in: classIds }, status: 'ACTIVE' }, select: { id: true, classId: true, studentId: true, riskLevel: true } });
  const updates = members
    .map((m) => ({ m, level: metrics.get(m.classId)?.perStudent.get(m.studentId)?.risk ?? 'GOOD' }))
    .filter(({ m, level }) => m.riskLevel !== level)
    .map(({ m, level }) => prisma.classMember.update({ where: { id: m.id }, data: { riskLevel: level } }));
  if (updates.length) await prisma.$transaction(updates);
}

const GRADIENTS = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500', 'from-amber-400 to-orange-500', 'from-rose-500 to-pink-500', 'from-sky-500 to-cyan-500', 'from-fuchsia-500 to-purple-500'];
/** Màu thẻ lớp — cùng một lớp có cùng màu ở mọi vai trò */
export const classGradient = (classId: string) => GRADIENTS[[...classId].reduce((a, ch) => a + ch.charCodeAt(0), 0) % GRADIENTS.length]!;
