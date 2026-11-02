import express from 'express';
import { corsMiddleware } from '../config/cors';
import { securityMiddleware } from '../config/security';
import { appRouter } from './routes';
import { errorHandler } from '../middleware/error-handler';
import { notFoundHandler } from '../middleware/not-found';

export const app = express();

app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '5mb' }));

app.use('/api', appRouter);

app.use(notFoundHandler);
app.use(errorHandler);
