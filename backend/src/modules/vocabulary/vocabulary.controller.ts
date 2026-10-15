import { Request, Response, NextFunction } from 'express';
import { VocabularyService } from './vocabulary.service';

const service = new VocabularyService();

export class VocabularyController {
  async getTopics(req: Request, res: Response, next: NextFunction) {
    try {
      const { examType } = req.query;
      const topics = await service.getTopics(examType as any);
      return res.status(200).json({ data: topics });
    } catch (err) {
      next(err);
    }
  }

  async getEntriesByTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const { topicId } = req.params;
      const userId = (req as any).user?.userId;
      const entries = await service.getEntriesByTopic(topicId, userId);
      return res.status(200).json({ data: entries });
    } catch (err) {
      next(err);
    }
  }

  async addToMyVocabulary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { vocabId } = req.body;
      const result = await service.addToMyVocabulary(userId, vocabId);
      return res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async getMyVocabulary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { status } = req.query;
      const result = await service.getMyVocabulary(userId, status as any);
      return res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}
