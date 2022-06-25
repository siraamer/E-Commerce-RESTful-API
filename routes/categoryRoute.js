const express = require('express');

const subCategoryRoute = require('./subCategoryRoute');
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require('../utils/validator/categoryValidator');
const AuthController = require('../controllers/authController')

const router = express.Router();

router.use('/:categoryId/subcategories', subCategoryRoute);

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require('../controllers/categoryController');

router
  .route('/')
  .get(getCategories)
  .post(
    AuthController.protect,
    AuthController.allowedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory
  );
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .put(
    AuthController.protect,
    AuthController.allowedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    AuthController.protect,
    AuthController.allowedTo('admin'),
    
    deleteCategoryValidator, deleteCategory);

module.exports = router;
