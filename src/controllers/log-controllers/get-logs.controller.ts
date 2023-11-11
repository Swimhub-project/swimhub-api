/*
  "get logs" controller function

  Gets all logs from the database that match the search criteria.  
*/

//import packages
import { Request, Response } from 'express';
import { Log } from '../../lib/mongoose/log-model.mongoose';
import { LogLevel, LogSearchData, ReqMethod, ResCode } from '../../types/log';
import validator from 'validator';
import {
  isEndpoint,
  isLogLevel,
  isNumber,
  isReqMethod,
  isResCode,
} from '../../utils/functions/validate-input.function';
import { createLog } from '../../services/logger.service';
import { ErrorReturn } from '../../types/error-return';

const { isEmpty, isIP, isDate, escape } = validator;

export const getLogs = async (req: Request, res: Response) => {
  //get search params from url
  let { level, method, before, after, code, endpoint, ip, page, limit } =
    req.query;

  //object used to store sanitised search params
  const searchData: LogSearchData = {};

  /*
    validate and sanitise search params. 
    If param passes all tests it goes into the searchData object
  */
  if (level) {
    if (!isLogLevel(level as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "level" search parameter.',
        params: ['level'],
      };
      res.status(400).json(error);
      createLog('error', req, res, error);
      return;
    } else {
      level = escape(level as string).trim();
      if (!isEmpty(level, { ignore_whitespace: true })) {
        searchData.level = level as LogLevel;
      }
    }
  }

  if (method) {
    if (!isReqMethod(method as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "method" search parameter.',
        params: ['method'],
      };
      res.status(400).json(error);
      createLog('error', req, res, error);
      return;
    } else {
      method = escape(method as string).trim();
      if (!isEmpty(method, { ignore_whitespace: true })) {
        if (searchData.request) {
          searchData.request.method = method as ReqMethod;
        } else {
          searchData.request = { method: method.toUpperCase() as ReqMethod };
        }
      }
    }
  }

  if (before) {
    if (!isDate(before as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "before" search parameter.',
        params: ['before'],
      };
      res.status(400).json(error);
      createLog('error', req, res, error);
      return;
    } else {
      before = escape(before as string).trim();
      if (!isEmpty(before, { ignore_whitespace: true })) {
        if (searchData.timestamp) {
          searchData.timestamp.$lte = new Date(before as string);
        } else {
          searchData.timestamp = { $lte: new Date(before as string) };
        }
      }
    }
  }

  if (after) {
    if (!isDate(after as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "after" search parameter.',
        params: ['after'],
      };
      res.status(400).json(error);
      createLog('error', req, res, error);
      return;
    } else {
      after = escape(after as string).trim();
      if (!isEmpty(after, { ignore_whitespace: true })) {
        if (searchData.timestamp) {
          searchData.timestamp.$gte = new Date(after as string);
        } else {
          searchData.timestamp = { $gte: new Date(after as string) };
        }
      }
    }
  }

  if (code) {
    if (!isResCode(code as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "code" search parameter.',
        params: ['code'],
      };
      res.status(400).json(error);
      createLog('error', req, res, error);
      return;
    } else {
      code = escape(code as string).trim();
      if (!isEmpty(code, { ignore_whitespace: true })) {
        searchData.code = parseInt(code) as ResCode;
      }
    }
  }

  if (endpoint) {
    if (!isEndpoint(endpoint as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "endpoint" search parameter.',
        params: ['endpoint'],
      };
      res.status(400).json(error);
      createLog('error', req, res, error);
      return;
    } else {
      endpoint = escape(endpoint as string).trim();
      if (!isEmpty(endpoint, { ignore_whitespace: true })) {
        if (searchData.request) {
          searchData.request.url = `/${endpoint}/i`;
        } else {
          searchData.request = { url: `/${endpoint}/i` };
        }
      }
    }
  }

  if (ip) {
    if (!isIP(ip as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "ip" search parameter.',
        params: ['ip'],
      };
      res.status(400).json(error);
      await createLog('error', req, res, error);
      return;
    } else {
      ip = escape(ip as string).trim();
      if (!isEmpty(ip, { ignore_whitespace: true })) {
        if (searchData.request) {
          searchData.request.ip = ip;
        } else {
          searchData.request = { ip: ip };
        }
      }
    }
  }

  //validate and set the correct page number for page pagination
  let pageNum: number = 1;
  if (page) {
    if (!isNumber(page as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "page" search parameter.',
        params: ['page'],
      };
      res.status(400).json(error);
      createLog('error', req, res, error);
      return;
    } else {
      pageNum = parseInt(escape(page as string).trim());
    }
  }

  //validate and set the correct limit for page pagination
  let limitNum: number = 10;
  if (limit) {
    if (!isNumber(limit as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "limit" search parameter.',
        params: ['limit'],
      };
      res.status(400).json(error);
      createLog('error', req, res, error);
      return;
    } else {
      if (parseInt(escape(limit as string).trim()) > 10) {
        limitNum = 10;
      } else {
        limitNum = parseInt(escape(limit as string).trim());
      }
    }
  }

  //fetch logs from database
  try {
    const options = {
      page: pageNum,
      limit: limitNum,
    };

    const logs = await Log.paginate(searchData, options);

    const result = {
      currentPage: pageNum,
      totalPages: logs.totalPages,
      numberOfResults: logs.docs.length,
      totalNumberOfResults: logs.totalDocs,
      logs: logs.docs,
    };
    res.status(200).json(result);
    return;
  } catch (err) {
    const error: ErrorReturn = {
      code: 500,
      message: (err as Error).message,
    };
    createLog('critical', req, res, error);
    return;
  }
};
