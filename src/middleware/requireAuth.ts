import { NextFunction, Request, Response } from 'express';
import { ISession } from '../types/express-session.type';

interface ResError extends Error {
  statusCode?: number;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session || !(req.session as ISession).clientId) {
    const err = new Error('Unauthenticated user') as ResError;
    err.statusCode = 401;
    next(err);
  } else {
    next();
  }
};
