/*
  "authentication" routes

  declares the endpoints related to user authentication.   
*/

//import packages
import express from 'express';
import { requestPasswordReset } from '../controllers/auth-controllers/reset-password.controller';
import { signInUser } from '../controllers/auth-controllers/signin.controller';
import { signUpUser } from '../controllers/auth-controllers/signup.controller';
import { verifyEmail } from '../controllers/auth-controllers/verify-email.controller';
import { authenticate } from '../middleware/require-auth.middleware';
import { resendEmailVerification } from '../controllers/auth-controllers/resend-verify-email.controller';

//initialise express router
export const router = express.Router();

//sign in route
router.post('/signin', signInUser);

//sign up route
router.post('/signup', signUpUser);

//verify email route
router.get('/verify/:id/:token', verifyEmail); //TODO talk to Steph about what to do once user is verified

//resend email verification route
router.post('/resend_verify', resendEmailVerification);

//reset forgotten password route
router.post('/reset_password', requestPasswordReset);

/*
  all routes that come after this middleware are protected.
  can only be access if the user is logged in and has the correct role and status.
*/
router.use(authenticate);
