//import packages
import validator from 'validator';

const { isEmail, isEmpty, isStrongPassword, normalizeEmail, escape } =
  validator;

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
    return;
  }

  //check expire date of token
  const today = new Date();
  if (userToken.expires_on < today) {
    res.status(500).json({
      error: { message: 'token has expired' },
      fields: ['token'],
    });
    return;
  }

  //search for user in database
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({
      error: { message: 'user not found' },
      fields: ['userId'],
    });
    return;
  }

  //check user status
  if (user.status != 'inactive') {
    //delete token from database
    await prisma.AuthToken.delete({ where: { user_id: user.id } });

    res.status(500).json({
      error: { message: 'user already verified' },
      fields: [],
    });
    return;
  }

  //update user status and sign user in
  try {
    const updatedUser = await prisma.User.update({
      where: { id: userId },
      data: { status: 'active' },
    });

    //delete token from database
    await prisma.AuthToken.delete({ where: { user_id: updatedUser.id } });

    req.session.role = user.role;
    req.session.status = user.status;
    req.session.clientId = 'abc123';

    res.status(200).json({ message: 'verification successful' });
    return;
  } catch (error) {
    res.status(500).json({ error: { message: error.message, fields: [] } });
    return;
  }
};
