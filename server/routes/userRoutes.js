//import packages
import express from 'express';
import { signInUser, signUpUser } from '../controllers/userController.js';

//initialise express router
export const router = express.Router();

//sign in route
router.post('/signin', signInUser);

//sign up route
router.post('/signup', signUpUser);
