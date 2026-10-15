import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middleware/auth';

export const authRouter = Router();
const controller = new AuthController();

authRouter.post('/register', (req, res, next) => controller.register(req, res, next));
authRouter.post('/login', (req, res, next) => controller.login(req, res, next));
authRouter.get('/me', authMiddleware, (req, res, next) => controller.getMe(req, res, next));
