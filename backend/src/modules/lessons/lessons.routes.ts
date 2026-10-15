import { Router } from 'express';
import { LessonsController } from './lessons.controller';
import { authMiddleware } from '../../middleware/auth';

export const lessonsRouter = Router();
const controller = new LessonsController();

lessonsRouter.get('/:id', (req, res, next) => controller.getLessonById(req, res, next));
lessonsRouter.put('/:id/progress', authMiddleware, (req, res, next) => controller.updateProgress(req, res, next));
