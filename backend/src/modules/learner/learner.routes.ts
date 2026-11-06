import express, { Router } from 'express';
import { auth } from '../../core/auth';
import { attemptsRouter } from './attempts';
import { classesRouter } from './classes';
import { miscRouter } from './misc';
import { pathRouter } from './path';
import { AVATAR_DIR, LESSON_VIDEO_DIR, practiceRouter, UPLOAD_DIR } from './practice';
import { progressRouter } from './progress';
import { studyRouter } from './study';

/**
 * /api/v1/learner — chức năng cơ bản phía học viên (mọi route cần đăng nhập).
 * Giáo viên/TBM/Admin cũng gọi được (xem như học viên) vì dữ liệu luôn lọc theo req.user.
 */
export const learnerRouter = Router();

// File ghi âm phát trong thẻ <audio> (không gửi được header Authorization) → phục vụ công khai theo tên ngẫu nhiên UUID
learnerRouter.use('/media', express.static(UPLOAD_DIR, { fallthrough: false, maxAge: '7d' }));
learnerRouter.use('/avatars', express.static(AVATAR_DIR, { fallthrough: false, maxAge: '30d' }));
// Video bài giảng giáo viên tải lên (hỗ trợ Range để tua)
learnerRouter.use('/lesson-videos', express.static(LESSON_VIDEO_DIR, { fallthrough: false, maxAge: '7d' }));
learnerRouter.use(auth);
learnerRouter.use(pathRouter);
learnerRouter.use(attemptsRouter);
learnerRouter.use(studyRouter);
learnerRouter.use(progressRouter);
learnerRouter.use(classesRouter);
learnerRouter.use(miscRouter);
learnerRouter.use(practiceRouter);
