const express = require('express');
const AuthController = require('../controllers/authController');
const router = express.Router();
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require('../utils/validator/brandValidator');
const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeImage,
} = require('../controllers/brandController');

router
  .route('/')
  .get(getBrands)
  .post(
    AuthController.protect,
    AuthController.allowedTo('admin', 'manager'),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    createBrand
  );
router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .put(
    AuthController.protect,
    AuthController.allowedTo('admin', 'manager'),
    uploadBrandImage,
    resizeImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    AuthController.protect,
    AuthController.allowedTo('admin'),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
