const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const reviewRoute = require('./reviewRoute');

const {
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
  getProductValidator,
} = require('../utils/validator/productValidator');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductImages,
  resizeProductImages,
} = require('../controllers/productController');

router.use('/:productId/reviews', reviewRoute);

router
  .route('/')
  .get(getProducts)
  .post(
    AuthController.protect,
    AuthController.allowedTo('admin', 'manager'),
    updateProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );
router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .put(
    AuthController.protect,
    AuthController.allowedTo('admin', 'manager'),
    updateProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    AuthController.protect,
    AuthController.allowedTo('admin'),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
