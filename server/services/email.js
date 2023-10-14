import sgMail from '@sendgrid/mail';
import 'dotenv/config';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//wraps sendgrid email function, returns the email object if successful, or an error if not
export const sendEmail = async (recipient, subject, text, html) => {
  const email = {
    to: recipient,
    from: process.env.SENDGRID_SENDER,
    subject: subject,
    text: text,
    html: html,
  };
  try {
    await sgMail.send(email);
    return email;
  } catch (error) {
    throw new Error(error);
  }
};
