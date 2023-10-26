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
    res.status(400).json({
      error: { message: 'missing body parameters', fields: missingParams },
    });
    return;
  }

  //check empty fields
  const emptyFields = [];
  if (isEmpty(id, { ignore_whitespace: true })) {
    emptyFields.push('id');
  }

  if (emptyFields.length > 0) {
    res.status(400).json({
      error: { message: 'Please fill in all fields', fields: emptyFields },
    });
    return;
  }

  //search for user in database
  const user = await prismaClient.user.findUnique({ where: { id: id } });
  if (!user) {
    res.status(404).json({
      error: { message: 'user not found' },
      fields: ['id'],
    });
    return;
  }

  //check user status
  if (user.status != 'inactive') {
    res.status(500).json({
      error: { message: 'user already verified' },
      fields: [],
    });
  }

  //create token and send email verification
  try {
    const token = await createToken(user.id);
    const recipient = user.email;
    const subject = 'Verify your email address';
    const text = verifyEmailText(user.name, user.id, token.token);
    const html = verifyEmailHtml(user.name, user.id, token.token);
    await sendEmail(recipient, subject, text, html);
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: (error as Error).message, fields: [] } });
  }
};
