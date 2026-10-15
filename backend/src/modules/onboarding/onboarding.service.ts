import { prisma } from '../../lib/prisma';
import { OnboardingGoalInput, OnboardingScheduleInput, calculateToeicScore, calculateVstepScore } from '@toeic-vstep/shared';

export class OnboardingService {
  async saveGoal(userId: string, input: OnboardingGoalInput) {
    return prisma.learningGoal.upsert({
      where: { userId },
      update: {
        targetExam: input.targetExam,
        currentLevel: input.currentLevel,
        targetScore: input.targetScore,
        targetLevel: input.targetLevel,
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
        purpose: input.purpose,
      },
      create: {
        userId,
        targetExam: input.targetExam,
        currentLevel: input.currentLevel,
        targetScore: input.targetScore,
        targetLevel: input.targetLevel,
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
        purpose: input.purpose,
      },
    });
  }

  async saveSchedule(userId: string, input: OnboardingScheduleInput) {
    return prisma.learningSchedule.upsert({
      where: { userId },
      update: {
        studyDaysPerWeek: input.studyDaysPerWeek,
        minutesPerDay: input.minutesPerDay,
        preferredTimeSlot: input.preferredTimeSlot,
      },
      create: {
        userId,
        studyDaysPerWeek: input.studyDaysPerWeek,
        minutesPerDay: input.minutesPerDay,
        preferredTimeSlot: input.preferredTimeSlot,
      },
    });
  }

  async submitPlacement(userId: string, answers: Record<string, string>, examType: 'TOEIC' | 'VSTEP') {
    // 1. Tự động chấm điểm bài đầu vào dựa theo answers
    const totalQuestions = Object.keys(answers).length || 20;
    let correctCount = 0;
    for (const [_, key] of Object.entries(answers)) {
      if (key === 'A' || key === 'B') correctCount++; // Mô phỏng logic chấm thực
    }

    let estimatedScore = 0;
    let estimatedLevel = 'A2';

    if (examType === 'TOEIC') {
      const scaled = calculateToeicScore((correctCount / totalQuestions) * 100, (correctCount / totalQuestions) * 100);
      estimatedScore = scaled.totalScore;
      estimatedLevel = estimatedScore >= 750 ? 'Cấp độ B2 (750+)' : estimatedScore >= 500 ? 'Cấp độ B1 (500-700)' : 'Cấp độ Căn bản (350-450)';
    } else {
      const vstep = calculateVstepScore({
        listening: (correctCount / totalQuestions) * 10,
        reading: (correctCount / totalQuestions) * 10,
        writing: 5.0,
        speaking: 5.0,
      });
      estimatedScore = vstep.finalScore;
      estimatedLevel = vstep.cefrLevel;
    }

    // 2. Cập nhật currentLevel vào User và Goal
    await prisma.learningGoal.upsert({
      where: { userId },
      update: { currentLevel: `${estimatedScore}` },
      create: {
        userId,
        targetExam: examType,
        currentLevel: `${estimatedScore}`,
      },
    });

    // 3. Tự động sinh Lộ trình học (Learning Path)
    const stages = [
      {
        stage: 'FOUNDATION',
        name: 'Giai đoạn 1: Nền tảng Ngữ pháp & Từ vựng trọng tâm',
        status: 'IN_PROGRESS',
        milestones: ['Củng cố 12 thì tiếng Anh', 'Bộ 600 từ vựng cốt lõi', 'Nhận diện bẫy Part 1-2'],
      },
      {
        stage: 'SKILL_BUILDING',
        name: 'Giai đoạn 2: Bứt phá kỹ năng Đọc hiểu & Nghe đoạn hội thoại',
        status: 'LOCKED',
        milestones: ['Chiến thuật Scanning & Skimming Part 7', 'Bẫy paraphrase Part 3-4'],
      },
      {
        stage: 'EXAM_PRACTICE',
        name: 'Giai đoạn 3: Luyện đề tổng hợp & Tối ưu thời gian thi',
        status: 'LOCKED',
        milestones: ['Giải 5 đề thi chuẩn format', 'Khắc phục 100% lỗi sai trong Notebook'],
      },
    ];

    const learningPath = await prisma.learningPath.upsert({
      where: { userId },
      update: {
        currentStage: 'FOUNDATION',
        stages,
      },
      create: {
        userId,
        currentStage: 'FOUNDATION',
        stages,
      },
    });

    return {
      estimatedScore,
      estimatedLevel,
      correctCount,
      totalQuestions,
      learningPath,
    };
  }

  async getMyLearningPath(userId: string) {
    return prisma.learningPath.findUnique({
      where: { userId },
      include: { items: { orderBy: { orderIndex: 'asc' } } },
    });
  }
}
