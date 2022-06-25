const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

const {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

router.use(AuthController.protect, AuthController.allowedTo('admin'));
router.route('/').post(createCoupon).get(getCoupons);
router.route('/:id').get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
