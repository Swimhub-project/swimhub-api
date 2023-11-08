/*
  "get entries" controller function

  Gets all entries from the database that match the search criteria.  
*/

//import packages
import { Request, Response } from 'express';
import { EntrySearchData } from '../../types/entry';
import {
  EntryStroke,
  EntryType,
  Prisma,
  EntryStage,
  ContentStatus,
} from '@prisma/client';
import validator from 'validator';
import {
  isContentStatus,
  isEntryStage,
  isEntryStroke,
  isEntryType,
  isNumber,
} from '../../utils/functions/validate-input.function';
import { ErrorReturn } from '../../types/error-return';
import { prismaClient } from '../../lib/prisma/client.prisma';
import { createLog } from '../../services/logger.service';

const { isEmpty, escape } = validator;

export const getEntries = async (req: Request, res: Response) => {
  //get search params from url
  let { author, text, type, stroke, stage, status, page, limit } = req.query;

  //object used to store sanitised search params
  const searchData: EntrySearchData = {};

  /*
    validate and sanitise search params. 
    If param passes all tests it goes into the searchData object
  */

  if (author) {
    author = escape(author as string).trim();
    if (!isEmpty(author, { ignore_whitespace: true })) {
      searchData.author = {
        contains: author,
        mode: Prisma.QueryMode.insensitive,
      };
    }
  }

  //text can be found in either the title, body or teaching_points fields
  if (text) {
    text = escape(text as string).trim();
    if (!isEmpty(text, { ignore_whitespace: true })) {
      searchData.OR = [
        { title: { contains: text } },
        { body: { contains: text } },
        { teaching_points: { has: text } },
      ];
    }
  }

  if (type) {
    if (!isEntryType(type as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "type" search parameter.',
        params: ['type'],
      };
      res.status(400).json(error);
      return;
    } else {
      type = escape(type as string).trim();
      if (!isEmpty(type, { ignore_whitespace: true })) {
        searchData.type = type as EntryType;
      }
    }
  }

  if (stroke) {
    if (!isEntryStroke(stroke as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "stroke" search parameter.',
        params: ['stroke'],
      };
      res.status(400).json(error);
      return;
    } else {
      stroke = escape(stroke as string).trim();
      if (!isEmpty(stroke, { ignore_whitespace: true })) {
        searchData.stroke = stroke as EntryStroke;
      }
    }
  }

  if (stage) {
    if (!isEntryStage(stage as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "stage" search parameter.',
        params: ['stage'],
      };
      res.status(400).json(error);
      return;
    } else {
      stage = escape(stage as string).trim();
      if (!isEmpty(stage, { ignore_whitespace: true })) {
        searchData.stage = { has: stage as EntryStage };
      }
    }
  }

  if (status) {
    if (!isContentStatus(status as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "status" search parameter.',
        params: ['status'],
      };
      res.status(400).json(error);
      return;
    } else {
      status = escape(status as string).trim();
      if (!isEmpty(status, { ignore_whitespace: true })) {
        searchData.status = status as ContentStatus;
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
      return;
    } else {
      if (parseInt(escape(limit as string).trim()) > 10) {
        limitNum = 10;
      } else {
        limitNum = parseInt(escape(limit as string).trim());
      }
    }
  }

  //try fetching entries from database
  try {
    //get number of entries that match search params
    const entryCount = await prismaClient.entry.count({
      where: searchData,
    });

    //fetch users if count is higher than 0
    if (entryCount == 0) {
      const error: ErrorReturn = {
        code: 404,
        message: 'No matching entries found.',
      };
      res.status(404).json(error);
      await createLog('info', req, res, error);
      return;
    } else {
      try {
        const entries = await prismaClient.entry.findMany({
          skip: pageNum * limitNum - limitNum,
          take: limitNum,
          where: searchData,
        });

        const result = {
          currentPage: pageNum,
          totalPages: Math.ceil(entryCount / limitNum),
          numberOfResults: entries.length,
          totalNumberOfResults: entryCount,
          entries: entries,
        };
        res.status(200).json(result);
        await createLog('info', req, res);
        return;
      } catch (err) {
        const error: ErrorReturn = {
          code: 500,
          message: (err as Error).message,
        };
        res.status(500).json(error);
        return;
      }
    }
  } catch (err) {
    const error: ErrorReturn = {
      code: 500,
      message: (err as Error).message,
    };
    res.status(500).json(error);
    return;
  }
};
