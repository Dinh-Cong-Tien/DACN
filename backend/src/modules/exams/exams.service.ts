import { prisma } from '../../lib/prisma';
import { calculateToeicScore, calculateVstepScore, classifyMistake } from '@toeic-vstep/shared';

export class ExamsService {
  async startAttempt(userId: string, testId: string) {
    const test = await prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                question: {
                  include: { passage: true },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!test) {
      throw new Error('TEST_NOT_FOUND');
    }

    // Đếm tổng số câu hỏi
    const totalCount = test.sections.reduce((acc, sec) => acc + sec.questions.length, 0);

    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        testId,
        status: 'IN_PROGRESS',
        answers: {},
        totalCount,
      },
    });

    return {
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      test: {
        id: test.id,
        title: test.title,
        examType: test.examType,
        durationMinutes: test.durationMinutes,
        totalQuestions: totalCount,
        sections: test.sections.map((sec) => ({
          id: sec.id,
          name: sec.name,
          skillType: sec.skillType,
          questions: sec.questions.map((mq) => ({
            id: mq.question.id,
            examType: mq.question.examType,
            type: mq.question.type,
            skillType: mq.question.skillType,
            partOrSkill: mq.question.partOrSkill,
            level: mq.question.level,
            stem: mq.question.stem,
            options: mq.question.options,
            passage: mq.question.passage,
            // Không trả correctAnswer khi đang làm bài
          })),
        })),
      },
    };
  }

  async saveAnswer(userId: string, attemptId: string, questionId: string, selectedKey: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error('ATTEMPT_NOT_FOUND');
    }

    if (attempt.userId !== userId) {
      throw new Error('FORBIDDEN_ATTEMPT_ACCESS');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new Error('ATTEMPT_ALREADY_CLOSED');
    }

    const currentAnswers = (attempt.answers as Record<string, any>) || {};
    currentAnswers[questionId] = {
      selectedKey,
      answeredAt: new Date().toISOString(),
    };

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { answers: currentAnswers },
    });

    return { success: true };
  }

  async submitExam(userId: string, attemptId: string, timeSpentSec: number) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            sections: {
              include: {
                questions: {
                  include: { question: true },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) throw new Error('ATTEMPT_NOT_FOUND');
    if (attempt.userId !== userId) throw new Error('FORBIDDEN_ATTEMPT_ACCESS');
    if (attempt.status !== 'IN_PROGRESS') throw new Error('ATTEMPT_ALREADY_CLOSED');

    const answers = (attempt.answers as Record<string, any>) || {};
    let correctCount = 0;
    let rawListening = 0;
    let rawReading = 0;

    const weakSkillStats: Record<string, { total: number; correct: number }> = {};
    const mistakesToRecord: Array<{
      questionId: string;
      wrongAnswer: any;
      cause: any;
    }> = [];

    // Chấm từng câu hỏi
    for (const section of attempt.test.sections) {
      for (const item of section.questions) {
        const q = item.question;
        const studentAns = answers[q.id]?.selectedKey;
        const correctKey =
          typeof q.correctAnswer === 'object' && 'key' in (q.correctAnswer as any)
            ? (q.correctAnswer as any).key
            : q.correctAnswer;

        // Thống kê phân tích điểm yếu (Weak Skills)
        const skillGroup = `${q.skillType} - ${q.partOrSkill}`;
        if (!weakSkillStats[skillGroup]) {
          weakSkillStats[skillGroup] = { total: 0, correct: 0 };
        }
        weakSkillStats[skillGroup].total += 1;

        if (studentAns && studentAns === correctKey) {
          correctCount++;
          weakSkillStats[skillGroup].correct += 1;
          if (q.skillType === 'LISTENING') rawListening++;
          if (q.skillType === 'READING') rawReading++;
        } else {
          // Bắt câu sai đưa vào Mistake Notebook
          const cause = classifyMistake({
            skillType: q.skillType,
            tags: q.tags,
            isBlanks: !studentAns,
          });

          mistakesToRecord.push({
            questionId: q.id,
            wrongAnswer: studentAns || 'BLANK',
            cause,
          });
        }
      }
    }

    // Tính điểm theo TOEIC hoặc VSTEP
    let finalScore = 0;
    let listeningScore = 0;
    let readingScore = 0;

    if (attempt.test.examType === 'TOEIC') {
      const toeicResult = calculateToeicScore(rawListening, rawReading);
      finalScore = toeicResult.totalScore;
      listeningScore = toeicResult.listeningScore;
      readingScore = toeicResult.readingScore;
    } else {
      // VSTEP trắc nghiệm tạm tính Reading & Listening
      const vstepResult = calculateVstepScore({
        listening: (rawListening / 35) * 10,
        reading: (rawReading / 40) * 10,
        writing: 0,
        speaking: 0,
      });
      finalScore = vstepResult.finalScore;
    }

    // Tính tỷ lệ chính xác từng nhóm kỹ năng (%)
    const weakSkillsResult: Record<string, number> = {};
    for (const [key, stats] of Object.entries(weakSkillStats)) {
      weakSkillsResult[key] = Math.round((stats.correct / stats.total) * 100);
    }

    // Lưu kết quả attempt
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        score: finalScore,
        listeningScore,
        readingScore,
        correctCount,
        timeSpentSec,
        submittedAt: new Date(),
        weakSkills: weakSkillsResult,
      },
    });

    // Tự động đồng bộ lỗi vào Sổ tay lỗi sai (MistakeNotebook)
    for (const mistake of mistakesToRecord) {
      await prisma.mistakeNotebook.upsert({
        where: {
          userId_questionId: {
            userId,
            questionId: mistake.questionId,
          },
        },
        update: {
          mistakeCount: { increment: 1 },
          userWrongAnswer: mistake.wrongAnswer,
          isResolved: false,
        },
        create: {
          userId,
          questionId: mistake.questionId,
          userWrongAnswer: mistake.wrongAnswer,
          primaryCause: mistake.cause,
          sourceContext: 'MOCK_TEST',
          reviewSchedule: {
            create: {
              userId,
              intervalDays: 1,
              nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Ôn lại ngày mai
            },
          },
        },
      });
    }

    return {
      attemptId: updatedAttempt.id,
      score: finalScore,
      listeningScore,
      readingScore,
      correctCount,
      totalCount: attempt.totalCount,
      timeSpentSec,
      weakSkills: weakSkillsResult,
    };
  }

  async getAttemptAnalysis(userId: string, attemptId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            sections: {
              include: {
                questions: {
                  include: {
                    question: {
                      include: { passage: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) throw new Error('ATTEMPT_NOT_FOUND');
    if (attempt.userId !== userId) throw new Error('FORBIDDEN_ATTEMPT_ACCESS');

    const answers = (attempt.answers as Record<string, any>) || {};

    return {
      attempt: {
        id: attempt.id,
        score: attempt.score,
        listeningScore: attempt.listeningScore,
        readingScore: attempt.readingScore,
        correctCount: attempt.correctCount,
        totalCount: attempt.totalCount,
        timeSpentSec: attempt.timeSpentSec,
        submittedAt: attempt.submittedAt,
        weakSkills: attempt.weakSkills,
      },
      reviewQuestions: attempt.test.sections.flatMap((s) =>
        s.questions.map((mq) => {
          const q = mq.question;
          const studentAns = answers[q.id]?.selectedKey;
          const correctKey =
            typeof q.correctAnswer === 'object' && 'key' in (q.correctAnswer as any)
              ? (q.correctAnswer as any).key
              : q.correctAnswer;

          return {
            id: q.id,
            stem: q.stem,
            options: q.options,
            passage: q.passage,
            studentAnswer: studentAns,
            correctAnswer: correctKey,
            isCorrect: studentAns === correctKey,
            explanation: q.explanation,
            tags: q.tags,
            partOrSkill: q.partOrSkill,
          };
        })
      ),
    };
  }
}
