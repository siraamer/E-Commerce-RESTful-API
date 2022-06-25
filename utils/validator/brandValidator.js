const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const slugify = require('slugify');

exports.getBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand Id Format'),
  validatorMiddleware,
];

exports.createBrandValidator = [
  check('name')
    .notEmpty()
    .withMessage('Brand Name must not be empty')
    .isLength({ min: 3 })
    .withMessage('Too Short Brand Name')
    .isLength({ max: 32 })
    .withMessage('Too Long Brand Name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand Id Format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand Id Format'),
  validatorMiddleware,
];
