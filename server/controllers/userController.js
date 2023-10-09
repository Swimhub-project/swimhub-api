//import packages
import validator from 'validator';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

//initialise prisma client
const prisma = new PrismaClient();

//sign in user
export const signInUser = async (req, res) => {
  const { email, password } = req.body;

  //validate inputs
  if (!email || !password) {
    res.status(400).json({ error: 'please fill in all fields' });
  }
  if (!validator.isEmail(email)) {
    res.status(400).json({ error: 'email is invalid' });
  }

  //check if email exists in database
  const user = prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    res.status(404).json({ error: 'user not found' });
  }

  //check password is correct
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ error: 'wrong password' });
  }

  //create session and store in Redis
  try {
    req.session.clientID = 'abc123';
    req.session.myNum = 5;

    res.json('you are now logged in');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//sign up user
export const signUpUser = async (req, res) => {};
