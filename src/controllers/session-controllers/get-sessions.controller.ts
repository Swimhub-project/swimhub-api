/*
  "get sessions" controller function

  Gets all the active user sessions. 
*/

//import packages
import { Request, Response } from 'express';
import { ErrorReturn } from '../../types/error-return';
import { createLog } from '../../services/logger.service';

export const getSessions = async (req: Request, res: Response) => {
  //check session store exists
  if (!req.sessionStore) {
    const error: ErrorReturn = {
      code: 404,
      message: 'Session store not found.',
    };
    res.status(404).json(error);
    await createLog('error', req, res, error);
    return;
  }
  //get all active user sessions
  req.sessionStore.all!((err, sessions) => {
    if (err) {
      const error: ErrorReturn = {
        code: 500,
        message: (err as Error).message,
      };
      res.json(error);
      createLog('critical', req, res, error);
      return;
    }
    if (!sessions?.length) {
      const error: ErrorReturn = {
        code: 404,
        message: 'No sessions found.',
      };
      res.status(404).json(error);
      createLog('error', req, res, error);
      return;
    }
    res.status(200).json(sessions);
  });
};
