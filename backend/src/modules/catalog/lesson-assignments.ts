import type { Prisma } from '@prisma/client';

/**
 * Bài giao loại "Bài giảng" (giáo viên chọn bài trong khoá) chấm tự động theo tiến độ học thật:
 * học viên hoàn thành đủ các bài được giao — mỗi bài phải đạt điểm bài tập tối thiểu mới tính hoàn thành —
 * thì bài giao chuyển "Đã chấm". Điểm = trung bình % bài tập cao nhất của các bài × thang điểm bài giao
 * (bài không có bài tập tính 100%). Làm lại đạt cao hơn thì nâng điểm.
 *  - lessonId: chỉ xét bài giao có chứa bài vừa học xong
 *  - assignmentId: chỉ xét một bài giao (vd vừa giao xong, học viên đã học các bài này từ trước)
 */
export async function gradeLessonAssignments(tx: Prisma.TransactionClient, userId: string, courseId: string, opts: { lessonId?: string; assignmentId?: string; notify: boolean }) {
  const subs = await tx.assignmentSubmission.findMany({
    where: { studentId: userId, status: { in: ['TODO', 'GRADED'] }, assignment: { ...(opts.assignmentId ? { id: opts.assignmentId } : {}), type: 'LESSON', targetId: courseId, deletedAt: null, status: 'OPEN' } },
    include: { assignment: { include: { class: { select: { teacherId: true } } } } },
  });
  if (!subs.length) return;
  const courseLessonIds = (await tx.lesson.findMany({ where: { deletedAt: null, status: 'PUBLISHED', section: { courseId } }, select: { id: true } })).map((l) => l.id);
  const now = new Date();
  for (const s of subs) {
    const a = s.assignment;
    const picked = ((a.targetConfig ?? {}) as { lessonIds?: string[] }).lessonIds ?? [];
    const ids = picked.length ? picked.filter((id) => courseLessonIds.includes(id)) : courseLessonIds;
    if (!ids.length || (opts.lessonId && !ids.includes(opts.lessonId))) continue;
    if (s.status === 'TODO' && a.dueAt && a.dueAt < now && !a.allowLate) continue;
    const rows = await tx.lessonProgress.findMany({ where: { userId, lessonId: { in: ids }, status: 'COMPLETED' }, select: { bestScorePct: true } });
    if (rows.length < ids.length) continue;
    const avgPct = rows.reduce((t, r) => t + (r.bestScorePct ?? 100), 0) / rows.length;
    const max = Number(a.maxScore ?? 10);
    const score = Math.round((avgPct / 100) * max * 10) / 10;
    if (s.status === 'GRADED' && Number(s.score ?? 0) >= score) continue;
    await tx.assignmentSubmission.update({ where: { id: s.id }, data: { status: 'GRADED', score, submittedAt: s.submittedAt ?? now, gradedAt: now } });
    if (opts.notify && s.status === 'TODO') {
      const name = (await tx.user.findUnique({ where: { id: userId }, select: { fullName: true } }))?.fullName ?? 'Học viên';
      await tx.notification.create({
        data: { userId: a.class.teacherId, type: 'ASSIGNMENT', title: `Hoàn thành: ${a.title}`, message: `${name} đã học xong ${ids.length} bài được giao · điểm bài tập ${score}/${max}`, link: '/teacher/assignments', refType: 'ASSIGNMENT', refId: a.id },
      });
    }
  }
}
