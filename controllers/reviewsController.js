const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { category: req.params.productId };
  req.filterObject = filterObject;
  next();
};

// @desc  Get list of reviews
// @route Get api/v1/reviews
// @access public
exports.getReviews = factory.getAll(Review);

// @desc  Get Specific Review
// @route Get api/v1/reviews/:id
// @access public
exports.getReview = factory.getOne(Review);

// @desc Create Review
// @route POST api/v1/reviews
// @access private/protect/user

exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.createReview = factory.createOne(Review);

// @desc  Update Specific Review
// @route PUT api/v1/reviews/:id
// @access private/protect/user
exports.updateReview = factory.updateOne(Review);

// @desc  delete Specific Review
// @route DELETE api/v1/reviews/:id
// @access  private/protect/user
exports.deleteReview = factory.deleteOne(Review);
