//import packages
import RedisStore from 'connect-redis';
import redis from 'redis';
import 'dotenv/config';

//initialise redis client
export const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

//initialise redis store
export const redisStore = new RedisStore({
  client: redisClient,
});
