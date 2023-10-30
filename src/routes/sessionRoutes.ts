//import packages
import express from 'express';
import { getSessions } from '../controllers/sessionControllers/getSessions';
import { authenticate } from '../middleware/requireAuth';
import { deleteSession } from '../controllers/sessionControllers/deleteSession';

//initialise express router
export const router = express.Router();

//get sessions route - Move to protected (admins only) in production
router.get('/', getSessions); //TODO implement page pagination
router.delete('/:id', deleteSession);

//all routes that come after this middleware are protected.
//can only be access if the user is logged in.
router.use(authenticate);
