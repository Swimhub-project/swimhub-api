//import packages
import express from 'express';
import { getUserById } from '../controllers/user-controllers/get-user.controller';
import { getUsers } from '../controllers/user-controllers/get-users.controller';
import { authenticate } from '../middleware/require-auth.middleware';

//initialise express router
export const router = express.Router();

//get users route - Move to protected (admins only) in production
router.get('/', getUsers);

router.get('/:id', getUserById); //TODO fill out controller

//all routes that come after this middleware are protected.
//can only be access if the user is logged in.
router.use(authenticate);

//get user profile
router.get('/user/:id/profile', (req, res) => {
  //TODO fill out controller
  res.json(req.session);
});
