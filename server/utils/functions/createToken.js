import crypto from 'crypto';

export const createToken = async () => {
  const token = crypto.randomBytes(32).toString('hex');

  const tokenData = {
    user_id: newUser.id,
    created_on: new Date(),
    expires_on: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    //token expires 24 hours after creation
    token: token,
  };
  try {
    const token = await prisma.AuthToken.create({ data: tokenData });
    return token;
  } catch (error) {
    throw new Error(error);
  }
};
