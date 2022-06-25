const asyncHandler = require('express-async-handler');
const Boom = require('../utils/apiError');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');

const Product = require('../models/productModel');

const calculatorTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice.toFixed(2);
  cart.totalPriceAfterDiscount = undefined;

  return totalPrice;
};

// @desc Add Product to Cart
// @route POST api/v1/cart
// @access private/user

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await Product.findById(productId);
  //! 1) Get Cart for Logged user
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    //! Create Cart for Logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    //! if product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      //! product not exist in cart, push product to cartItems array!
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  //! calculator the total price
  calculatorTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: 'Successfully',
    numOfItems: cart.cartItems.length,
    message: 'Product Added to Cart Successfully!',
    data: cart,
  });
});

// @desc Get Logged User Cart
// @route Get api/v1/cart
// @access private/user

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new Boom(`There is no cart for this user ID ${req.user._id}`, 404)
    );
  }
  res.status(200).json({
    status: 'Successfully',
    numOfItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Remove Cart Item
// @route Delete api/v1/cart/:itemId
// @access private/user

exports.removeCartItems = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  calculatorTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: 'Successfully',
    numOfItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Clear User Cart
// @route Delete api/v1/cart
// @access private/user

exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc   Update Cart Item
// @route  Delete api/v1/cart/:itemId
// @access private/user

exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new Boom(`There is no cart for this user ID ${req.user._id}`, 404)
    );
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new Boom(`There is no cart for this ID ${req.params._itemId}`, 404)
    );
  }
  calculatorTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: 'Successfully',
    numOfItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc   Apply Coupon For Cart
// @route  Put api/v1/cart/applyCoupon
// @access private/user

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  //! 1) Get Coupon Based On Coupon Name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new Boom(`Coupon is an invalid or expired`, 404));
  }
  //! 2) Get Logged User Cart to get total price
  const cart = await Cart.findOne({ user: req.user._id });
  const totalPrice = cart.totalCartPrice;

  //! calculate price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();
  res.status(200).json({
    status: 'Successfully',
    numOfItems: cart.cartItems.length,
    data: cart,
  });
});
