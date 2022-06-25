const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

const {
  addProductToCart,
  getLoggedUserCart,
  removeCartItems,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require('../controllers/cartController');

router.use(AuthController.protect, AuthController.allowedTo('user'));
router
  .route('/')
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);
router.put('/applycoupon', applyCoupon);
router.route('/:itemId').put(updateCartItemQuantity).delete(removeCartItems);

router.put('/applycoupon', applyCoupon);
module.exports = router;
