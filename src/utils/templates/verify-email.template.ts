/*
  "verify email" email templates

  These templates are sent to the user as part of the email verification
  step of the account creation. 
  
*/

//import packages
import { activeEnvironment } from '../../server';

/*
sets base url for emails. In development it runs on 
localhost:5000. In production it runs on the deployed url (see .env file for url)
*/
let baseUrl = '';
if (activeEnvironment == 'development') {
  baseUrl = 'http://localhost:5000';
} else {
  baseUrl = process.env.BASE_URL || 'http://localhost:5000';
}

//template if html cannot be displayed in email
export const verifyEmailText = (name: string, id: string, token: string) => {
  return `Hi ${name}. Thank you for joining Swimhub. 
  Please verify your email address by clicking the 
  following link: ${baseUrl}/user/verify/${id}/${token}. 
  If this wasn't you, you can safely delete this email.`;
};

//template if html CAN be displayed in email
//TODO add styles to template
export const verifyEmailHtml = (name: string, id: string, token: string) => {
  return `Hi ${name}. <br/><br/>Thank you for joining Swimhub. 
  Please verify your email address by clicking the 
  following link: <br/><br/>
  <a href="${baseUrl}/user/verify/${id}/${token}">VERIFY</a>. 
  <br/><br/>If this wasn't you, you can safely delete this email.`;
};
