const Brand = require('../models/brandModel');
const factory = require('./handlerFactory');
const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

// @desc Upload a single image
exports.uploadBrandImage = uploadSingleImage('image');
// @desc Apply Processing For a Single Image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brands-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`uploads/brands/${filename}`);
  req.body.image = filename;
  next();
});

// @desc  Get list of brands
// @route Get api/v1/brands
// @access public
exports.getBrands = factory.getAll(Brand);

// @desc  Get Specific Brand
// @route Get api/v1/brands/:id
// @access public
exports.getBrand = factory.getOne(Brand);

// @desc Create Brand
// @route POST api/v1/brands
// @access private/admin & manager
exports.createBrand = factory.createOne(Brand);

// @desc  Update Specific Brand
// @route PUT api/v1/brands/:id
// @access Privte/admin & manager
exports.updateBrand = factory.updateOne(Brand);

// @desc  delete Specific Brand
// @route DELETE api/v1/brands/:id
// @access Privte/admin
exports.deleteBrand = factory.deleteOne(Brand);
