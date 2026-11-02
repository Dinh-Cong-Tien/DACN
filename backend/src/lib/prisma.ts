import { PrismaClient } from '@prisma/client';

/** Một PrismaClient dùng chung toàn app (tránh mở nhiều pool khi tsx watch reload). */
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient({ log: ['warn', 'error'] });
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
