const express = require('express');
const router = express.Router();
const {
  signUpValidator,
  loginValidator,
} = require('../utils/validator/authValidator');
const {
  signUp,
  login,
  forgetPassword,
  verifyPasswordResetCode,
  resetPassword,
} = require('../controllers/authController');

router.post('/signup', signUpValidator, signUp);
router.post('/login', loginValidator, login);
router.post('/forgetpassword', forgetPassword);
router.post('/verifyresetcode', verifyPasswordResetCode);
router.put('/resetpassword', resetPassword);

module.exports = router;
