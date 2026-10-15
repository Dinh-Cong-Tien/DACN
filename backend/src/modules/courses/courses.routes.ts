import { Router } from 'express';
import { CoursesController } from './courses.controller';
import { authMiddleware } from '../../middleware/auth';

export const coursesRouter = Router();
const controller = new CoursesController();

coursesRouter.get('/', (req, res, next) => controller.listCourses(req, res, next));
coursesRouter.get('/:id', (req, res, next) => controller.getCourseById(req, res, next));
coursesRouter.post('/:id/enroll', authMiddleware, (req, res, next) => controller.enrollCourse(req, res, next));
