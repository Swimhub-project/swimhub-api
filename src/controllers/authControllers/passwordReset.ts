//request password reset
import { Request, Response } from 'express';
import validator from 'validator';
import { ErrorReturn } from '../../types/return.type';
import { prismaClient } from '../../lib/prisma/prismaClient';
import { sendEmail } from '../../services/email';
import { createToken } from '../../utils/functions/createToken';
import {
  verifyEmailText,
  verifyEmailHtml,
} from '../../utils/templates/verifyEmailTemplates';

const { isEmail, isEmpty, escape, normalizeEmail } = validator;

export const requestPasswordReset = async (req: Request, res: Response) => {
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

  //sanitise inputs
  email = escape(email).trim();
  email = normalizeEmail(email, { gmail_remove_dots: false });

  //check if email exists in database
  const user = await prismaClient.user.findUnique({ where: { email: email } });
  if (!user) {
    const error: ErrorReturn = {
      code: 404,
      message: 'User not found',
      params: ['email'],
    };
    res.status(404).json(error);
    return;
  }

  //create token and send email verification to user
  try {
    const tokenData = await createToken(user.id);
    const recipient = user.email;
    const subject = 'Verify your email address';
    const text = verifyEmailText(user.name, user.id, tokenData.token);
    const html = verifyEmailHtml(user.name, user.id, tokenData.token);
    await sendEmail(recipient, subject, text, html);
    res.sendStatus(200);
  } catch (err) {
    const error: ErrorReturn = {
      code: 500,
      message: (err as Error).message,
    };
    res.status(500).json(error);
  }
};
