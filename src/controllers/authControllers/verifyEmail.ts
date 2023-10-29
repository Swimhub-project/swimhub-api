//import packages
import validator from 'validator';
import { Request, Response } from 'express';
import { prismaClient } from '../../lib/prisma/prismaClient';
import { ISession } from '../../types/express-session.type';
import { ErrorReturn } from '../../types/return.type';

const { isEmail, isEmpty, isStrongPassword, normalizeEmail, escape } =
  validator;

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
    return;
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: (error as Error).message, fields: [] } });
    return;
  }
};
