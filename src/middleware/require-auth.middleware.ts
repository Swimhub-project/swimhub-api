/*
  "require user authentication" middleware

  Runs before allowing access to any protected routes. 
  Checks both for a valid session as well as the user's current role and status.  
*/

//import packages
import { NextFunction, Request, Response } from 'express';
import { ISession } from '../types/express-session';
import { createLog } from '../services/logger.service';
import { ErrorReturn } from '../types/error-return';

interface ResError extends Error {
  statusCode?: number;
}

//TODO add check for status and role - return 403 error if invalid
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session || !(req.session as ISession).clientId) {
    const err = new Error('Unauthenticated user') as ResError;
    err.statusCode = 401;
    const error: ErrorReturn = {
      code: 401,
      message: 'No valid session found',
    };
    // createLog('error', req, res, error);
    next(err);
  } else {
    next();
  }
};
