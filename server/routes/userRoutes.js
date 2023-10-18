//import packages
import express from 'express';
import {
  signInUser,
  signUpUser,
  verifyEmail,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/requireAuth.js';

//initialise express router
export const router = express.Router();

//sign in route
router.post('/signin', signInUser);

//sign up route
router.post('/signup', signUpUser);

//verify email route
router.get('/verify/:id/:token', verifyEmail);

//all routes that come after this middleware are protected.
//can only be access if the user is logged in.
router.use(authenticate);

//test profile route
router.get('/profile', (req, res) => {
  res.json(req.session);
});

//TODO add endpoint for re-sending email verification
