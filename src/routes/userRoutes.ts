//import packages
import express from 'express';
import { getSessions } from '../controllers/userControllers/getSessions';
import { getUsers } from '../controllers/userControllers/getUsers';
import { requestPasswordReset } from '../controllers/userControllers/passwordReset';
import { signInUser } from '../controllers/userControllers/signin';
import { signUpUser } from '../controllers/userControllers/signup';
import { verifyEmail } from '../controllers/userControllers/verifyEmail';
import { authenticate } from '../middleware/requireAuth';

//initialise express router
export const router = express.Router();

//sign in route
router.post('/signin', signInUser);

//sign up route
router.post('/signup', signUpUser);

//verify email route
router.get('/verify/:id/:token', verifyEmail);

//get users route - TESTING ONLY
router.get('/users', getUsers);

//get sessions route - TESTING ONLY
router.get('/sessions', getSessions);

router.post('/reset', requestPasswordReset);

//all routes that come after this middleware are protected.
//can only be access if the user is logged in.
router.use(authenticate);

//test profile route
router.get('/profile', (req, res) => {
  res.json(req.session);
});

//TODO add endpoint for re-sending email verification
