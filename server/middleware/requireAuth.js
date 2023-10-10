export const authenticate = (req, res, next) => {
  console.log('session', req.session.clientId);
  if (!req.session || !req.session.clientId) {
    const err = new Error('Unauthenticated user');
    err.statusCode = 401;
    next(err);
  } else {
    next();
  }
};
