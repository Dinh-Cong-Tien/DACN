import { prisma } from '../../lib/prisma';

export class TestsService {
  async listMockTests(examType?: any) {
    const where: any = { isPublished: true };
    if (examType) where.examType = examType;

    return prisma.mockTest.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        examType: true,
        targetLevel: true,
        durationMinutes: true,
        totalQuestions: true,
        version: true,
        createdAt: true,
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMockTestDetail(id: string) {
    const test = await prisma.mockTest.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            questions: {
              select: {
                id: true,
                orderIndex: true,
                points: true,
                question: {
                  select: {
                    id: true,
                    type: true,
                    skillType: true,
                    partOrSkill: true,
                    difficulty: true,
                  },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!test) throw new Error('TEST_NOT_FOUND');
    return test;
  }
}
