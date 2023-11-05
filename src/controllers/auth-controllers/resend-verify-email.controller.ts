/*
  "resend email verification" controller function

  If a user tries to verify their email with an expired link, they have
  the option to resend the email verification.
*/

//import packages
import { Request, Response } from 'express';
import validator from 'validator';
import { sendEmail } from '../../services/email.service';
import { createToken } from '../../utils/functions/create-token.function';
import {
  verifyEmailText,
  verifyEmailHtml,
} from '../../utils/templates/verify-email.template';
import { prismaClient } from '../../lib/prisma/client.prisma';
import { ErrorReturn } from '../../types/error-return';

const { isEmpty } = validator;

export const resendEmailVerification = async (req: Request, res: Response) => {
  //get user id from url search params
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
