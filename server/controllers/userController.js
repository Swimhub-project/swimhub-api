//import packages
import validator from 'validator';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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

  //check passwords match
  if (password != repeatPassword) {
    res.status(400).json({
      error: { message: 'Passwords do not match' },
      fields: ['password, repeat password'],
    });
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
      //TODO create better session data for user
      req.session.clientId = 'abc123';
      req.session.myNum = 5;
      //TODO send confirmation email to user

      res.status(201).json({ message: 'new user created' });
    }
  } catch (error) {
    res.status(500).json({ error: { message: error.message, fields: [] } });
  }
};
