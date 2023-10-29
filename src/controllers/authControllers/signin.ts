//import packages
import validator from 'validator';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { prismaClient } from '../../lib/prisma/prismaClient';
import { ISession } from '../../types/express-session.type';
import { ErrorReturn } from '../../types/return.type';
import { UserObjectStripped } from '../../types/user.type';

const { isEmail, isEmpty, isStrongPassword, normalizeEmail, escape } =
  validator;

//sign in user controller function
export const signInUser = async (req: Request, res: Response) => {
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
    return;
  }

  //check email
  if (!isEmail(email)) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Invalid email',
      params: ['email'],
    };
    res.status(400).json(error);
    return;
  }

  //check password strength
  if (!isStrongPassword(password)) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Password not strong enough',
      params: ['password'],
    };
    res.status(400).json(error);
    return;
  }

  //sanitise inputs
  email = escape(email).trim();
  email = normalizeEmail(email, { gmail_remove_dots: false });
  password = password.trim();

  //check if email exists in database
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
    return;
  }

  //create session and store in Redis
  try {
    (req.session as ISession).role = userDB.role;
    (req.session as ISession).status = userDB.status;
    (req.session as ISession).clientId = 'abc123';
    (req.session as ISession).email = userDB.email;

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
    return;
  } catch (err) {
    const error: ErrorReturn = {
      code: 500,
      message: (err as Error).message,
    };
    res.status(500).json(error);
    return;
  }
};
