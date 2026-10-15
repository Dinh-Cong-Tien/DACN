import { Request, Response, NextFunction } from 'express';
import { OnboardingService } from './onboarding.service';
import { OnboardingGoalSchema, OnboardingScheduleSchema } from '@toeic-vstep/shared';

const service = new OnboardingService();

export class OnboardingController {
  async saveGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const data = OnboardingGoalSchema.parse(req.body);
      const result = await service.saveGoal(userId, data);
      return res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async saveSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const data = OnboardingScheduleSchema.parse(req.body);
      const result = await service.saveSchedule(userId, data);
      return res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async submitPlacement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { answers, examType } = req.body;
      const result = await service.submitPlacement(userId, answers || {}, examType || 'TOEIC');
      return res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async getMyLearningPath(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await service.getMyLearningPath(userId);
      return res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}
