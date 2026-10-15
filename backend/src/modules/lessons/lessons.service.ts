import { prisma } from '../../lib/prisma';

export class LessonsService {
  async getLessonById(lessonId: string, userId?: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) throw new Error('LESSON_NOT_FOUND');

    let progress = null;
    if (userId) {
      progress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: { userId, lessonId },
        },
      });
    }

    return { lesson, progress };
  }

  async updateProgress(userId: string, lessonId: string, input: { isCompleted: boolean; timeSpentSec: number }) {
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        isCompleted: input.isCompleted,
        timeSpentSec: { increment: input.timeSpentSec || 0 },
        completedAt: input.isCompleted ? new Date() : undefined,
      },
      create: {
        userId,
        lessonId,
        isCompleted: input.isCompleted,
        timeSpentSec: input.timeSpentSec || 0,
        completedAt: input.isCompleted ? new Date() : undefined,
      },
    });

    // Cập nhật streak nếu hoàn thành bài học
    if (input.isCompleted) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastStudyAt: new Date(),
          streakCount: { increment: 1 },
        },
      });
    }

    return progress;
  }
}
