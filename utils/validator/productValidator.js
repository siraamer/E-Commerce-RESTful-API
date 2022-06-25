const validatorMiddleware = require('../../middleware/validatorMiddleware');
const { check, body } = require('express-validator');
const SubCategory = require('../../models/subCategoryModel');
const Category = require('../../models/categoryModel');
const slugify = require('slugify');

exports.createProductValidator = [
  check('title')
    .isLength({ min: 3 })
    .withMessage('Must be at least 3 characters!')
    .notEmpty()
    .withMessage('Product Required!')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('description')
    .notEmpty()
    .withMessage('Product Description is Required!')
    .isLength({ min: 20 })
    .withMessage('Too Short Description!'),
  check('quantity')
    .notEmpty()
    .withMessage('Product Quantity is Required!')
    .isNumeric()
    .withMessage('Product Quantity must be a number!'),
  check('sold')
    .optional()
    .isNumeric()
    .withMessage('Product Quantity must be a number!'),
  check('price')
    .notEmpty()
    .withMessage('Product Price is Required!')
    .isNumeric()
    .withMessage('Product Price must be a number!')
    .isLength({ max: 32 })
    .withMessage('Price Too Long!'),
  check('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('Price After Discount must be a number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error('Price After Discount must be lower than price!');
      }
      return true;
    }),
  check('colors')
    .optional()
    .isArray()
    .withMessage('Colors must be an array of strings!'),
  check('imageCover')
    .notEmpty()
    .withMessage('Product Image Cover is Required!'),
  check('images')
    .optional()
    .isArray()
    .withMessage('Images Shoud be an array of string!'),
  check('category')
    .notEmpty()
    .withMessage('Product must be belong to a category!')
    .isMongoId()
    .withMessage('Invalid ID Format!')
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No Category With This ID ${categoryId}`)
          );
        }
      })
    ),
  check('subCategories')
    .optional()
    .isMongoId()
    .withMessage('Invalid ID Format!')
    .custom((subCategoriesIds) =>
      SubCategory.find({ _id: { $exists: true, $in: subCategoriesIds } }).then(
        (result) => {
          if (result.length < 1 || result.length !== subCategoriesIds.length) {
            return Promise.reject(
              new Error(`There is no SubCategories with this ID's!`)
            );
          }
        }
      )
    )
    .custom((val, { req }) =>
      SubCategory.find({ category: req.body.category }).then(
        (subCategories) => {
          const subCategoriesIdInDB = [];
          subCategories.forEach((subCategory) => {
            subCategoriesIdInDB.push(subCategory._id.toString());
          });
          const checker = (target, arr) => target.every((v) => arr.includes(v));
          if (!checker(val, subCategoriesIdInDB)) {
            return Promise.reject(
              new Error(
                `This Or Those SubCategories not belong to Currect Category! `
              )
            );
          }
        }
      )
    ),

  check('brand').optional().isMongoId().withMessage('Invalid ID Format!'),
  check('ratingsAverage')
    .optional()
    .isNumeric()
    .withMessage('Ratings Average must be a number!')
    .isLength({ min: 1 })
    .withMessage('Rating Must Be Above Or Equal 1.0')
    .isLength({ max: 5 })
    .withMessage('Rating Must Be Below or Equal 5'),
  check('ratingsQuantity')
    .optional()
    .isNumeric()
    .withMessage('Ratings Quantity must be'),
  validatorMiddleware,
];

exports.getProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID Format!'),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID Format!'),
  body('title')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID Format!'),
  validatorMiddleware,
];
