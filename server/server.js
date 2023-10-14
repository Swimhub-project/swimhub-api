//import packages
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { router as userRoutes } from './routes/userRoutes.js';
import session from './services/session.js';
import { redisClient } from './lib/redis/redisClient.js';
import { sendEmail } from './services/email.js';

//initialise express app
const app = express();

//port and database variables - imported from .env file
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());
app.use(session);

//routes
app.use('/api/user', userRoutes);

//start server
app.listen(port, async () => {
  await redisClient.connect(); //opens connection to redis database
  console.log(`server running on port ${port}, ${redisClient.isOpen}`);
});
