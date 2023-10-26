import crypto from 'crypto';
import { prismaClient } from '../../lib/prisma/prismaClient';

export const createToken = async (id: string) => {
  const token = crypto.randomBytes(32).toString('hex');

  const tokenData = {
    user_id: id,
    created_on: new Date(),
    expires_on: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    //token expires 24 hours after creation
    token: token,
  };
  try {
    const token = await prismaClient.authToken.create({ data: tokenData });
    return token;
  } catch (error) {
    throw new Error(error as string);
  }
};
