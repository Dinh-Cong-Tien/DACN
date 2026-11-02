import { Router } from 'express';
import { coursesRouter } from './courses';
import { testsRouter } from './tests';
import { lexiconRouter } from './lexicon';

/**
 * /api/v1/catalog — nội dung học (công khai; kèm tiến độ cá nhân khi có token):
 * khoá học & bài học, đề thi, luyện tập theo Part / Viết / Nói / chép chính tả, từ vựng, tra từ, ngữ pháp.
 */
export const catalogRouter = Router();

catalogRouter.use(coursesRouter);
catalogRouter.use(testsRouter);
catalogRouter.use(lexiconRouter);
