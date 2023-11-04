/*
  "create token" function

  Generates a random 32bit token and stores it in the authToken database table. 
  Used when a new user account is created - used to verify user email.
*/

import crypto from 'crypto';
import { prismaClient } from '../../lib/prisma/client.prisma';

export const createToken = async (id: string) => {
  //create random 32bit string for the token
  const token = crypto.randomBytes(32).toString('hex');

  const tokenData = {
    user_id: id,
    created_on: new Date(),
    expires_on: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    //token expires 24 hours after creation
    token: token,
  };
  //stores token in database
  try {
    const token = await prismaClient.authToken.create({ data: tokenData });
    return token;
  } catch (error) {
    throw new Error(error as string);
  }
};
