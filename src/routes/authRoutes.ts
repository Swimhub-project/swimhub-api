//import packages
import express from 'express';
import { requestPasswordReset } from '../controllers/authControllers/passwordReset';
import { signInUser } from '../controllers/authControllers/signin';
import { signUpUser } from '../controllers/authControllers/signup';
import { verifyEmail } from '../controllers/authControllers/verifyEmail';
import { authenticate } from '../middleware/requireAuth';
import { resendEmailVerification } from '../controllers/authControllers/resendVerifyEmail';

//initialise express router
export const router = express.Router();

//sign in route
router.post('/signin', signInUser);

//sign up route
router.post('/signup', signUpUser);

//verify email route
router.get('/verify/:id/:token', verifyEmail); //TODO talk to Steph about what to do once user is verified

//resend email verification
router.post('/resend_verify', resendEmailVerification);

//all routes that come after this middleware are protected.
//can only be access if the user is logged in.
router.use(authenticate);

router.post('/reset_password', requestPasswordReset);
