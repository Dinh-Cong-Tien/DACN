import { Request, Response, NextFunction } from 'express';

export function rbacMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Bạn không có quyền truy cập chức năng này',
        },
      });
    }
    next();
  };
}

export const requireRole = rbacMiddleware;
