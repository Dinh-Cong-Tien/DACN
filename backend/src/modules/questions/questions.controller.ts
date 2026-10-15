import { Request, Response, NextFunction } from 'express';
import { QuestionsService } from './questions.service';

const service = new QuestionsService();

export class QuestionsController {
  async searchQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { examType, skillType, partOrSkill, difficulty, tag, limit } = req.query;
      const questions = await service.searchQuestions({
        examType: examType as any,
        skillType: skillType as any,
        partOrSkill: partOrSkill as string,
        difficulty: difficulty ? Number(difficulty) : undefined,
        tag: tag as string,
        limit: limit ? Number(limit) : undefined,
      });
      return res.status(200).json({ data: questions });
    } catch (err) {
      next(err);
    }
  }

  async getQuestionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const question = await service.getQuestionById(id);
      return res.status(200).json({ data: question });
    } catch (err: any) {
      if (err.message === 'QUESTION_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy câu hỏi' } });
      }
      next(err);
    }
  }
}
