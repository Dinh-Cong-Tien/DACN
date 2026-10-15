import { Router } from 'express';
import { MistakesController } from './mistakes.controller';
import { authMiddleware } from '../../middleware/auth';

export const mistakesRouter = Router();
const controller = new MistakesController();

mistakesRouter.use(authMiddleware);

mistakesRouter.get('/', (req, res, next) => controller.getMyMistakes(req, res, next));
mistakesRouter.patch('/:mistakeId/resolve', (req, res, next) => controller.resolveMistake(req, res, next));
