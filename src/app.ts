//import packages
import express from 'express';
import cors from 'cors';
import { router as authRoutes } from './routes/auth.route';
import { router as userRoutes } from './routes/user.route';
import { router as sessionRoutes } from './routes/session.route';
import { router as entryRoutes } from './routes/entry.route';
import session from './services/session.service';
import { rateLimiter } from './middleware/rate-limiter.middleware';

//initialise express app
export const app = express();

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
