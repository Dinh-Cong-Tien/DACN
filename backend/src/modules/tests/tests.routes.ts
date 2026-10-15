import { Router } from 'express';
import { TestsController } from './tests.controller';

export const testsRouter = Router();
const controller = new TestsController();

testsRouter.get('/', (req, res, next) => controller.listMockTests(req, res, next));
testsRouter.get('/:id', (req, res, next) => controller.getMockTestDetail(req, res, next));
