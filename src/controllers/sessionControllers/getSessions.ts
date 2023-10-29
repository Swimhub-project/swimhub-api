//get all active sessions
import { Request, Response } from 'express';
import { ErrorReturn } from '../../types/return.type';

export const getSessions = async (req: Request, res: Response) => {
  if (!req.sessionStore) {
    const error: ErrorReturn = {
      code: 404,
      message: 'Session store not found.',
    };
    res.status(404).json(error);
    return;
  }
  req.sessionStore.all!((err, sessions) => {
    if (err) {
      const error: ErrorReturn = {
        code: 500,
        message: (err as Error).message,
      };
      res.json(error);
      return;
    }
    if (!sessions?.length) {
      const error: ErrorReturn = {
        code: 404,
        message: 'No sessions found.',
      };
      res.status(404).json(error);
      return;
    }
    res.status(200).json(sessions);
  });
};
