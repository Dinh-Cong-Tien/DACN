/**
 * /api/v1/admin — Quản trị hệ thống (chỉ ADMIN).
 *  /users/*                         tài khoản & phân quyền        (admin.users.ts)
 *  /courses|questions|tests|…       nội dung học tập              (admin.content.ts)
 *  /classes|support|billing|…       vận hành, cấu hình, thống kê  (admin.ops.ts)
 */
import { Router } from 'express';
import { allow, auth } from '../../core/auth';
import { usersRouter } from './admin.users';
import { contentRouter } from './admin.content';
import { opsRouter } from './admin.ops';

export const adminRouter = Router();
adminRouter.use(auth, allow());
adminRouter.use('/users', usersRouter);
adminRouter.use(contentRouter);
adminRouter.use(opsRouter);
