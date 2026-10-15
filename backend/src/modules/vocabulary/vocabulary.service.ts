import { prisma } from '../../lib/prisma';

export class VocabularyService {
  async getTopics(examType?: any) {
    const where = examType ? { examType } : {};
    return prisma.vocabularyTopic.findMany({
      where,
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  async getEntriesByTopic(topicId: string, userId?: string) {
    const entries = await prisma.vocabularyEntry.findMany({
      where: { topicId },
      orderBy: { word: 'asc' },
    });

    let userVocabMap = new Map<string, any>();
    if (userId) {
      const userVocabs = await prisma.userVocabulary.findMany({
        where: { userId },
      });
      userVocabs.forEach((uv) => userVocabMap.set(uv.vocabId, uv));
    }

    return entries.map((entry) => ({
      ...entry,
      userState: userVocabMap.get(entry.id) || null,
    }));
  }

  async addToMyVocabulary(userId: string, vocabId: string) {
    return prisma.userVocabulary.upsert({
      where: {
        userId_vocabId: { userId, vocabId },
      },
      update: {},
      create: {
        userId,
        vocabId,
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0,
        nextReviewAt: new Date(),
        status: 'LEARNING',
      },
    });
  }

  async getMyVocabulary(userId: string, status?: any) {
    const where: any = { userId };
    if (status) where.status = status;

    return prisma.userVocabulary.findMany({
      where,
      include: { vocab: true },
      orderBy: { nextReviewAt: 'asc' },
    });
  }
}
