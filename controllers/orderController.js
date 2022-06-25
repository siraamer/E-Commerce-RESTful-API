// const stripe = require('stripe')(process.env.STRIPE_SECRET);
const factory = require('./handlerFactory');
const Boom = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// @desc  Create Cash Order
// @route POST api/v1/order/cartId
// @access Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  //! App Settings
  const taxPrice = 0;
  const shippingPrice = 0;
  //! 1) Get Cart Depend On CartId.
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new Boom(`There is no cart for User`, 404));
  }
  //! 2) Get Order Price Depend On Cart Price 'Check If Coupon Applied'.
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  //! 3) Create Order With Default Payment Method Type Cash.
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  //! 4) After Creating Order, Decrement Product Quantity, Increment Product Sold.
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    //! 5) Clear Cart Depend On CartId.
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({ status: `Successfully`, data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObject = { user: req.user._id };
  next();
});
// @desc  Get All Orders
// @route Get api/v1/orders
// @access Protected/User-admin-manager
exports.getAllOrders = factory.getAll(Order);

// @desc  Get Specific Order
// @route Get api/v1/orders/orderId
// @access Protected/User-admin-manager
exports.getSpecificOrder = factory.getOne(Order);

// @desc  Update Order Paid Status
// @route PUT api/v1/orders/:id/pay
// @access Protected/admin-manager

exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new Boom(`There is no Order With This ID`, 404));
  }
  //! Update Order To Paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updateOrder = await order.save();

  res.status(200).json({ status: 'Successfully', data: updateOrder });
});

// @desc  Update Order Delivered Status
// @route PUT api/v1/orders/:id/Deliver
// @access Protected/admin-manager

exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new Boom(`There is no Order With This ID`, 404));
  }
  //! Update Order To Delivered
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updateOrder = await order.save();

  res.status(200).json({ status: 'Successfully', data: updateOrder });
});

// @desc  Get Checkout Session from Stripe And Send It As A Response
// @route Get api/v1/orders/checkout-session/:cartId
// @access Protected/user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  //! App Settings
  const taxPrice = 0;
  const shippingPrice = 0;
  //! 1) Get Cart Depend On CartId.
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new Boom(`There is no cart for User`, 404));
  }
  //! 2) Get Order Price Depend On Cart Price 'Check If Coupon Applied'.
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  //! 3) Create Stripe Checkout Session

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        name: req.user.name,
        amount: totalOrderPrice * 100,
        currency: 'egp',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  //! 4) Send Session To Response
  res.status(200).json({ status: 'Successfully', data: session });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const oderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: oderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};

// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    //  Create order
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
