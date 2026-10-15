import { prisma } from '../../lib/prisma';

export class AnalyticsService {
  async getStudentSummary(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        learningGoal: true,
        learningPath: true,
      },
    });

    if (!user) throw new Error('USER_NOT_FOUND');

    // 1. Thống kê bài thi thử đã làm
    const attempts = await prisma.examAttempt.findMany({
      where: { userId, status: 'COMPLETED' },
      select: {
        id: true,
        score: true,
        listeningScore: true,
        readingScore: true,
        correctCount: true,
        totalCount: true,
        timeSpentSec: true,
        submittedAt: true,
        weakSkills: true,
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    });

    // 2. Thống kê bài học đã hoàn thành
    const completedLessonsCount = await prisma.lessonProgress.count({
      where: { userId, isCompleted: true },
    });

    // 3. Thống kê từ vựng đang học và đã thuộc
    const vocabCount = await prisma.userVocabulary.count({
      where: { userId },
    });

    const masteredVocabCount = await prisma.userVocabulary.count({
      where: { userId, status: 'MASTERED' },
    });

    // 4. Thống kê sổ tay lỗi sai
    const unresolvedMistakesCount = await prisma.mistakeNotebook.count({
      where: { userId, isResolved: false },
    });

    // 5. Thống kê mục cần ôn tập ngắt quãng hôm nay
    const now = new Date();
    const dueReviewsCount = await prisma.reviewSchedule.count({
      where: { userId, nextReviewAt: { lte: now } },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName,
        streakCount: user.streakCount,
        targetExam: user.learningGoal?.targetExam || 'TOEIC',
        targetScore: user.learningGoal?.targetScore || 750,
        currentLevel: user.learningGoal?.currentLevel || '450',
      },
      learningPath: user.learningPath,
      stats: {
        completedLessonsCount,
        vocabCount,
        masteredVocabCount,
        unresolvedMistakesCount,
        dueReviewsCount,
        totalExamsTaken: attempts.length,
      },
      recentAttempts: attempts,
    };
  }
}
