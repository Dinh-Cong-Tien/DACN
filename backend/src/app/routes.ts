import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authRouter } from '../modules/auth/auth.routes';
import { catalogRouter } from '../modules/catalog/catalog.routes';
import { cmsRouter } from '../modules/cms/cms.routes';
import { learnerRouter } from '../modules/learner/learner.routes';
import { teacherRouter } from '../modules/teacher/teacher.routes';
import { headRouter } from '../modules/head/head.routes';
import { adminRouter } from '../modules/admin/admin.routes';

/**
 * Đăng ký router của các module. Mỗi module export `xxxRouter` từ `modules/<tên>/<tên>.routes.ts`
 * và được gắn dưới `/api/v1/<tên>`.
 */
export const appRouter = Router();

appRouter.get('/health', async (_req, res) => {
  const db = await prisma.$queryRaw`SELECT 1`.then(() => 'up').catch(() => 'down');
  res.json({ status: db === 'up' ? 'ok' : 'degraded', db, service: 'OrbiLingo API', time: new Date().toISOString() });
});

appRouter.use('/v1/auth', authRouter);
appRouter.use('/v1/catalog', catalogRouter);
appRouter.use('/v1/cms', cmsRouter);
appRouter.use('/v1/learner', learnerRouter);
appRouter.use('/v1/teacher', teacherRouter);
appRouter.use('/v1/head', headRouter);
appRouter.use('/v1/admin', adminRouter);
