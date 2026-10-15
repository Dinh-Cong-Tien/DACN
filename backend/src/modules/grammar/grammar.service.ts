import { prisma } from '../../lib/prisma';

export class GrammarService {
  async getTopics(level?: string) {
    const where = level ? { level } : {};
    return prisma.grammarTopic.findMany({
      where,
      include: {
        lessons: {
          select: { id: true, title: true, orderIndex: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  async getLessonById(lessonId: string) {
    const lesson = await prisma.grammarLesson.findUnique({
      where: { id: lessonId },
      include: { topic: true },
    });

    if (!lesson) throw new Error('GRAMMAR_LESSON_NOT_FOUND');
    return lesson;
  }
}
