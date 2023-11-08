/*
  "log" routes

  declares the endpoints related to fetching logs.   
*/

//import packages
import express from 'express';
import { getLogs } from '../controllers/log-controllers/get-logs.controller';

//initialise express router
export const router = express.Router();

//get logs route
router.get('/', getLogs);
