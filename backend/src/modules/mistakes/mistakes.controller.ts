import { Request, Response, NextFunction } from 'express';
import { MistakesService } from './mistakes.service';

const service = new MistakesService();

export class MistakesController {
  async getMyMistakes(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const isResolved = req.query.isResolved !== undefined ? req.query.isResolved === 'true' : undefined;
      const primaryCause = req.query.primaryCause as any;

      const mistakes = await service.getMyMistakes(userId, { isResolved, primaryCause });
      return res.status(200).json({ data: mistakes });
    } catch (err) {
      next(err);
    }
  }

  async resolveMistake(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { mistakeId } = req.params;
      const updated = await service.resolveMistake(userId, mistakeId);
      return res.status(200).json({ data: updated });
    } catch (err: any) {
      if (err.message === 'MISTAKE_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy mục lỗi' } });
      }
      next(err);
    }
  }
}
