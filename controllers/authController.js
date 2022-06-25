const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { sanitizeUser } = require('../utils/sanitizeData');

// @desc SignUp User
// @route POST api/v1/auth/signup
// @access public

exports.signUp = asyncHandler(async (req, res, next) => {
  //! First: create a new user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  //! Second: generate a token
  const token = generateToken(user._id);
  //! Third: send the response
  res.status(201).json({
    data: sanitizeUser(user),
    token,
  });
});

// @desc login  User
// @route POST api/v1/auth/login
// @access public
exports.login = asyncHandler(async (req, res, next) => {
  //! 1) check if email & password in the body (validation)
  //! 2) check if user exist & password is correct.
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError(`Email or Password incorrect!`, 401));
  }
  //! 3) generate a token
  const token = generateToken(user._id);
  //! 4) send the response
  res.status(200).json({
    data: sanitizeUser(user),
    token,
  });
});

//@desc make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  //! 1) check if token exist & if token exist hold it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new ApiError(`You are not login, please try to login!`, 401));
  }
  //! 2) verfiy the token (no change happened || token expired )
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  //! 3) check if user exist
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    next(
      new ApiError('the user that belong this token does no longer exist!', 401)
    );
  }
  //! 4) check if password change after token created
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passwordChangedTimestamp > decoded.iat) {
      next(
        new ApiError(
          'the user changed his password recently, please login again!',
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    //! 1) Access roles
    //! 2) Access register user (req.user)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(`You are not allowed to access this route!`, 403)
      );
    }
    next();
  });

// @desc Forget Password
// @route POST api/v1/auth/ForgetPassword
// @access public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  //! 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is user with this email ${req.body.email}`, 404)
    );
  }
  //! 2) if user exist, generate 6 random digest and save in DB
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpired = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerify = false;
  await user.save();
  //! 3) send Email
  const text = `Hi ${user.name},\n \nWe received a request to reset the password on your LinkedIn Account. \n \n${resetCode} \n \nEnter this code to complete the reset. \n\nThanks for helping us keep your account secure. \n \nThe E-shop App Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset Code (Valid For 10 Min)',
      text,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpired = undefined;
    user.passwordResetVerify = undefined;
    await user.save();
    return new ApiError('There is an error, please try again later!', 500);
  }

  res.status(200).json({
    status: 'Successfully!',
    message: 'Reset Code  Send To Your Email!',
  });
});

// @desc Verify Password Reset Code
// @route POST api/v1/auth/verifyresetcode
// @access public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  //! 1) Get User Based On Reset Code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpired: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError('Invalid or expired reset code!', 400));
  }
  //! 2) Reset Code Valid
  user.passwordResetVerify = true;
  await user.save();
  res.status(200).json({ status: 'Successfully!' });
});

// @desc Reset Password
// @route POST api/v1/auth/resetpassword
// @access public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //! 1) Get User Based On Email.
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with Vhis email ${req.body.email}`, 404)
    );
  }
  //! 2) Check If Reset Code Is Verified.
  if (!user.passwordResetVerify) {
    return next(new ApiError(`Reset Code Not Verified!`, 400));
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpired = undefined;
  user.passwordResetVerify = undefined;

  await user.save();
  //! 3) If Everything Is Okay, Generate Token.
  const token = generateToken(user._id);
  res.status(200).json({ token });
});
