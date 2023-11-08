/*
  "get logs" controller function

  Gets all logs from the database that match the search criteria.  
*/

//import packages
import { Request, Response } from 'express';
import { Log } from '../../lib/mongoose/log-model.mongoose';

export const getLogs = async (req: Request, res: Response) => {
  const logs = await Log.find();
  res.status(200).json(logs);
};
