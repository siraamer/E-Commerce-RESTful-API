const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require('../controllers/wishlistController');

router.use(AuthController.protect, AuthController.allowedTo('user'));
router.route('/').post(addProductToWishlist).get(getLoggedUserWishlist);
router.route('/:productId').delete(removeProductFromWishlist);

module.exports = router;
