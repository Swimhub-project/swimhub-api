//import packages
import { app } from './app';
import { redisClient } from './lib/redis/client.redis';
import mongoose from 'mongoose';

//port and database variables - imported from .env file
const port = 5000;

//currently active environment (development or production), used by email templates
export let activeEnvironment: string;

const mongodb = process.env.MONGO_DB || 'mongodb://localhost:8080';

//start server
app.listen(port, async () => {
  await redisClient.connect(); //opens connection to redis database
  await mongoose.connect(mongodb, {
    dbName: 'swimhub_logs',
  });
  console.log(
    `server running on port ${port}, Is redis client connected? ${redisClient.isOpen}`
  );
  console.log('environment: ', app.get('env'));
  activeEnvironment = app.get('env');
});
