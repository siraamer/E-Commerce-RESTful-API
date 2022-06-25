const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const slugify = require('slugify');
const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id Format!'),
  validatorMiddleware,
];

exports.signUpValidator = [
  check('name')
    .notEmpty()
    .withMessage('Name must not be empty!')
    .isLength({ min: 3 })
    .withMessage('Too Short Name')
    .isLength({ max: 32 })
    .withMessage('Too Long Name!')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Email must not be empty!')
    .isEmail()
    .withMessage('Wrong E-mail Format!')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(
            new Error('This E-mail is already exist, please try to login!')
          );
        }
      })
    ),
  check('password')
    .notEmpty()
    .withMessage('Password must not be empty!')
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters at least!')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error('Password And passwordConfirmation Not The Same!');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('PasswordConfirm is Required!'),
  validatorMiddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('Email must not be empty!')
    .isEmail()
    .withMessage('Wrong E-mail Format!'),
  check('password')
    .notEmpty()
    .withMessage('Password must not be empty!')
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters at least!'),
  validatorMiddleware,
];
