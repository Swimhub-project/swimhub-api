/*
  "automated email" service

  Uses sendgrid to send automated emails to users.
  For more information, go to https://docs.sendgrid.com/
*/

//import packages
import sgMail from '@sendgrid/mail';
import 'dotenv/config';

export const sendEmail = async (
  recipient: string,
  subject: string,
  text: string,
  html: string
) => {
  //validates environment variables from .env file
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromAddress = process.env.SENDGRID_SENDER;
  if (!apiKey) {
    throw new Error('valid API key not found');
  }
  if (!fromAddress) {
    throw new Error('invalid fromAddress');
  }
  sgMail.setApiKey(apiKey);

  //send email to user
  const email = {
    to: recipient,
    from: fromAddress,
    subject: subject,
    text: text,
    html: html,
  };
  try {
    await sgMail.send(email);
    return email;
  } catch (error) {
    throw new Error(error as string);
  }
};
