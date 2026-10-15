import { Request, Response, NextFunction } from 'express';
import { ExamsService } from './exams.service';
import { SaveExamAnswerSchema, SubmitExamSchema } from '@toeic-vstep/shared';

const service = new ExamsService();

export class ExamsController {
  async startAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { testId } = req.body;
      const result = await service.startAttempt(userId, testId);
      return res.status(201).json({ data: result });
    } catch (err: any) {
      if (err.message === 'TEST_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy đề thi' } });
      }
      next(err);
    }
  }

  async saveAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { attemptId } = req.params;
      const { questionId, selectedKey } = req.body;

      await service.saveAnswer(userId, attemptId, questionId, selectedKey);
      return res.status(200).json({ data: { success: true } });
    } catch (err: any) {
      if (err.message === 'ATTEMPT_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài thi' } });
      }
      if (err.message === 'FORBIDDEN_ATTEMPT_ACCESS') {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Không có quyền truy cập bài thi này' } });
      }
      if (err.message === 'ATTEMPT_ALREADY_CLOSED') {
        return res.status(400).json({ error: { code: 'CLOSED', message: 'Bài thi đã được nộp hoặc hết hạn' } });
      }
      next(err);
    }
  }

  async submitExam(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { attemptId } = req.params;
      const { timeSpentSec } = req.body;

      const result = await service.submitExam(userId, attemptId, timeSpentSec);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      if (err.message === 'ATTEMPT_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài thi' } });
      }
      if (err.message === 'FORBIDDEN_ATTEMPT_ACCESS') {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Không có quyền nộp bài thi này' } });
      }
      next(err);
    }
  }

  async getAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { attemptId } = req.params;
      const result = await service.getAttemptAnalysis(userId, attemptId);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      if (err.message === 'ATTEMPT_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài thi' } });
      }
      next(err);
    }
  }
}
