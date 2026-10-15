import { prisma } from '../../lib/prisma';

export class QuestionsService {
  async searchQuestions(filter: {
    examType?: any;
    skillType?: any;
    partOrSkill?: string;
    difficulty?: number;
    tag?: string;
    limit?: number;
  }) {
    const where: any = {};
    if (filter.examType) where.examType = filter.examType;
    if (filter.skillType) where.skillType = filter.skillType;
    if (filter.partOrSkill) where.partOrSkill = filter.partOrSkill;
    if (filter.difficulty) where.difficulty = Number(filter.difficulty);
    if (filter.tag) where.tags = { has: filter.tag };

    return prisma.question.findMany({
      where,
      include: { passage: true },
      take: filter.limit || 50,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuestionById(id: string) {
    const question = await prisma.question.findUnique({
      where: { id },
      include: { passage: true },
    });
    if (!question) throw new Error('QUESTION_NOT_FOUND');
    return question;
  }
}
