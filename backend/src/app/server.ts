import { app } from './app';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { attachRealtime } from '../lib/realtime';

const server = app.listen(env.PORT, () => {
  logger.info(`Server is running on http://localhost:${env.PORT}`);
});
attachRealtime(server);
