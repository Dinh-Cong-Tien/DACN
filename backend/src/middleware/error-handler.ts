import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../lib/logger';
import { HttpError } from '../core/http';

/** Định dạng lỗi thống nhất: `{ error: { code, message, details? } }`. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ', details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) },
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: { code: 'DUPLICATE', message: 'Dữ liệu đã tồn tại', details: err.meta } });
    if (err.code === 'P2025') return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy dữ liệu' } });
    if (err.code === 'P2003') return res.status(409).json({ error: { code: 'IN_USE', message: 'Dữ liệu đang được tham chiếu, không thể xoá' } });
  }
  // Vi phạm CHECK / trigger trong PostgreSQL (mã 23514)
  const msg = err instanceof Error ? err.message : String(err);
  if (/23514|check_violation/.test(msg)) return res.status(400).json({ error: { code: 'CONSTRAINT', message: msg.split('\n').pop() } });

  logger.error({ err, path: req.path }, 'Unhandled error');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: process.env.NODE_ENV === 'production' ? 'Lỗi máy chủ' : msg } });
}
