import { prisma } from '../../lib/prisma';
import { calculateNextSrsReview } from '@toeic-vstep/shared';

export class ReviewService {
  async getDueReviews(userId: string) {
    const now = new Date();

    // 1. Các lỗi sai đến hạn ôn tập
    const dueMistakes = await prisma.reviewSchedule.findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
      include: {
        mistake: {
          include: {
            question: {
              include: { passage: true },
            },
          },
        },
      },
      orderBy: { nextReviewAt: 'asc' },
    });

    // 2. Từ vựng đến hạn ôn tập
    const dueVocabs = await prisma.userVocabulary.findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
      include: {
        vocab: true,
      },
      orderBy: { nextReviewAt: 'asc' },
    });

    return {
      dueMistakesCount: dueMistakes.length,
      dueVocabsCount: dueVocabs.length,
      dueMistakes,
      dueVocabs,
    };
  }

  async submitMistakeReview(userId: string, scheduleId: string, quality: number) {
    const schedule = await prisma.reviewSchedule.findUnique({
      where: { id: scheduleId },
      include: { mistake: true },
    });

    if (!schedule || schedule.userId !== userId) {
      throw new Error('SCHEDULE_NOT_FOUND');
    }

    const nextSrs = calculateNextSrsReview({
      currentInterval: schedule.intervalDays,
      repetitions: schedule.repetitions,
      easeFactor: schedule.easeFactor,
      quality,
    });

    const updated = await prisma.reviewSchedule.update({
      where: { id: scheduleId },
      data: {
        intervalDays: nextSrs.intervalDays,
        repetitions: nextSrs.repetitions,
        easeFactor: nextSrs.easeFactor,
        nextReviewAt: nextSrs.nextReviewAt,
        lastReviewedAt: new Date(),
      },
    });

    // Nếu người học đã làm đúng liên tiếp nhiều lần với điểm cao (quality >= 4 và repetitions >= 3)
    if (nextSrs.repetitions >= 3 && quality >= 4) {
      await prisma.mistakeNotebook.update({
        where: { id: schedule.mistakeId },
        data: { isResolved: true },
      });
    }

    return updated;
  }

  async submitVocabReview(userId: string, userVocabId: string, quality: number) {
    const userVocab = await prisma.userVocabulary.findUnique({
      where: { id: userVocabId },
    });

    if (!userVocab || userVocab.userId !== userId) {
      throw new Error('VOCAB_NOT_FOUND');
    }

    const nextSrs = calculateNextSrsReview({
      currentInterval: userVocab.intervalDays,
      repetitions: userVocab.repetitions,
      easeFactor: userVocab.easeFactor,
      quality,
    });

    const status = nextSrs.repetitions >= 4 ? 'MASTERED' : 'REVIEWING';

    const updated = await prisma.userVocabulary.update({
      where: { id: userVocabId },
      data: {
        intervalDays: nextSrs.intervalDays,
        repetitions: nextSrs.repetitions,
        easeFactor: nextSrs.easeFactor,
        nextReviewAt: nextSrs.nextReviewAt,
        lastReviewAt: new Date(),
        status,
      },
    });

    // Lưu log ôn tập
    await prisma.vocabularyReviewLog.create({
      data: {
        userId,
        vocabId: userVocab.vocabId,
        quality,
      },
    });

    return updated;
  }
}
