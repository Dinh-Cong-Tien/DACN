import { z } from 'zod';
import type { Class, Course, CourseTrack, ExamType, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { badRequest } from '../../core/http';

/** Mục của lớp — trùng 3 mục khoá học của học viên: TOEIC / VSTEP / Tiếng Anh THPT */
export const CLASS_TRACK = z.enum(['TOEIC', 'VSTEP', 'THPT']);

/**
 * Body tạo / sửa lớp gửi `track` hoặc `examType` (lớp chưa gắn khoá) → ghi cả hai cột.
 * exam_type dùng để quy đổi điểm, thống kê theo Part: lớp THPT chấm thang 10 như VSTEP.
 */
export function classTrackData(b: { track?: CourseTrack | null; examType?: ExamType | null }): { track?: CourseTrack; examType?: ExamType } {
  const track = b.track ?? b.examType ?? undefined;
  if (!track) return {};
  return { track, examType: b.examType ?? (track === 'THPT' ? 'VSTEP' : track) };
}

/** Mục hiển thị của lớp: theo khoá học của lớp, lớp cũ chưa gắn khoá → cột track / kỳ thi */
export const trackOfClass = (c: Pick<Class, 'examType'> & { track?: CourseTrack | null; course?: Pick<Course, 'track'> | null }): CourseTrack => c.course?.track ?? c.track ?? c.examType;

/** include lớp dùng chung: giáo viên phụ trách + khoá học của lớp */
export const classCourseSelect = { select: { id: true, slug: true, title: true, track: true, trackGroup: true, coverUrl: true } } as const;

/** Khoá học của lớp trả về cho giao diện */
export const courseOfClass = (c: { course?: { id: string; slug: string; title: string; track: CourseTrack | null; trackGroup?: string | null } | null }) =>
  c.course ? { id: c.course.id, slug: c.course.slug, title: c.course.title, track: c.course.track ?? undefined, trackGroup: c.course.trackGroup ?? undefined } : undefined;

/**
 * Lớp gắn khoá học (id hoặc slug, khoá đã xuất bản) → courseId + mục + kỳ thi quy đổi điểm của lớp.
 * Khoá THPT chấm thang 10 như VSTEP; khoá chưa xếp mục → theo kỳ thi của khoá.
 */
export async function classCourseData(idOrSlug: string) {
  const isId = /^[0-9a-f-]{36}$/i.test(idOrSlug);
  const c = await prisma.course.findFirst({ where: { ...(isId ? { id: idOrSlug } : { slug: idOrSlug }), deletedAt: null }, select: { id: true, track: true, examType: true, status: true } });
  if (!c || c.status !== 'PUBLISHED') throw badRequest('Khoá học không tồn tại hoặc chưa xuất bản', 'COURSE_NOT_FOUND');
  const track: CourseTrack = c.track ?? c.examType ?? 'TOEIC';
  return { courseId: c.id, track, examType: (c.examType ?? (track === 'THPT' ? 'VSTEP' : track)) as ExamType };
}

/** Tên ngắn của khoá dùng đặt tên lớp: "TOEIC", "VSTEP", "Tiếng Anh 10", "Ôn thi tốt nghiệp" */
export const courseShortName = (c: { title: string; track?: CourseTrack | null }) =>
  c.track === 'TOEIC' || c.track === 'VSTEP'
    ? c.track
    : c.title
        .replace(/\s*\(Global Success\)\s*/i, '')
        .replace(/^Ôn thi tốt nghiệp THPT.*$/i, 'Ôn thi tốt nghiệp')
        .trim();

/** Chữ đầu mã lớp theo khoá: TOEIC T, VSTEP V, Tiếng Anh 10 / 11 / 12 A / B / C, Ôn thi tốt nghiệp G */
const CLASS_PREFIX: Record<string, string> = { 'luyen-thi-toeic': 'T', 'luyen-thi-vstep': 'V', 'tieng-anh-lop-10': 'A', 'tieng-anh-lop-11': 'B', 'tieng-anh-lop-12': 'C', 'on-thi-tot-nghiep-thpt': 'G' };
export const classPrefix = (c: { slug: string; track?: CourseTrack | null }) => CLASS_PREFIX[c.slug] ?? (c.track === 'VSTEP' ? 'V' : c.track === 'THPT' ? 'H' : 'T');

/**
 * Lớp của một khoá (cùng nội dung, khác lịch học) đặt mã theo thứ tự: T201, T202… — mã lớp đồng thời là tên lớp
 * và mã mời học viên nhập để vào lớp. Đánh số chung mọi lớp có cùng chữ đầu nên không trùng.
 */
export async function nextClassCode(tx: Prisma.TransactionClient | typeof prisma, courseId: string) {
  const c = await tx.course.findUniqueOrThrow({ where: { id: courseId }, select: { slug: true, track: true } });
  const prefix = classPrefix(c);
  const codes = (await tx.class.findMany({ where: { code: { startsWith: prefix } }, select: { code: true } })).map((x) => x.code);
  const used = codes.map((x) => (x.startsWith(prefix) && /^\d{3}$/.test(x.slice(prefix.length)) ? Number(x.slice(prefix.length)) : 0));
  return `${prefix}${Math.max(200, ...used) + 1}`;
}

/** Học viên vào lớp (mã mời / giáo viên thêm) → ghi danh khoá học của lớp; đã ghi danh thì giữ nguyên tiến độ */
export async function enrollClassCourse(tx: Prisma.TransactionClient, courseId: string | null | undefined, studentIds: string[]) {
  if (!courseId || !studentIds.length) return;
  const had = new Set((await tx.courseEnrollment.findMany({ where: { courseId, userId: { in: studentIds } }, select: { userId: true } })).map((e) => e.userId));
  const fresh = studentIds.filter((id) => !had.has(id));
  if (!fresh.length) return;
  await tx.courseEnrollment.createMany({ data: fresh.map((userId) => ({ userId, courseId, source: 'CLASS' })), skipDuplicates: true });
  await tx.course.update({ where: { id: courseId }, data: { studentsCount: { increment: fresh.length } } });
}

/**
 * Tiến độ khoá học của từng học viên trong lớp: % hoàn thành, số bài xong / tổng, bài đang học,
 * điểm bài tập trung bình (các bài đã xong có bài tập), lần học gần nhất.
 */
export async function classCourseProgress(courseId: string, studentIds: string[]) {
  const lessons = await prisma.lesson.findMany({
    where: { deletedAt: null, status: 'PUBLISHED', section: { courseId } },
    select: { id: true, title: true },
    orderBy: [{ section: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
  });
  const ids = lessons.map((l) => l.id);
  const [enrolls, progress] = await Promise.all([
    prisma.courseEnrollment.findMany({ where: { courseId, userId: { in: studentIds } } }),
    prisma.lessonProgress.findMany({ where: { userId: { in: studentIds }, lessonId: { in: ids } }, select: { userId: true, lessonId: true, status: true, bestScorePct: true, updatedAt: true } }),
  ]);
  const title = new Map(lessons.map((l) => [l.id, l.title]));
  return {
    lessonsTotal: ids.length,
    /** từng bài: số học viên trong lớp đã học xong, điểm bài tập trung bình */
    lessons: ids.map((lessonId) => {
      const done = progress.filter((p) => p.lessonId === lessonId && p.status === 'COMPLETED');
      const scored = done.filter((p) => p.bestScorePct !== null);
      return { lessonId, done: done.length, avgPct: scored.length ? Math.round(scored.reduce((t, p) => t + (p.bestScorePct ?? 0), 0) / scored.length) : null };
    }),
    students: studentIds.map((sid) => {
      const mine = progress.filter((p) => p.userId === sid);
      const done = mine.filter((p) => p.status === 'COMPLETED');
      const scored = done.filter((p) => p.bestScorePct !== null);
      const e = enrolls.find((x) => x.userId === sid);
      const last = mine.reduce<Date | null>((a, p) => (!a || p.updatedAt > a ? p.updatedAt : a), null);
      const next = ids.find((id) => !done.some((d) => d.lessonId === id));
      return {
        studentId: sid,
        enrolled: !!e,
        lessonsDone: done.length,
        progressPct: ids.length ? Math.round((done.length / ids.length) * 100) : 0,
        avgExercisePct: scored.length ? Math.round(scored.reduce((t, p) => t + (p.bestScorePct ?? 0), 0) / scored.length) : null,
        /** bài tiếp theo cần học (null = đã học hết khoá) */
        currentLesson: next ? (title.get(next) ?? null) : null,
        lastStudyAt: last?.toISOString() ?? null,
      };
    }),
  };
}
