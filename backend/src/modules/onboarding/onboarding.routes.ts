import { Router } from 'express';
import { OnboardingController } from './onboarding.controller';
import { authMiddleware } from '../../middleware/auth';

export const onboardingRouter = Router();
const controller = new OnboardingController();

onboardingRouter.use(authMiddleware);

onboardingRouter.post('/goal', (req, res, next) => controller.saveGoal(req, res, next));
onboardingRouter.post('/schedule', (req, res, next) => controller.saveSchedule(req, res, next));
onboardingRouter.post('/placement', (req, res, next) => controller.submitPlacement(req, res, next));
onboardingRouter.get('/learning-path', (req, res, next) => controller.getMyLearningPath(req, res, next));
