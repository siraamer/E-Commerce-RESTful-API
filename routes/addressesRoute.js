const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require('../controllers/addressesController');

router.use(AuthController.protect, AuthController.allowedTo('user'));
router.route('/').post(addAddress).get(getLoggedUserAddresses);
router.route('/:addressId').delete(removeAddress);

module.exports = router;
