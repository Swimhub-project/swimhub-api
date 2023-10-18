export const verifyEmailText = (name, id, token) => {
  return `Hi ${name}. Thank you for joining Swimhub. 
  Please verify your email address by clicking the 
  following link: http://localhost:5000/api/user/verify/${id}/${token}. 
  If this wasn't you, you can safely delete this email.`;
};

export const verifyEmailHtml = (name, id, token) => {
  return `Hi ${name}. <br/><br/>Thank you for joining Swimhub. 
  Please verify your email address by clicking the 
  following link: <br/><br/>
  <a href="http://localhost:5000/api/user/verify/${id}/${token}">VERIFY</a>. 
  <br/><br/>If this wasn't you, you can safely delete this email.`;
};
