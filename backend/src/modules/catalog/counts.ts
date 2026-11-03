import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

/**
 * Số liệu đếm thật từ CSDL thay cho cột đếm lưu sẵn (lessons_count, students_count, attempts_count)
 * — các cột này chỉ được cập nhật ở vài luồng nên dễ lệch.
 */

/** Lượt làm đã nộp (COMPLETED) theo đề */
export async function completedAttempts(testIds: string[]): Promise<Map<string, number>> {
  if (!testIds.length) return new Map();
  const rows = await prisma.examAttempt.groupBy({ by: ['testId'], where: { testId: { in: testIds }, status: 'COMPLETED' }, _count: { _all: true } });
  return new Map(rows.map((r) => [r.testId as string, r._count._all]));
}

/** Số bài (chưa xoá), tổng phút và số học viên ghi danh theo khoá */
export async function courseStats(courseIds: string[], publishedOnly = false): Promise<Map<string, { lessons: number; minutes: number; students: number }>> {
  const out = new Map(courseIds.map((id) => [id, { lessons: 0, minutes: 0, students: 0 }]));
  if (!courseIds.length) return out;
  const [lessonRows, enrollRows] = await Promise.all([
    prisma.$queryRaw<{ course_id: string; n: bigint; m: bigint | null }[]>`
      SELECT s.course_id, COUNT(*) AS n, SUM(l.duration_min) AS m
      FROM lessons l JOIN course_sections s ON s.id = l.section_id
      WHERE l.deleted_at IS NULL AND s.course_id IN (${Prisma.join(courseIds.map((id) => Prisma.sql`${id}::uuid`))})
      ${publishedOnly ? Prisma.sql`AND l.status = 'PUBLISHED'` : Prisma.empty}
      GROUP BY s.course_id`,
    prisma.courseEnrollment.groupBy({ by: ['courseId'], where: { courseId: { in: courseIds } }, _count: { _all: true } }),
  ]);
  lessonRows.forEach((r) => Object.assign(out.get(r.course_id)!, { lessons: Number(r.n), minutes: Number(r.m ?? 0) }));
  enrollRows.forEach((r) => (out.get(r.courseId)!.students = r._count._all));
  return out;
}

/** Điểm đánh giá trung bình — chỉ khi có lượt đánh giá thật (không có thì undefined, không hiện 0 sao) */
export const ratingOf = (avg: Prisma.Decimal | number | null | undefined) => {
  const v = avg === null || avg === undefined ? 0 : Number(avg);
  return v > 0 ? v : undefined;
};
