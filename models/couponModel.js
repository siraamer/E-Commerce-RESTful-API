const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Coupon name Required!'],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, 'Coupon Expire Date Required!'],
    },
    discount: {
      type: Number,
      required: [true, 'Coupon Discount Value Required!'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
