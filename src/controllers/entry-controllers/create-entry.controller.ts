/*
  "create entry" controller function

  Creates a new entry in the database linked to the user who created it. 
*/

//import packages
import { Request, Response } from 'express';
import { ErrorReturn } from '../../types/error-return';
import { createLog } from '../../services/logger.service';
import validator from 'validator';
import { prismaClient } from '../../lib/prisma/client.prisma';
import {
  isEntryStage,
  isEntryStroke,
  isEntryType,
} from '../../utils/functions/validate-input.function';
import {
  ContentStatus,
  EntryStage,
  EntryStroke,
  EntryType,
} from '@prisma/client';

const { isEmpty, escape } = validator;

export const createEntry = async (req: Request, res: Response) => {
  let { userId, title, body, type, stroke, stage, teachingPoints } = req.body;

  //check all body params are present
  const missingFields = [];
  if (!userId) {
    missingFields.push('userId');
  }
  if (!title) {
    missingFields.push('title');
  }
  if (!body) {
    missingFields.push('body');
  }
  if (!type) {
    missingFields.push('type');
  }
  if (!stroke) {
    missingFields.push('stroke');
  }
  if (!stage) {
    missingFields.push('stage');
  }
  if (!teachingPoints) {
    missingFields.push('teachingPoints');
  }
  if (missingFields.length > 0) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Missing body parameters',
      params: missingFields,
    };
    res.status(400).json(error);
    createLog('error', req, res, error);
    return;
  }

  //check empty fields
  const emptyFields = [];
  if (isEmpty(userId, { ignore_whitespace: true })) {
    emptyFields.push('userId');
  }
  if (isEmpty(title, { ignore_whitespace: true })) {
    emptyFields.push('title');
  }
  if (isEmpty(body, { ignore_whitespace: true })) {
    emptyFields.push('body');
  }
  if (isEmpty(type, { ignore_whitespace: true })) {
    emptyFields.push('type');
  }
  if (isEmpty(stroke, { ignore_whitespace: true })) {
    emptyFields.push('stroke');
  }
  if (stage.length < 1) {
    emptyFields.push('stage');
  }
  if (teachingPoints.length < 1) {
    emptyFields.push('teachingPoints');
  }
  if (emptyFields.length > 0) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Empty input fields',
      params: emptyFields,
    };
    res.status(400).json(error);
    createLog('error', req, res, error);
    return;
  }

  //check userId exists
  userId = escape(userId).trim();
  const user = await prismaClient.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error: ErrorReturn = {
      code: 404,
      message: 'No user found',
    };
    res.status(404).json(error);
    createLog('error', req, res, error);
    return;
  }
  //validate and sanitise inputs - put sanitised inputs into data object
  if (!isEntryType(type)) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Invalid Entry Type',
      params: ['type'],
    };
    res.status(400).json(error);
    createLog('error', req, res, error);
  }

  if (!isEntryStroke(stroke)) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Invalid Entry Stroke',
      params: ['stroke'],
    };
    res.status(400).json(error);
    createLog('error', req, res, error);
  }
  stage.forEach((stage: string, index: number) => {
    if (!isEntryStage(stage)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid Entry Stage',
        params: [`stage[${index}]`],
      };
      res.status(400).json(error);
      createLog('error', req, res, error);
    }
  });

  const entryData = {
    user_id: userId,
    title: escape(title).trim(),
    body: escape(body).trim(),
    author: user?.user_name || 'anomalous',
    type: type as EntryType,
    stage: stage as EntryStage[],
    teaching_points: teachingPoints,
    stroke: stroke as EntryStroke,
    status: 'public' as ContentStatus,
    created_on: new Date(),
  };

  try {
    const entry = await prismaClient.entry.create({ data: entryData });
    res.status(200).json(entry);
    createLog('info', req, res);
  } catch (err) {
    const error: ErrorReturn = {
      code: 500,
      message: (err as Error).message,
    };
    res.status(500).json(error);
    createLog('critical', req, res, error);
    return;
  }
};
