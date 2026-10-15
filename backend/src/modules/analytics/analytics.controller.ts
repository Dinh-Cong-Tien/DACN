import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

const service = new AnalyticsService();

export class AnalyticsController {
  async getStudentSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const summary = await service.getStudentSummary(userId);
      return res.status(200).json({ data: summary });
    } catch (err) {
      next(err);
    }
  }
}
