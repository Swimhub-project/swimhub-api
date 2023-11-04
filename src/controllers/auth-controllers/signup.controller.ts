/*
  "signup user" controller function

  registers a new user, using their chosen name, email and password.
*/

//import packages
import validator from 'validator';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { prismaClient } from '../../lib/prisma/client.prisma';
import { UserRole, UserStatus } from '@prisma/client';
import { sendEmail } from '../../services/email.service';
import { createToken } from '../../utils/functions/create-token.function';
import {
  verifyEmailText,
  verifyEmailHtml,
} from '../../utils/templates/verify-email.template';
import { ErrorReturn } from '../../types/error-return.type';
import { UserObjectStripped } from '../../types/user.type';

const { isEmail, isEmpty, isStrongPassword, normalizeEmail, escape } =
  validator;

export const signUpUser = async (req: Request, res: Response) => {
  //get name, email, password and repeatPassword from body params
  let { name, email, password, repeatPassword } = req.body;

  //check all params exist
  const missingParams = [];
  if (!name) {
    missingParams.push('name');
  }
  if (!email) {
    missingParams.push('email');
  }
  if (!password) {
    missingParams.push('password');
  }
  if (!repeatPassword) {
    missingParams.push('repeat password');
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
  if (isEmpty(name, { ignore_whitespace: true })) {
    emptyFields.push('name');
  }
  if (isEmpty(email, { ignore_whitespace: true })) {
    emptyFields.push('email');
  }
  if (isEmpty(password, { ignore_whitespace: true })) {
    emptyFields.push('password');
  }
  if (isEmpty(repeatPassword, { ignore_whitespace: true })) {
    emptyFields.push('repeat password');
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

  //check email is valid
  if (!isEmail(email)) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Invalid email',
      params: ['email'],
    };
    res.status(400).json(error);
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
    return;
  }

  //check passwords match
  if (password != repeatPassword) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Passwords do not match',
      params: ['password', 'repeatPassword'],
    };
    res.status(400).json(error);
    return;
  }

  //sanitise inputs
  name = escape(name).trim();
  email = escape(email).trim();
  email = normalizeEmail(email, { gmail_remove_dots: false });
  password = password.trim();
  repeatPassword = repeatPassword.trim();

  //check user with email doesn't already exist in database
  const user = await prismaClient.user.findUnique({ where: { email: email } });
  if (user) {
    const error: ErrorReturn = {
      code: 409,
      message: 'User with that email already exists',
      params: ['email'],
    };
    res.status(409).json(error);
    return;
  }

  //hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUserData = {
    name: name,
    email: email,
    password: hashedPassword,
    created_on: new Date(),
    role: 'user' as UserRole,
    status: 'inactive' as UserStatus,
    is_teacher: false,
    bio: '',
    is_bio_public: false,
  };

  //try creating user in database
  try {
    const newUser = await prismaClient.user.create({ data: newUserData });
    if (newUser) {
      //create token and send email verification to user
      try {
        const tokenData = await createToken(newUser.id);
        const recipient = newUser.email;
        const subject = 'Verify your email address';
        const text = verifyEmailText(newUser.name, newUser.id, tokenData.token);
        const html = verifyEmailHtml(newUser.name, newUser.id, tokenData.token);
        await sendEmail(recipient, subject, text, html);
      } catch (err) {
        const error: ErrorReturn = {
          code: 500,
          message: (err as Error).message,
        };
        res.status(500).json(error);
      }
    }
    //user object sent to the client
    const user: UserObjectStripped = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      is_teacher: newUser.is_teacher,
      bio: newUser.bio,
      is_bio_public: newUser.is_bio_public,
    };
    res.status(201).json(user);
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
