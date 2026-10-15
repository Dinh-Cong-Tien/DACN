import { Request, Response, NextFunction } from 'express';
import { CoursesService } from './courses.service';

const service = new CoursesService();

export class CoursesController {
  async listCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { examType, targetLevel } = req.query;
      const courses = await service.listCourses({ examType: examType as any, targetLevel: targetLevel as string });
      return res.status(200).json({ data: courses });
    } catch (err) {
      next(err);
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const result = await service.getCourseById(id, userId);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      if (err.message === 'COURSE_NOT_FOUND') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy khóa học' } });
      }
      next(err);
    }
  }

  async enrollCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const enrollment = await service.enrollCourse(userId, id);
      return res.status(201).json({ data: enrollment });
    } catch (err) {
      next(err);
    }
  }
}
