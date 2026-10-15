import { Router } from 'express';
import { UsersController } from './users.controller';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

export const usersRouter = Router();
const controller = new UsersController();

usersRouter.use(authMiddleware);
usersRouter.use(requireRole(['ADMIN']));

usersRouter.get('/', (req, res, next) => controller.listUsers(req, res, next));
usersRouter.patch('/:id/role', (req, res, next) => controller.updateUserRole(req, res, next));
usersRouter.get('/audit-logs', (req, res, next) => controller.getAuditLogs(req, res, next));
