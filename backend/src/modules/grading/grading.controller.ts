import { Request, Response, NextFunction } from 'express';
import { GradingService } from './grading.service';

const service = new GradingService();

export class GradingController {
  async getMyClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = (req as any).user.userId;
      const classes = await service.getMyClasses(teacherId);
      return res.status(200).json({ data: classes });
    } catch (err) {
      next(err);
    }
  }

  async getPendingSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = (req as any).user.userId;
      const submissions = await service.getPendingSubmissions(teacherId);
      return res.status(200).json({ data: submissions });
    } catch (err) {
      next(err);
    }
  }

  async gradeSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = (req as any).user.userId;
      const { submissionId } = req.params;
      const { score, feedback, rubricScores } = req.body;
      const graded = await service.gradeSubmission(teacherId, submissionId, {
        score: Number(score),
        feedback,
        rubricScores,
      });
      return res.status(200).json({ data: graded });
    } catch (err: any) {
      if (err.message === 'SUBMISSION_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài nộp' } });
      }
      if (err.message === 'FORBIDDEN_TEACHER_ACCESS') {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Bạn không có quyền chấm bài này' } });
      }
      next(err);
    }
  }
}
