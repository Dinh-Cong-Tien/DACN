import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { onboardingRouter } from '../modules/onboarding/onboarding.routes';
import { coursesRouter } from '../modules/courses/courses.routes';
import { lessonsRouter } from '../modules/lessons/lessons.routes';
import { vocabularyRouter } from '../modules/vocabulary/vocabulary.routes';
import { grammarRouter } from '../modules/grammar/grammar.routes';
import { questionsRouter } from '../modules/questions/questions.routes';
import { testsRouter } from '../modules/tests/tests.routes';
import { examsRouter } from '../modules/exams/exams.routes';
import { mistakesRouter } from '../modules/mistakes/mistakes.routes';
import { reviewRouter } from '../modules/review/review.routes';
import { analyticsRouter } from '../modules/analytics/analytics.routes';
import { gradingRouter } from '../modules/grading/grading.routes';
import { usersRouter } from '../modules/users/users.routes';

export const appRouter = Router();

// Health check
appRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'OrbiLingo API',
    version: 'v1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// V1 Modular REST API Endpoints
appRouter.use('/v1/auth', authRouter);
appRouter.use('/v1/onboarding', onboardingRouter);
appRouter.use('/v1/courses', coursesRouter);
appRouter.use('/v1/lessons', lessonsRouter);
appRouter.use('/v1/vocabulary', vocabularyRouter);
appRouter.use('/v1/grammar', grammarRouter);
appRouter.use('/v1/questions', questionsRouter);
appRouter.use('/v1/tests', testsRouter);
appRouter.use('/v1/exams', examsRouter);
appRouter.use('/v1/mistakes', mistakesRouter);
appRouter.use('/v1/review', reviewRouter);
appRouter.use('/v1/analytics', analyticsRouter);
appRouter.use('/v1/grading', gradingRouter);
appRouter.use('/v1/admin/users', usersRouter);
