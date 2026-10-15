import { Router } from 'express';
import { ExamsController } from './exams.controller';
import { authMiddleware } from '../../middleware/auth';

export const examsRouter = Router();
const controller = new ExamsController();

examsRouter.use(authMiddleware);

examsRouter.post('/attempts', (req, res, next) => controller.startAttempt(req, res, next));
examsRouter.put('/attempts/:attemptId/answers', (req, res, next) => controller.saveAnswer(req, res, next));
examsRouter.post('/attempts/:attemptId/submit', (req, res, next) => controller.submitExam(req, res, next));
examsRouter.get('/attempts/:attemptId/analysis', (req, res, next) => controller.getAnalysis(req, res, next));
