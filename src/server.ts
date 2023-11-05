//import packages
import { app } from './app';
import { redisClient } from './lib/redis/client.redis';

//port and database variables - imported from .env file
const port = process.env.PORT || 5000;

//currently active environment (development or production), used by email templates
export let activeEnvironment: string;

//start server
app.listen(port, async () => {
  await redisClient.connect(); //opens connection to redis database
  console.log(
    `server running on port ${port}, Is redis client connected? ${redisClient.isOpen}`
  );
  console.log('environment: ', app.get('env'));
  activeEnvironment = app.get('env');
});
