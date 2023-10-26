import { NextFunction, Request, Response } from 'express';
import { redisClient } from '../lib/redis/redisClient';

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.socket.remoteAddress;
  if (ip) {
    const response = await redisClient.multi().incr(ip).expire(ip, 60).exec();
    if ((response[0] as number) > 10) {
      res.status(429).json({ error: { message: 'Too many requests' } });
      return;
    }
  } else throw new Error('ip address not found');
  next();
};

//TODO test function
export const signinRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.socket.remoteAddress;
  const { email } = req.body;
  if (ip) {
    const response = await redisClient.multi().incr(ip).expire(ip, 60).exec();
  } else throw new Error('ip address not found');
  next();
};
