//import packages
import session from 'express-session';
import { redisStore } from '../lib/redis/redisClient.js';
import 'dotenv/config';

//session middleware - stores session data in redis database
export default session({
  store: redisStore,
  secret: process.env.SECRET,
  saveUninitialized: false,
  resave: false,
  name: 'sessionId',
  cookie: {
    secure: false, //if true, only transmit cookie over https
    httpOnly: true, //if true, prevents client side JS from reading cookie
    maxAge: 1000 * 60 * 30, //session max age in milliseconds
  },
});
