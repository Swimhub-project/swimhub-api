//resend email verification //TODO speak to stephanie about params
//use user id from url search params
export const resendEmailVerification = async (req, res) => {
  let { id } = req.body;

  //check for missing params
  let missingParams = [];
  if (!id) {
    missingParams.push('id');
  }

  if (missingParams.length > 0) {
    res.status(400).json({
      error: { message: 'missing body parameters', fields: missingParams },
    });
    return;
  }

  //check empty fields
  const emptyFields = [];
  if (isEmpty(id, [{ ignore_whitespace: true }])) {
    emptyFields.push('id');
  }

  if (emptyFields.length > 0) {
    res.status(400).json({
      error: { message: 'Please fill in all fields', fields: emptyFields },
    });
    return;
  }

  //search for user in database
  const user = await prisma.user.findUnique({ where: { id: id } });
  if (!user) {
    res.status(404).json({
      error: { message: 'user not found' },
      fields: ['id'],
    });
  }

  //check user status
  if (user.status != 'inactive') {
    res.status(500).json({
      error: { message: 'user already verified' },
      fields: [],
    });
  }

  //create token and send email verification
  try {
    const token = await createToken();
    const recipient = user.email;
    const subject = 'Verify your email address';
    const text = verifyEmailText(user.name, user.user_id, token.token);
    const html = verifyEmailHtml(user.name, user.user_id, token.token);
    await sendEmail(recipient, subject, text, html);
  } catch (error) {
    res.status(500).json({ error: { message: error.message, fields: [] } });
  }
};
