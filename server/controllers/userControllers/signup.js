//import packages
import validator from 'validator';
import bcrypt from 'bcrypt';
import { sendEmail } from '../services/email.js';
import { createToken } from '../utils/functions/createToken.js';
import {
  verifyEmailText,
  verifyEmailHtml,
} from '../utils/templates/verifyEmailTemplates.js';

const { isEmail, isEmpty, isStrongPassword, normalizeEmail, escape } =
  validator;

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
    return;
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
      //create token and send email verification to user
      try {
        await createToken();
        const recipient = newUser.email;
        const subject = 'Verify your email address';
        const text = verifyEmailText(
          newUser.name,
          newUser.user_id,
          tokenData.token
        );
        const html = verifyEmailHtml(
          newUser.name,
          newUser.user_id,
          tokenData.token
        );
        await sendEmail(recipient, subject, text, html);
      } catch (error) {
        res.status(500).json({ error: { message: error.message, fields: [] } });
      }
    }
    res.status(201).json({ message: 'new user created' });
    return;
    //TODO return created user object
  } catch (error) {
    res.status(500).json({ error: { message: error.message, fields: [] } });
    return;
  }
};
