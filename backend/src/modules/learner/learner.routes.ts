import { Router } from 'express';
import { auth } from '../../core/auth';
import { attemptsRouter } from './attempts';
import { classesRouter } from './classes';
import { miscRouter } from './misc';
import { pathRouter } from './path';
import { progressRouter } from './progress';
import { studyRouter } from './study';

/**
 * /api/v1/learner — chức năng cơ bản phía học viên (mọi route cần đăng nhập).
 * Giáo viên/TBM/Admin cũng gọi được (xem như học viên) vì dữ liệu luôn lọc theo req.user.
 */
export const learnerRouter = Router();

learnerRouter.use(auth);
learnerRouter.use(pathRouter);
learnerRouter.use(attemptsRouter);
learnerRouter.use(studyRouter);
learnerRouter.use(progressRouter);
learnerRouter.use(classesRouter);
learnerRouter.use(miscRouter);
