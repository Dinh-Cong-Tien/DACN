import { Router } from 'express';
import { GradingController } from './grading.controller';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

export const gradingRouter = Router();
const controller = new GradingController();

gradingRouter.use(authMiddleware);
gradingRouter.use(requireRole(['TEACHER', 'ADMIN']));

gradingRouter.get('/classes', (req, res, next) => controller.getMyClasses(req, res, next));
gradingRouter.get('/pending', (req, res, next) => controller.getPendingSubmissions(req, res, next));
gradingRouter.post('/submissions/:submissionId', (req, res, next) => controller.gradeSubmission(req, res, next));
