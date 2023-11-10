/*
  "delete session" controller function

  Deletes an existing session from the database by the sessionId property. 
*/

//import packages
import { Request, Response } from 'express';
import { ErrorReturn } from '../../types/error-return';
import { createLog } from '../../services/logger.service';

export const deleteSession = async (req: Request, res: Response) => {
  //grab session id from URL
  const sessionId = req.params.id;

  //check all params exist
  const missingParams = [];
  if (!sessionId) {
    missingParams.push('userId');
  }
  if (missingParams.length > 0) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Missing url parameters',
      params: missingParams,
    };
    res.status(400).json(error);
    createLog('error', req, res, error);
    return;
  }

  //checks the session storage exists
  if (!req.sessionStore) {
    const error: ErrorReturn = {
      code: 404,
      message: 'Session store not found.',
    };
    res.status(404).json(error);
    createLog('error', req, res, error);
    return;
  }

  //deletes the selected session
  req.sessionStore.destroy(sessionId, (err) => {
    res.sendStatus(200);
    createLog('info', req, res);
  });
};
