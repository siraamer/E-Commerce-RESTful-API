const jwt = require('jsonwebtoken');
const generateToken = (payload) => {
  return (token = jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  }));
};

module.exports = generateToken;
