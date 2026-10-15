import { prisma } from '../../lib/prisma';

export class MistakesService {
  async getMyMistakes(userId: string, filter?: { isResolved?: boolean; primaryCause?: any }) {
    const where: any = { userId };
    if (filter?.isResolved !== undefined) {
      where.isResolved = filter.isResolved;
    }
    if (filter?.primaryCause) {
      where.primaryCause = filter.primaryCause;
    }

    return prisma.mistakeNotebook.findMany({
      where,
      include: {
        question: {
          include: { passage: true },
        },
        reviewSchedule: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async resolveMistake(userId: string, mistakeId: string) {
    const mistake = await prisma.mistakeNotebook.findUnique({
      where: { id: mistakeId },
    });

    if (!mistake || mistake.userId !== userId) {
      throw new Error('MISTAKE_NOT_FOUND');
    }

    return prisma.mistakeNotebook.update({
      where: { id: mistakeId },
      data: { isResolved: true },
    });
  }
}
