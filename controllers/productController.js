const Product = require('../models/productModel');
const factory = require('./handlerFactory');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');
const { uploadMixOfImages } = require('../middleware/uploadImageMiddleware');

exports.updateProductImages = uploadMixOfImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${imageCoverFileName}`);
    req.body.imageCover = imageCoverFileName;
  }
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${imageName}`);
        req.body.images.push(imageName);
      })
    );

    next();
  }
});
// @desc  Get list of Products
// @route Get api/v1/products
// @access public

exports.getProducts = factory.getAll(Product, 'products');

// @desc  Get Specific Product
// @route Get api/v1/products/:id
// @access public

exports.getProduct = factory.getOne(Product, 'reviews');

// @desc Create Product
// @route POST api/v1/products
// @access private/admin & manager

exports.createProduct = factory.createOne(Product);
// @desc  Update Specific Product
// @route PUT api/v1/products/:id
// @access Privte/admin & manager
exports.updateProduct = factory.updateOne(Product);

// @desc  delete Specific Product
// @route DELETE api/v1/products/:id
// @access Privte/admin

exports.deleteProduct = factory.deleteOne(Product);
