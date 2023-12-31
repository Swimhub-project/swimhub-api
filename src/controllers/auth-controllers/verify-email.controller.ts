/*
  "verify email" controller function

  When a new user clicks their verification link, 
  the token and user are checked then the user's status is changed
  to "active" - this allows them access to account functions. 
*/

//import packages
import { Request, Response } from 'express';
import { prismaClient } from '../../lib/prisma/client.prisma';
import { ISession } from '../../types/express-session';
import { ErrorReturn } from '../../types/error-return';
import { createLog } from '../../services/logger.service';

//verify email
export const verifyEmail = async (req: Request, res: Response) => {
  //grab userId and token params from url
  const userId = req.params.id;
  const token = req.params.token;

  //check all params exist
  const missingParams = [];
  if (!userId) {
    missingParams.push('userId');
  }
  if (!token) {
    missingParams.push('token');
  }
  if (missingParams.length > 0) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Missing url parameters',
      params: missingParams,
    };
    res.status(400).json(error);
    createLog('error', req, res, error);
    return;
  }

  //search for auth token in database
  const userToken = await prismaClient.authToken.findUnique({
    where: { user_id: userId },
  });
  if (!userToken) {
    const error: ErrorReturn = {
      code: 404,
      message: 'Token not found',
      params: ['token'],
    };
    res.status(404).json(error);
    createLog('error', req, res, error);
    return;
  }

  //check expire date of token
  const today = new Date();
  if (userToken.expires_on < today) {
    const error: ErrorReturn = {
      code: 401,
      message: 'Token has expired',
      params: ['token'],
    };
    res.status(401).json(error);
    createLog('error', req, res, error);
    return;
  }

  //search for user in database
  const user = await prismaClient.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error: ErrorReturn = {
      code: 404,
      message: 'User not found',
      params: ['userId'],
    };
    res.status(404).json(error);
    createLog('error', req, res, error);
    return;
  }

  //check user status
  if (user.status != 'inactive') {
    //delete token from database
    await prismaClient.authToken.delete({ where: { user_id: user.id } });
    const error: ErrorReturn = {
      code: 409,
      message: 'User email already verified',
      params: ['userId'],
    };

    res.status(409).json(error);
    createLog('error', req, res, error);
    return;
  }
  //TODO talk to Steph about what to do once user is verified
  //update user status and sign user in
  try {
    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: { status: 'active' },
    });

    //delete token from database
    await prismaClient.authToken.delete({ where: { user_id: updatedUser.id } });

    (req.session as ISession).role = user.role;
    (req.session as ISession).status = user.status;
    (req.session as ISession).clientId = 'abc123';
    (req.session as ISession).email = user.email;

    res.sendStatus(200);
    createLog('info', req, res);
    return;
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: (error as Error).message, fields: [] } });
    // await createLog('critical', req, res, error);
    return;
  }
};
