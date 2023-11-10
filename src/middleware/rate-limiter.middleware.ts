/*
  "rate limiter" middleware

  All endpoints are rate limited to 10 requests per IP address per 60 seconds.
  If the limit is reached, any subsequent requests will return a 429 ("too many requests") error.  

  the signin user endpoint is rate limited to 3 requests per email. 
  If the limit is reached, the account status will be changed to "locked" and cannot be unlocked
  until the user has re-verified their email and changed their password. 
*/

//import packages
import { NextFunction, Request, Response } from 'express';
import { redisClient } from '../lib/redis/client.redis';
import { createLog } from '../services/logger.service';
import { ErrorReturn } from '../types/error-return';

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //get IP address of device making the request
  const ip = req.socket.remoteAddress;
  if (ip) {
    //update total number of request attempts and check if the limit has been reached
    const response = await redisClient.multi().incr(ip).expire(ip, 60).exec();
    if ((response[0] as number) > 100) {
      //TODO change limit to 10 for production
      const error: ErrorReturn = {
        code: 429,
        message: 'Too many requests',
      };
      res.status(429).json(error);
      // createLog('error', req, res, error);
      return;
    }
  } else throw new Error('ip address not found');
  next();
};

export const signinRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.socket.remoteAddress;
  const { email } = req.body;
  if (ip) {
    const response = await redisClient.multi().incr(ip).expire(ip, 60).exec();
    //TODO finish signin rate limit function
  } else throw new Error('ip address not found');
  next();
};
