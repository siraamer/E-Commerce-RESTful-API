const express = require('express');
const router = express.Router({ mergeParams: true });
const AuthController = require('../controllers/authController');

const {
  createReviewValidator,
  updateReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
} = require('../utils/validator/reviewValidator');

const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObject,
  setProductIdAndUserIdToBody,
} = require('../controllers/reviewsController');

router.route('/').get(createFilterObject, getReviews).post(
  AuthController.protect,
  AuthController.allowedTo('user'),
  setProductIdAndUserIdToBody,

  createReviewValidator,
  createReview
);
router
  .route('/:id')
  .get(getReviewValidator, getReview)
  .put(
    AuthController.protect,
    AuthController.allowedTo('user'),
    updateReviewValidator,
    updateReview
  )
  .delete(
    AuthController.protect,
    AuthController.allowedTo('user', 'manager', 'admin'),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
