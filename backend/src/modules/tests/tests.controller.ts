import { Request, Response, NextFunction } from 'express';
import { TestsService } from './tests.service';

const service = new TestsService();

export class TestsController {
  async listMockTests(req: Request, res: Response, next: NextFunction) {
    try {
      const { examType } = req.query;
      const tests = await service.listMockTests(examType as any);
      return res.status(200).json({ data: tests });
    } catch (err) {
      next(err);
    }
  }

  async getMockTestDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const test = await service.getMockTestDetail(id);
      return res.status(200).json({ data: test });
    } catch (err: any) {
      if (err.message === 'TEST_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy đề thi' } });
      }
      next(err);
    }
  }
}
