import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware } from '../../middleware/auth';

export const analyticsRouter = Router();
const controller = new AnalyticsController();

analyticsRouter.use(authMiddleware);
analyticsRouter.get('/me', (req, res, next) => controller.getStudentSummary(req, res, next));
