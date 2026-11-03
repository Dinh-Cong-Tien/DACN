/**
 * /api/v1/teacher — bám theo các trang của học viên:
 * - Chi tiết một lượt làm bài của học viên (như trang Kết quả bài thi của học viên): theo Part + từng câu.
 * - Bảng xếp hạng lớp (cùng cách tính điểm nỗ lực với Bảng vinh danh của học viên, lọc trong lớp).
 */
import { Router, type Request } from 'express';
import { z } from 'zod';
import { handler, me, parse } from '../../core/http';
import { assertClass, assertStudent } from './teacher.service';
import { attemptDetailOf, classLeaderboardOf } from './insights.service';

export const insightsRouter = Router();
const uuid = z.string().uuid();
const P = (req: Request, k = 'id') => parse(uuid, req.params[k]);
export const periodQuery = z.object({ period: z.enum(['week', 'month', 'all']).default('week') });

insightsRouter.get(
  '/students/:id/attempts/:attemptId',
  handler(async (req) => {
    const student = await assertStudent(me(req), P(req));
    return attemptDetailOf(student.id, P(req, 'attemptId'));
  })
);

insightsRouter.get(
  '/classes/:id/leaderboard',
  handler(async (req) => {
    const c = await assertClass(me(req), P(req));
    return classLeaderboardOf(c.id, parse(periodQuery, req.query).period);
  })
);
