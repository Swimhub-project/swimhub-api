/*
  "automated logging" service

  Creates a log and stores it in MongoDB database. 
*/

import { Log } from '../lib/mongoose/log-model.mongoose';
import { ErrorReturn } from '../types/error-return';
import { ILog, LogLevel, ReqMethod, ResCode } from '../types/log';
import { Request, Response } from 'express';

export const createLog = async (
  level: LogLevel,
  req: Request,
  res: Response,
  error?: ErrorReturn
) => {
  //if there's an error, use the error message. Else, use generic success message
  let logMessage: string | undefined;
  if (res.statusCode == 200 || res.statusCode == 201) {
    logMessage = `${req.method} request to ${req.originalUrl} successful.`;
  } else {
    logMessage = `ERROR: ${error?.message}`;
  }

  const data: ILog = {
    level: level,
    message: logMessage,
    timestamp: new Date(),
    reqBody: req.body,
    metadata: {
      url: req.originalUrl,
      method: req.method as ReqMethod,
      responseCode: res.statusCode as ResCode,
      ip: req.socket.remoteAddress,
    },
  };
  const log = await Log.create(data);

  //TODO if log is error or fatal, email admins
  return log;
};
