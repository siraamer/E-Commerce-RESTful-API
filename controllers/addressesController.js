const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// @desc  Add Address to user Addresses
// @route Post api/v1/addresses
// @access protect/user
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );
  res.status(200).json({
    status: 'Successfully',
    message: 'Address added Successfully!',
    data: user.addresses,
  });
});

// @desc  Remove Address From User Addresses' List
// @route Post api/v1/addresses/:addressId
// @access protect/user
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );
  res.status(200).json({
    status: 'Successfully',
    message: 'Address Deleted Successfully!',
    data: user.addresses,
  });
});

// @desc  Get Logged User Addresses list
// @route Get api/v1/addresses
// @access protect/user

exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('addresses');
  res.status(200).json({
    status: 'Successfully',
    Result: user.addresses.length,
    data: user.addresses,
  });
});
