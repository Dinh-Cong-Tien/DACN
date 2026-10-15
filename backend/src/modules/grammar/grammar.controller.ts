import { Request, Response, NextFunction } from 'express';
import { GrammarService } from './grammar.service';

const service = new GrammarService();

export class GrammarController {
  async getTopics(req: Request, res: Response, next: NextFunction) {
    try {
      const { level } = req.query;
      const topics = await service.getTopics(level as string);
      return res.status(200).json({ data: topics });
    } catch (err) {
      next(err);
    }
  }

  async getLessonById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lesson = await service.getLessonById(id);
      return res.status(200).json({ data: lesson });
    } catch (err: any) {
      if (err.message === 'GRAMMAR_LESSON_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài ngữ pháp' } });
      }
      next(err);
    }
  }
}
