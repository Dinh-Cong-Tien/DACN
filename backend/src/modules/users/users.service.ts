import { prisma } from '../../lib/prisma';

export class UsersService {
  async listUsers(query: { role?: any; search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { profile: { fullName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          isEmailVerified: true,
          streakCount: true,
          lastStudyAt: true,
          createdAt: true,
          profile: true,
          learningGoal: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, page, limit, users };
  }

  async updateUserRole(adminId: string, targetUserId: string, newRole: any) {
    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, email: true, role: true },
    });

    // Ghi nhận Audit Log
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_ROLE',
        resource: 'USER',
        resourceId: targetUserId,
        details: { newRole },
      },
    });

    return user;
  }

  async getAuditLogs(limit = 50) {
    return prisma.auditLog.findMany({
      include: {
        user: {
          select: { email: true, profile: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
