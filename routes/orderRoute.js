const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

const {
  createCashOrder,
  getAllOrders,
  getSpecificOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require('../controllers/orderController');

router.use(AuthController.protect);

router.get(
  '/checkout-session/:cartId',
  AuthController.allowedTo('user'),
  checkoutSession
);
router
  .route('/:cartId')
  .post(AuthController.allowedTo('user'), createCashOrder);

router.get(
  '/',
  AuthController.allowedTo('admin', 'manager', 'user'),
  filterOrderForLoggedUser,
  getAllOrders
);
router.get('/:id', getSpecificOrder);
router.put(
  '/:id/pay',
  AuthController.allowedTo('admin', 'manager'),
  updateOrderToPaid
);
router.put(
  '/:id/deliver',
  AuthController.allowedTo('admin', 'manager'),
  updateOrderToDelivered
);

module.exports = router;
