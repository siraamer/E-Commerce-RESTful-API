const Category = require('../models/categoryModel');
const factory = require('./handlerFactory');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');
const asyncHandler = require('express-async-handler');

// @desc Upload a single image
exports.uploadCategoryImage = uploadSingleImage('image');
// @desc Apply Processing For a Single Image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);
    req.body.image = filename;
  }
  next();
});

// @desc  Get list of categories
// @route Get api/v1/categories
// @access public

exports.getCategories = factory.getAll(Category);

// @desc  Get Specific Category
// @route Get api/v1/categories/:id
// @access public

exports.getCategory = factory.getOne(Category);

// @desc Create Category
// @route POST api/v1/categories
// @access private/admin & manager

exports.createCategory = factory.createOne(Category);

// @desc  Update Specific Category
// @route PUT api/v1/categories/:id
// @access Privte/admin & manager
exports.updateCategory = factory.updateOne(Category);

// @desc  delete Specific Category
// @route DELETE api/v1/categories/:id
// @access Privte/admin

exports.deleteCategory = factory.deleteOne(Category);
