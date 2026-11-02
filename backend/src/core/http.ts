import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z, ZodTypeAny } from 'zod';
import type { UserRole } from '@prisma/client';

/** Người dùng đã xác thực, gắn vào req bởi middleware `auth`. */
export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Lỗi nghiệp vụ có mã HTTP; error-handler chuyển thành `{ error: { code, message } }`. */
export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

export const badRequest = (message: string, code = 'BAD_REQUEST') => new HttpError(400, code, message);
export const unauthorized = (message = 'Bạn cần đăng nhập') => new HttpError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'Bạn không có quyền thực hiện thao tác này') => new HttpError(403, 'FORBIDDEN', message);
export const notFound = (what = 'Dữ liệu') => new HttpError(404, 'NOT_FOUND', `${what} không tồn tại`);
export const conflict = (message: string, code = 'CONFLICT') => new HttpError(409, code, message);

/** Bọc handler async: lỗi ném ra được chuyển cho error-handler. Giá trị trả về (≠ undefined) được gửi dạng `{ data }`. */
export function handler<T>(fn: (req: Request, res: Response) => Promise<T> | T): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res))
      .then((result) => {
        if (res.headersSent || result === undefined) return;
        res.json({ data: result });
      })
      .catch(next);
  };
}

/** Parse + validate body/query/params bằng Zod; ném ZodError (error-handler trả 400). */
export const parse = <S extends ZodTypeAny>(schema: S, value: unknown): z.infer<S> => schema.parse(value);

/** Phân trang chuẩn: ?page=1&pageSize=20 */
export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  q: z.string().trim().optional(),
});
export type PageQuery = z.infer<typeof pageQuery>;
export const paged = <T>(items: T[], total: number, q: PageQuery) => ({ items, total, page: q.page, pageSize: q.pageSize });

export const me = (req: Request): AuthUser => {
  if (!req.user) throw unauthorized();
  return req.user;
};
