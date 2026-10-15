import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';
import { SubmitSrsReviewSchema } from '@toeic-vstep/shared';

const service = new ReviewService();

export class ReviewController {
  async getDueReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await service.getDueReviews(userId);
      return res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async submitMistakeReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { scheduleId } = req.params;
      const { quality } = SubmitSrsReviewSchema.parse(req.body);

      const result = await service.submitMistakeReview(userId, scheduleId, quality);
      return res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async submitVocabReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { userVocabId } = req.params;
      const { quality } = SubmitSrsReviewSchema.parse(req.body);

      const result = await service.submitVocabReview(userId, userVocabId, quality);
      return res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}
