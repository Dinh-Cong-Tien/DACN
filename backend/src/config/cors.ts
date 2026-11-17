import cors from 'cors';
import { env } from './env';

const frontendUrl = env.FRONTEND_URL?.replace(/\/+$/, '');

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === frontendUrl ||
      origin === 'http://localhost:3000' ||
      origin === 'http://127.0.0.1:3000' ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
});
