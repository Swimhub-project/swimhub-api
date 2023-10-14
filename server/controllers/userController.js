//import packages
import validator from 'validator';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../services/email.js';

const { isEmail, isEmpty, isStrongPassword, normalizeEmail, escape } =
  validator;

//initialise prisma client
const prisma = new PrismaClient();

//sign in user
export const signInUser = async (req, res) => {
  let { email, password } = req.body;

  //check all params exist
  const missingParams = [];
  if (!email) {
    missingParams.push('email');
  }
  if (!password) {
    missingParams.push('password');
  }
  if (missingParams.length > 0) {
    res.status(400).json({
      error: { message: 'missing body parameters', fields: missingParams },
    });
  }

  //check empty fields
  const emptyFields = [];
  if (isEmpty(email, [{ ignore_whitespace: true }])) {
    emptyFields.push('name');
  }
  if (isEmpty(password, [{ ignore_whitespace: true }])) {
    emptyFields.push('email');
  }
  if (emptyFields.length > 0) {
    res.status(400).json({
      error: { message: 'Please fill in all fields', fields: emptyFields },
    });
  }

  //check email
  if (!isEmail(email)) {
    res.status(400).json({
      error: { message: 'Please enter a valid email' },
      fields: ['email'],
    });
  }

  //check password strength
  if (!isStrongPassword(password)) {
    res.status(400).json({
      error: {
        message: 'Password is not strong enough',
        fields: ['password'],
      },
    });
  }

  //sanitise inputs
  email = escape(email).trim();
  email = normalizeEmail(email, [{ gmail_remove_dots: false }]);
  password = password.trim();

  //check if email exists in database
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    res
      .status(404)
      .json({ error: { message: 'user not found', fields: ['email'] } });
  }

  //check password is correct
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res
      .status(401)
      .json({ error: { message: 'wrong password', fields: ['password'] } });
  }

  //TODO track failed login attempts

  //create session and store in Redis
  try {
    //TODO create better session data for user
    req.session.clientId = 'abc123';
    req.session.myNum = 5;

    res.status(200).json({ message: 'signin successful' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message, fields: [] } });
  }
};

//sign up user
export const signUpUser = async (req, res) => {
  let { name, email, password, repeatPassword } = req.body;

  //check all params exist
  const missingParams = [];
  if (!name) {
    missingParams.push('name');
  }
  if (!email) {
    missingParams.push('email');
  }
  if (!password) {
    missingParams.push('password');
  }
  if (!repeatPassword) {
    missingParams.push('repeat password');
  }
  if (missingParams.length > 0) {
    res.status(400).json({
      error: { message: 'missing body parameters', fields: missingParams },
    });
    return;
  }

  //check empty fields
  const emptyFields = [];
  if (isEmpty(name, [{ ignore_whitespace: true }])) {
    emptyFields.push('name');
  }
  if (isEmpty(email, [{ ignore_whitespace: true }])) {
    emptyFields.push('email');
  }
  if (isEmpty(password, [{ ignore_whitespace: true }])) {
    emptyFields.push('password');
  }
  if (isEmpty(repeatPassword, [{ ignore_whitespace: true }])) {
    emptyFields.push('repeat password');
  }
  if (emptyFields.length > 0) {
    res.status(400).json({
      error: { message: 'Please fill in all fields', fields: emptyFields },
    });
    return;
  }

  //check email
  if (!isEmail(email)) {
    res.status(400).json({
      error: { message: 'Please enter a valid email' },
      fields: ['email'],
    });
  }

  //check password strength
  if (!isStrongPassword(password)) {
    res.status(400).json({
      error: {
        message: 'Password is not strong enough',
        fields: ['password'],
      },
    });
    return;
  }

  //check passwords match
  if (password != repeatPassword) {
    res.status(400).json({
      error: { message: 'Passwords do not match' },
      fields: ['password, repeat password'],
    });
    return;
  }

  //sanitise inputs
  name = escape(name).trim();
  email = escape(email).trim();
  email = normalizeEmail(email, [{ gmail_remove_dots: false }]);
  password = password.trim();
  repeatPassword = repeatPassword.trim();

  //check email doesn't already exist in database
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (user) {
    res
      .status(400)
      .json({ error: { message: 'Email already exists', fields: ['email'] } });
    return;
  }

  //hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUserData = {
    name: name,
    email: email,
    password: hashedPassword,
    created_on: new Date(),
    role: 'user',
    status: 'inactive',
    is_teacher: false,
    bio: '',
    is_bio_public: false,
  };

  //try creating user in database
  try {
    const newUser = await prisma.user.create({ data: newUserData });
    if (newUser) {
      //create token and store in database
      const token = crypto.randomBytes(32).toString('hex');

      const tokenData = {
        user_id: newUser.id,
        created_on: new Date(),
        expires_on: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        //token expires 24 hours after creation
        token: token,
      };
      try {
        await prisma.AuthToken.create({ data: tokenData });
      } catch (error) {
        res.status(500).json({ error: { message: error.message, fields: [] } });
        return;
      }

      //send email verification to user
      try {
        const recipient = newUser.email;
        const subject = 'Verify your email address';
        const text = `
      Hi ${newUser.name}. Thank you for joining Swimhub. 
      Please verify your email address by clicking the 
      following link: http://localhost:5000/api/user/verify/${newUser.id}/${tokenData.token}. 
      If this wasn't you, you can safely delete this email.
    `;
        const html = `
      Hi ${newUser.name}. <br/><br/>Thank you for joining Swimhub. 
      Please verify your email address by clicking the 
      following link: <br/><br/><a href="http://localhost:5000/api/user/verify/${newUser.id}/${tokenData.token}">VERIFY</a>. 
      <br/><br/>If this wasn't you, you can safely delete this email.
    `;
        await sendEmail(recipient, subject, text, html);
      } catch (error) {
        res.status(500).json({ error: { message: error.message, fields: [] } });
      }
    }
    res.status(201).json({ message: 'new user created' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message, fields: [] } });
    return;
  }
};

//verify email
export const verifyEmail = async (req, res) => {
  //grab userId and token params from url
  const userId = req.params.id;
  const token = req.params.token;

  //search for auth token in database
  const userToken = await prisma.AuthToken.findUnique({
    where: { user_id: userId },
  });
  if (!userToken) {
    res.status(404).json({
      error: { message: 'token not found' },
      fields: ['token'],
    });
  }

  //check expire date of token
  const today = new Date();
  if (userToken.expires_on < today) {
    res.status(500).json({
      error: { message: 'token has expired' },
      fields: ['token'],
    });
  }

  //search for user in database
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({
      error: { message: 'user not found' },
      fields: ['userId'],
    });
  }

  //check user status
  if (user.status != 'inactive') {
    //delete token from database
    await prisma.AuthToken.delete({ where: { user_id: user.id } });

    res.status(500).json({
      error: { message: 'user already verified' },
      fields: [],
    });
  }

  //update user status and sign user in
  try {
    updatedUser = await prisma.User.update({
      where: { id: userId },
      data: { status: 'active' },
    });

    //delete token from database
    await prisma.AuthToken.delete({ where: { user_id: updatedUser.id } });

    //TODO create better session data for user
    req.session.clientId = 'abc123';
    req.session.myNum = 5;

    res.status(200).json({ message: 'verification successful' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message, fields: [] } });
  }
};
