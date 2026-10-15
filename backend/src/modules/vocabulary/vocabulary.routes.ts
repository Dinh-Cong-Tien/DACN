import { Router } from 'express';
import { VocabularyController } from './vocabulary.controller';
import { authMiddleware } from '../../middleware/auth';

export const vocabularyRouter = Router();
const controller = new VocabularyController();

vocabularyRouter.get('/topics', (req, res, next) => controller.getTopics(req, res, next));
vocabularyRouter.get('/topics/:topicId/entries', (req, res, next) => controller.getEntriesByTopic(req, res, next));
vocabularyRouter.post('/my-list', authMiddleware, (req, res, next) => controller.addToMyVocabulary(req, res, next));
vocabularyRouter.get('/my-list', authMiddleware, (req, res, next) => controller.getMyVocabulary(req, res, next));
