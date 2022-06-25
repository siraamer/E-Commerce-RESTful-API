const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const slugify = require('slugify');
exports.getCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Category Id Format'),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category Name must not be empty')
    .isLength({ min: 3 })
    .withMessage('Too Short Category Name')
    .isLength({ max: 32 })
    .withMessage('Too Long Category Name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Category Id Format'),

  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Category Id Format'),
  validatorMiddleware,
];
