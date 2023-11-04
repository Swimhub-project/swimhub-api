/*
  "session creation" service

  Uses the express-session package to store user signin session 
  in the redis database. 

  For more information, go to https://expressjs.com/en/resources/middleware/session.html
*/

//import packages
import session from 'express-session';
import { redisStore } from '../lib/redis/client.redis';
import 'dotenv/config';

export default session({
  store: redisStore,
  secret: process.env.SECRET || '',
  saveUninitialized: false,
  resave: false,
  name: 'sessionId',
  cookie: {
    secure: false, //if true, only transmit cookie over https
    httpOnly: true, //if true, prevents client side JS from reading cookie
    maxAge: 1000 * 60 * 30, //session max age in milliseconds
  },
});
