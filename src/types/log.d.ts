type LogLevel = 'info' | 'warn' | 'error' | 'critical';
type ReqMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type ResCode = 200 | 201 | 400 | 401 | 403 | 409 | 429 | 500;

/*
  Log Levels
  
  info: POST, PATCH and DELETE request success
  warn: 
  error: 4** code errors
  critical: 500 code errors - send automated email to admins
*/

export interface LogRequestData {
  body?: any;
  headers?: any;
  url: string;
  method: ReqMethod;
  ip?: string;
}

export interface LogData {
  level: LogLevel;
  message?: string;
  timestamp: Date;
  request: LogRequestData;
  responseCode: ResCode;
}
