//import packages
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { router as userRoutes } from './routes/userRoutes.js';
import RedisStore from 'connect-redis';
import session from 'express-session';
import redis from 'redis';

//initialise express app
const app = express();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

const redisStore = new RedisStore({
  client: redisClient,
});

//port and database variables - imported from .env file
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());
app.use(
  session({
    store: redisStore,
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: false, //if true, only transmit cookie over https
      httpOnly: true, //if true, prevents client side JS from reading cookie
      maxAge: 1000 * 60 * 30, //session max age in milliseconds
    },
  })
);

//routes
app.use('/api/user', userRoutes);

app.post('/login', (req, res) => {
  const { email, password } = req;

  req.session.clientId = 'abc123';
  req.session.myNum = 5;
  res.json('you are now logged in');
});

await redisClient.connect();

//start server
app.listen(port, () =>
  console.log(`server running on port ${port}, ${redisClient.isOpen}`)
);
