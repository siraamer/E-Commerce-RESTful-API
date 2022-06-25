const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const apiError = require('../utils/apiError');
const apiFeatures = require('../utils/apiFeatures');

// @desc  Get list of Products
// @route Get api/v1/products
// @access public

exports.getProducts = asyncHandler(async (req, res) => {
  //! 1) Filtering
  const queryStringObj = { ...req.query };
  const excludesFields = ['page', 'sort', 'limit', 'fields'];
  excludesFields.forEach((field) => delete queryStringObj[field]);
  //! Apply filtering using [ gte | gt | lte | lt ]
  let queryString = JSON.stringify(queryStringObj);
  queryString = queryString.replace(
    /\b(gte|gt|lte|lt)\b/g,
    (match) => `$${match}`
  );
  //! 2) Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 50;
  const skip = (page - 1) * limit;
  //! 3) Build Query
  let mongooseQuery = Product.find(JSON.parse(queryString)).populate({
    path: 'category',
    select: 'name -_id',
  });
  //! Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery.sort('-createdAt');
  }
  //! Fields Limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    mongooseQuery.select(fields);
  } else {
    mongooseQuery.select('-__v');
  }

  //! Search
  if (req.query.keyword) {
    const query = {};
    query.$or = [
      { title: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } },
    ];
    mongooseQuery = mongooseQuery.find(query);
  }
  //! Execute Query
  const products = await mongooseQuery;
  res.status(200).json({ result: products.length, page, data: products });
});

// @desc  Get Specific Product
// @route Get api/v1/products/:id
// @access public

exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate(
    {
      path: 'category',
      select: 'name -_id',
    },
    [{ path: 'subCategories', select: 'name -_id' }]
  );
  if (!product) {
    return next(new apiError(`No Product With This Id: ${id}`, 404));
  }
  res.status(200).json({ data: product });
});

// @desc Create Product
// @route POST api/v1/products
// @access private

exports.createProduct = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title);
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// @desc  Update Specific Product
// @route PUT api/v1/products/:id
// @access Privte
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }

  const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!updateProduct) {
    return next(new apiError(`No Product With This Id: ${id}`, 404));
  }
  res.status(200).json({ updateProduct });
});

// @desc  delete Specific Product
// @route DELETE api/v1/products/:id
// @access Privte

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deleteProduct = await Product.findByIdAndDelete(id);
  if (!deleteProduct) {
    return next(new apiError(`No Product With This Id: ${id}`, 404));
  }
  res.status(204).send({
    msg: `Deleted Successfully`,
  });
});

//! DiskStorage Engine
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/categories');
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split('/')[1];
    const filename = `category-${uuidv4()}-${Date.now()}.${extension}`;
    cb(null, filename);
  },
});
//! filter file type
const filefilters = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError('Only image is allowed', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: filefilters });

exports.uploadCategoryImage = upload.single('image');

// //! memory storage engine
// const multerStorage = multer.memoryStorage();
// //! filter file type
// const filefilters = function (req, file, cb) {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new ApiError('Only image is allowed', 400), false);
//   }
// };
// const upload = multer({ storage: multerStorage, fileFilter: filefilters });
