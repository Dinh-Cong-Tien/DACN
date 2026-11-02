import express from 'express';
import { corsMiddleware } from '../config/cors';
import { securityMiddleware } from '../config/security';
import { appRouter } from './routes';
import { errorHandler } from '../middleware/error-handler';
import { notFoundHandler } from '../middleware/not-found';
import { globalRateLimit } from '../middleware/rate-limit';

export const app = express();

// Sau reverse proxy (Vite dev / Nginx) lấy IP thật từ X-Forwarded-For của proxy cục bộ
app.set('trust proxy', 'loopback');
app.disable('x-powered-by');

app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use('/api', globalRateLimit);

app.use('/api', appRouter);

app.use(notFoundHandler);
app.use(errorHandler);
