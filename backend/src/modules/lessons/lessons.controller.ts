import { Request, Response, NextFunction } from 'express';
import { LessonsService } from './lessons.service';

const service = new LessonsService();

export class LessonsController {
  async getLessonById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const result = await service.getLessonById(id, userId);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      if (err.message === 'LESSON_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài học' } });
      }
      next(err);
    }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { isCompleted, timeSpentSec } = req.body;
      const progress = await service.updateProgress(userId, id, { isCompleted, timeSpentSec });
      return res.status(200).json({ data: progress });
    } catch (err) {
      next(err);
    }
  }
}
