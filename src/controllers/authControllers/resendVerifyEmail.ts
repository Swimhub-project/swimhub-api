//resend email verification
import { Request, Response } from 'express';
import validator from 'validator';
import { sendEmail } from '../../services/email';
import { createToken } from '../../utils/functions/createToken';
import {
  verifyEmailText,
  verifyEmailHtml,
} from '../../utils/templates/verifyEmailTemplates';
import { prismaClient } from '../../lib/prisma/prismaClient';
import { ErrorReturn } from '../../types/return.type';

const { isEmail, isEmpty, isStrongPassword, normalizeEmail, escape } =
  validator;

//use user id from url search params
export const resendEmailVerification = async (req: Request, res: Response) => {
  let { id } = req.body;

  //check for missing params
  let missingParams = [];
  if (!id) {
    missingParams.push('id');
  }
  if (missingParams.length > 0) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Missing body parameters',
      params: missingParams,
    };
    res.status(400).json({ error });
    return;
  }

  //check empty fields
  const emptyFields = [];
  if (isEmpty(id, { ignore_whitespace: true })) {
    emptyFields.push('id');
  }

  if (emptyFields.length > 0) {
    const error: ErrorReturn = {
      code: 400,
      message: 'Empty input fields',
      params: emptyFields,
    };
    res.status(400).json({ error });
    return;
  }

  //search for user in database
  const user = await prismaClient.user.findUnique({ where: { id: id } });
  if (!user) {
    const error: ErrorReturn = {
      code: 404,
      message: 'User not found',
      params: ['email'],
    };
    res.status(404).json({ error });
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

    res.status(409).json({ error });
    return;
  }

  //create token and send email verification
  try {
    const token = await createToken(user.id);
    const recipient = user.email;
    const subject = 'Verify your email address';
    const text = verifyEmailText(user.name, user.id, token.token);
    const html = verifyEmailHtml(user.name, user.id, token.token);
    await sendEmail(recipient, subject, text, html);
    res.sendStatus(200);
  } catch (err) {
    const error: ErrorReturn = {
      code: 500,
      message: (err as Error).message,
    };
    res.status(500).json({ error });
    return;
  }
};
