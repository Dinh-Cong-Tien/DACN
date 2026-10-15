import { Router } from 'express';
import { GrammarController } from './grammar.controller';

export const grammarRouter = Router();
const controller = new GrammarController();

grammarRouter.get('/topics', (req, res, next) => controller.getTopics(req, res, next));
grammarRouter.get('/lessons/:id', (req, res, next) => controller.getLessonById(req, res, next));
