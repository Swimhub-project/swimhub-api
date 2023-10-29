//delete session by session Id

import { Request, Response } from 'express';
import { ErrorReturn } from '../../types/return.type';

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
    return;
  }

  if (!req.sessionStore) {
    const error: ErrorReturn = {
      code: 404,
      message: 'Session store not found.',
    };
    res.status(404).json(error);
    return;
  }

  req.sessionStore.destroy(sessionId, (err) => {
    res.sendStatus(200);
  });
};
