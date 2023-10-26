import sgMail from '@sendgrid/mail';
import 'dotenv/config';

//wraps sendgrid email function, returns the email object if successful, or an error if not
export const sendEmail = async (
  recipient: string,
  subject: string,
  text: string,
  html: string
) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromAddress = process.env.SENDGRID_SENDER;
  if (!apiKey) {
    throw new Error('valid API key not found');
  }
  if (!fromAddress) {
    throw new Error('invalid fromAddress');
  }
  sgMail.setApiKey(apiKey);

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
