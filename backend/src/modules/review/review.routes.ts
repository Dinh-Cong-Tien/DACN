import { Router } from 'express';
import { ReviewController } from './review.controller';
import { authMiddleware } from '../../middleware/auth';

export const reviewRouter = Router();
const controller = new ReviewController();

reviewRouter.use(authMiddleware);

reviewRouter.get('/due', (req, res, next) => controller.getDueReviews(req, res, next));
reviewRouter.post('/mistakes/:scheduleId', (req, res, next) => controller.submitMistakeReview(req, res, next));
reviewRouter.post('/vocabulary/:userVocabId', (req, res, next) => controller.submitVocabReview(req, res, next));
