import { prisma } from '../../lib/prisma';

export class CoursesService {
  async listCourses(filter?: { examType?: any; targetLevel?: string }) {
    const where: any = { isPublished: true };
    if (filter?.examType) where.examType = filter.examType;
    if (filter?.targetLevel) where.targetLevel = filter.targetLevel;

    return prisma.course.findMany({
      where,
      include: {
        sections: {
          include: {
            lessons: {
              select: { id: true, title: true, durationMins: true, skillType: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseById(courseId: string, userId?: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!course) throw new Error('COURSE_NOT_FOUND');

    let enrollment = null;
    if (userId) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });
    }

    return { course, enrollment };
  }

  async enrollCourse(userId: string, courseId: string) {
    return prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      update: {},
      create: {
        userId,
        courseId,
        progressPct: 0.0,
      },
    });
  }
}
