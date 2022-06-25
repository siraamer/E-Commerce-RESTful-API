const mongoose = require('mongoose');
const Product = require('../models/productModel');
const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, ' Min Rating Must Be 1.0 Or Above!'],
      max: [5, 'Max Rating Must Be 5.0 Or Below!'],
      required: [true, ' Review Rating Is Required!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review Must Be Belong To User!'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review Must Be Belong To Product!'],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});

reviewSchema.statics.calcAverageRatinsAndQuantity = async function (productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: 'product',
        ratingsAverage: { $avg: '$ratings' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].ratingsAverage,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuality: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatinsAndQuantity(this.product);
});

reviewSchema.post('remove', function () {
  this.constructor.calcAverageRatinsAndQuantity(this.product);
});
module.exports = mongoose.model('Review', reviewSchema);
