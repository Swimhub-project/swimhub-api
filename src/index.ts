//import packages
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { router as authRoutes } from './routes/auth.route';
import { router as userRoutes } from './routes/user.route';
import { router as sessionRoutes } from './routes/session.route';
import { router as entryRoutes } from './routes/entry.route';
import session from './services/session.service';
import { redisClient } from './lib/redis/client.redis';
import { rateLimiter } from './middleware/rate-limiter.middleware';

//initialise express app
export const app = express();

//port and database variables - imported from .env file
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());
app.use(session);
app.use(rateLimiter);

//routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/session', sessionRoutes);
app.use('/entry', entryRoutes);

//currently active environment (development or production), used by email templates
export let activeEnvironment: string;

//start server
app.listen(port, async () => {
  await redisClient.connect(); //opens connection to redis database
  console.log(
    `server running on port ${port}, Is redis client connected? ${redisClient.isOpen}`
  );
  console.log('environment: ', app.get('env'));
  activeEnvironment = app.get('env');
});
