type LogLevel = 'info' | 'warn' | 'error' | 'fatal';
type ReqMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type ResCode = 200 | 201 | 400 | 401 | 403 | 409 | 429 | 500;

export interface IMetadata {
  url: string;
  method: ReqMethod;
  responseCode: ResCode;
  ip?: string;
}

export interface ILog {
  level: LogLevel;
  message?: string;
  timestamp: Date;
  metadata: IMetadata;
  reqBody?: any;
}
