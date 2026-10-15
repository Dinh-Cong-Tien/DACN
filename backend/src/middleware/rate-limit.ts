import { Request, Response, NextFunction } from 'express';

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  // Rate-limiting placeholder
  next();
}
