/*
  "delete entry" controller function

  Deletes an existing entry from the database by the entryId property. 
*/

//import packages
import { Request, Response } from 'express';
import { ErrorReturn } from '../../types/error-return';
import validator from 'validator';
import { prismaClient } from '../../lib/prisma/client.prisma';
import { createLog } from '../../services/logger.service';

const { escape, isEmpty } = validator;

export const deleteEntry = async (req: Request, res: Response) => {
  let id = req.params.id;

  //check ID param exists
  if (!id || isEmpty(id, { ignore_whitespace: true })) {
    const error: ErrorReturn = {
      code: 400,
      message: 'no ID given',
      params: ['id'],
    };
    res.status(400).json(error);
    return;
  }

  //sanitise ID param
  id = escape(id).trim();

  //try deleting entry
  try {
    const deletedEntry = await prismaClient.entry.delete({ where: { id: id } });
    res.status(200).json(deletedEntry);
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
