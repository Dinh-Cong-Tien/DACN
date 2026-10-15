import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err);

  // Xử lý lỗi validate Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu đầu vào không hợp lệ',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  const statusCode = err.status || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Đã xảy ra lỗi nội bộ không mong muốn'
    : err.message || 'Lỗi máy chủ nội bộ';

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
