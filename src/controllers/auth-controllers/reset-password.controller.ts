/*
  "reset-password" controller function

  If the user has forgotten their password, they input their
  email address and are sent an email with a verification link.

  This takes them to a new page where they can input their new 
  password. 
*/

//import packages
import { Request, Response } from 'express';
import validator from 'validator';
import { ErrorReturn } from '../../types/error-return';
import { prismaClient } from '../../lib/prisma/client.prisma';
import { sendEmail } from '../../services/email.service';
import { createToken } from '../../utils/functions/create-token.function';
import { createLog } from '../../services/logger.service';

const { isEmail, isEmpty, escape, normalizeEmail } = validator;

export const requestPasswordReset = async (req: Request, res: Response) => {
  //get email from body params
  let { email } = req.body;

  //check all params exist
  const missingParams = [];
  if (!email) {
    missingParams.push('email');
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

  //sanitise inputs
  email = escape(email).trim();
  email = normalizeEmail(email, { gmail_remove_dots: false });

  //check if user exists in database
  const user = await prismaClient.user.findUnique({ where: { email: email } });
  if (!user) {
    const error: ErrorReturn = {
      code: 404,
      message: 'User not found',
      params: ['email'],
    };
    res.status(404).json(error);
    createLog('error', req, res, error);
    return;
  }

  //create token and send password reset link to user
  try {
    const tokenData = await createToken(user.id);
    const recipient = user.email;
    const subject = 'Reset your password';
    const text = ''; //TODO add email template for password reset
    const html = '';
    await sendEmail(recipient, subject, text, html);
    res.sendStatus(200);
    createLog('info', req, res);
  } catch (err) {
    const error: ErrorReturn = {
      code: 500,
      message: (err as Error).message,
    };
    res.status(500).json(error);
    createLog('critical', req, res, error);
  }
};
