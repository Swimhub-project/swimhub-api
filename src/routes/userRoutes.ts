//import packages
import express from 'express';
import { authenticate } from '../middleware/requireAuth';
import { getUsers } from '../controllers/userControllers/getUsers';
import { getUserById } from '../controllers/userControllers/getUser';

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
