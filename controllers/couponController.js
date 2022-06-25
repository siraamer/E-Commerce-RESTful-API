const Coupon = require('../models/couponModel');
const factory = require('./handlerFactory');

// @desc  Get list of Coupons
// @route Get api/v1/coupons
// @access private/admin & manager
exports.getCoupons = factory.getAll(Coupon);

// @desc  Get Specific Coupon
// @route Get api/v1/coupons/:id
// @access private/admin & manager
exports.getCoupon = factory.getOne(Coupon);

// @desc Create Coupon
// @route POST api/v1/coupons
// @access private/admin & manager
exports.createCoupon = factory.createOne(Coupon);

// @desc  Update Specific Coupon
// @route PUT api/v1/coupons/:id
// @access Privte/admin & manager
exports.updateCoupon = factory.updateOne(Coupon);

// @desc  delete Specific Coupon
// @route DELETE api/v1/coupons/:id
// @access private/admin & manager
exports.deleteCoupon = factory.deleteOne(Coupon);
