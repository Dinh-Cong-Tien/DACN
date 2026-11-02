import cors from 'cors';
import { env } from './env';

export const corsMiddleware = cors({
  origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
});
