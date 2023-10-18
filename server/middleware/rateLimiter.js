import { redisClient } from '../lib/redis/redisClient.js';

export const rateLimiter = async (req, res, next) => {
  const ip = req.connection.remoteAddress;
  const response = await redisClient.multi().incr(ip).expire(ip, 60).exec();
  console.log(response[0]);
  if (response[0] > 10) {
    res.status(429).json({ error: { message: 'Too many requests' } });
    return;
  }
  next();
};

export const signinRateLimiter = async (req, res, next) => {
  const ip = req.connection.remoteAddress;
  const { email } = req.body;
  const response = await redisClient.multi().incr(ip).expire(ip, 60).exec();
};
