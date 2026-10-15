import { Router } from 'express';
import { QuestionsController } from './questions.controller';

export const questionsRouter = Router();
const controller = new QuestionsController();

questionsRouter.get('/', (req, res, next) => controller.searchQuestions(req, res, next));
questionsRouter.get('/:id', (req, res, next) => controller.getQuestionById(req, res, next));
