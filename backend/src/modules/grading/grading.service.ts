import { prisma } from '../../lib/prisma';

export class GradingService {
  async getMyClasses(teacherId: string) {
    return prisma.class.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: { members: true, assignments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingSubmissions(teacherId: string) {
    return prisma.assignmentSubmission.findMany({
      where: {
        score: null, // Chưa chấm
        assignment: {
          class: { teacherId },
        },
      },
      include: {
        assignment: true,
        student: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async gradeSubmission(
    teacherId: string,
    submissionId: string,
    input: { score: number; feedback: string; rubricScores?: any }
  ) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: { include: { class: true } } },
    });

    if (!submission) throw new Error('SUBMISSION_NOT_FOUND');
    if (submission.assignment.class.teacherId !== teacherId) {
      throw new Error('FORBIDDEN_TEACHER_ACCESS');
    }

    return prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        graderId: teacherId,
        score: input.score,
        feedback: input.feedback,
        rubricScores: input.rubricScores || {},
        gradedAt: new Date(),
      },
    });
  }
}
