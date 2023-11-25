/*
  "entry" routes

  declares the endpoints related to entries.   
*/

//import packages
import express from 'express';
import { createEntry } from '../controllers/entry-controllers/create-entry.controller';
import { deleteEntry } from '../controllers/entry-controllers/delete-entry.controller';
import { getEntries } from '../controllers/entry-controllers/get-entries.controller';
import { getEntryById } from '../controllers/entry-controllers/get-entry.controller';
import { updateEntry } from '../controllers/entry-controllers/update-entry.controller';
import { authenticate } from '../middleware/require-auth.middleware';

//initialise express router
export const router = express.Router();

//get entries route
router.get('/', getEntries);

//get single entry route
router.get('/:id', getEntryById);

/*
  all routes that come after this middleware are protected.
  can only be access if the user is logged in and has the correct role and status.
*/
// router.use(authenticate);

//create entry route
router.post('/', createEntry);

//update entry route
router.patch('/:id', updateEntry);

//delete entry route
router.delete('/:id', deleteEntry);
