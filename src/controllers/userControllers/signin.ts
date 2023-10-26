//import packages
import validator from 'validator';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { prismaClient } from '../../lib/prisma/prismaClient';
import { ISession } from '../../types/express-session.type';

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
    res.status(400).json({
      error: { message: 'missing body parameters', fields: missingParams },
    });
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
    res.status(400).json({
      error: { message: 'Please fill in all fields', fields: emptyFields },
    });
    return;
  }

  //check email
  if (!isEmail(email)) {
    res.status(400).json({
      error: { message: 'Please enter a valid email' },
      fields: ['email'],
    });
    return;
  }

  //check password strength
  if (!isStrongPassword(password)) {
    res.status(400).json({
      error: {
        message: 'Password is not strong enough',
        fields: ['password'],
      },
    });
    return;
  }

  //sanitise inputs
  email = escape(email).trim();
  email = normalizeEmail(email, { gmail_remove_dots: false });
  password = password.trim();

  //check if email exists in database
  const user = await prismaClient.user.findUnique({ where: { email: email } });
  if (!user) {
    res
      .status(404)
      .json({ error: { message: 'user not found', fields: ['email'] } });
    return;
  }

  //check password is correct
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res
      .status(401)
      .json({ error: { message: 'wrong password', fields: ['password'] } });
    return;
  }

  //create session and store in Redis
  try {
    (req.session as ISession).role = user.role;
    (req.session as ISession).status = user.status;
    (req.session as ISession).clientId = 'abc123';

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_on: user.created_on,
      is_teacher: user.is_teacher,
      bio: user.bio,
      is_bio_public: user.is_bio_public,
    };

    res.status(200).json({ message: 'signin successful', user: userData });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: (error as Error).message, fields: [] } });
    return;
  }
};
