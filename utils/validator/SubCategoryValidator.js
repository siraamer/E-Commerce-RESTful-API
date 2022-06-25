const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const slugify = require('slugify');
exports.getSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid SubCategory Id Format'),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('SubCategory Name must not be empty')
    .isLength({ min: 2 })
    .withMessage('Too Short SubCategory Name')
    .isLength({ max: 32 })
    .withMessage('Too Long SubCategory Name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
  check('category')
    .notEmpty()
    .withMessage('SubCategory Category must be belong to category')
    .isMongoId()
    .withMessage('Invalid Category Id Format'),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid SubCategory Id Format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid SubCategory Id Format'),
  validatorMiddleware,
];
