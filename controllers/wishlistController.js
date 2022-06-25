const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// @desc  Add Product to wishlist
// @route Post api/v1/wishlist
// @access protect/user
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );
  res.status(200).json({
    status: 'Successfully',
    message: 'Product add Successfully to your wishlist!',
    data: user.wishlist,
  });
});

// @desc  Remove Product From wishlist
// @route Post api/v1/wishlist/:id
// @access protect/user
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );
  res.status(200).json({
    status: 'Successfully',
    message: 'Product Deleted Successfully From your wishlist!',
    data: user.wishlist,
  });
});

// @desc  Get Logged User Wishlist
// @route Get api/v1/wishlist
// @access protect/user

exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res
    .status(200)
    .json({
      status: 'Successfully',
      Result: user.wishlist.length,
      data: user.wishlist,
    });
});
