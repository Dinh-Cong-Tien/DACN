import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';

const service = new UsersService();

export class UsersController {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, search, page, limit } = req.query;
      const result = await service.listUsers({
        role: role as any,
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      return res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user.userId;
      const { id } = req.params;
      const { role } = req.body;
      const updated = await service.updateUserRole(adminId, id, role);
      return res.status(200).json({ data: updated });
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await service.getAuditLogs();
      return res.status(200).json({ data: logs });
    } catch (err) {
      next(err);
    }
  }
}
