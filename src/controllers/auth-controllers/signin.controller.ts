/*
  "signin user" controller function

  Signs the user in using their email and password.
*/

//import packages
import validator from 'validator';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { prismaClient } from '../../lib/prisma/client.prisma';
import { ISession } from '../../types/express-session';
import { ErrorReturn } from '../../types/error-return';
import { UserObjectStripped } from '../../types/user';
import { createLog } from '../../services/logger.service';

const { isEmail, isEmpty, isStrongPassword, normalizeEmail, escape } =
  validator;

export const signInUser = async (req: Request, res: Response) => {
  //get email and password from body params
  let { email, password } = req.body;

  //check all params exist
  const missingParams = [];
  if (!email) {
    missingParams.push('email');
  }
  if (!password) {
    missingParams.push('password');
  }
  if (missingParams.length > 0) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Missing body parameters',
      params: missingParams,
    };
    res.status(400).json(error);
    createLog('error', req, res, error);
    return;
  }

  //check empty fields
  const emptyFields = [];
  if (isEmpty(email, { ignore_whitespace: true })) {
    emptyFields.push('name');
  }
  if (isEmpty(password, { ignore_whitespace: true })) {
    emptyFields.push('email');
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

  //check email is valid
  if (!isEmail(email)) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Invalid email',
      params: ['email'],
    };
    res.status(400).json(error);
    createLog('error', req, res, error);
    return;
  }

  //check password is valid
  if (!isStrongPassword(password)) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Password not strong enough',
      params: ['password'],
    };
    res.status(400).json(error);
    createLog('error', req, res, error);
    return;
  }

  //sanitise inputs
  email = escape(email).trim();
  email = normalizeEmail(email, { gmail_remove_dots: false });
  password = password.trim();

  //check if user exists in database
  const userDB = await prismaClient.user.findUnique({
    where: { email: email },
  });
  if (!userDB) {
    const error: ErrorReturn = {
      code: 404,
      message: 'User not found',
      params: ['email'],
    };
    res.status(404).json(error);
    createLog('error', req, res, error);
    return;
  }

  //check password is correct
  const match = await bcrypt.compare(password, userDB.password);
  if (!match) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Wrong password',
      params: ['password'],
    };
    res.status(400).json(error);
    createLog('error', req, res, error);
    return;
  }

  //create session and store in Redis
  try {
    (req.session as ISession).role = userDB.role;
    (req.session as ISession).status = userDB.status;
    (req.session as ISession).clientId = 'abc123';
    (req.session as ISession).email = userDB.email;

    //user object to be sent to client
    const user: UserObjectStripped = {
      id: userDB.id,
      name: userDB.name,
      email: userDB.email,
      role: userDB.role,
      status: userDB.status,
      is_teacher: userDB.is_teacher,
      bio: userDB.bio,
      is_bio_public: userDB.is_bio_public,
    };

    res.status(200).json(user);
    createLog('info', req, res);
    return;
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
