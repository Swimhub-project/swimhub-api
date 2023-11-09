/*
  "automated logging" service

  Creates a log and stores it in MongoDB database. 
*/

import { Log } from '../lib/mongoose/log-model.mongoose';
import { ErrorReturn } from '../types/error-return';
import { LogData, LogLevel, ReqMethod, ResCode } from '../types/log';
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

  const data: LogData = {
    level: level,
    message: logMessage,
    timestamp: new Date(),
    responseCode: res.statusCode as ResCode,
    request: {
      body: req.body,
      headers: req.headers,
      url: req.originalUrl,
      method: req.method as ReqMethod,
      ip: req.socket.remoteAddress,
    },
  };
  const log = await Log.create(data);

  //TODO if log is critical, email admins
  return log;
};
