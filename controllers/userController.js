const User = require('../models/userModel');
const factory = require('./handlerFactory');
const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const Boom = require('../utils/apiError');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { default: slugify } = require('slugify');

// @desc Upload a single image
exports.uploadUserImage = uploadSingleImage('profileImg');
// @desc Apply Processing For a Single Image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `users-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);
    req.body.profileImg = filename;
  }

  next();
});

// @desc  Get list of users
// @route Get api/v1/users
// @access private/admin & manager

exports.getUsers = factory.getAll(User);
// @desc  Get Specific User
// @route Get api/v1/users/:id
// @access Private/admin

exports.getUser = factory.getOne(User);
// @desc Create User
// @route POST api/v1/users
// @access private/admin

exports.createUser = factory.createOne(User);
// @desc  Update Specific User
// @route PUT api/v1/users/:id
// @access Privte/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      profileImg: req.body.profileImg,
      phone: req.body.phone,
      role: req.body.role,
    },
    {
      new: true,
    }
  );
  if (!updateUser) {
    return next(new Boom(`No User With This Id: ${req.params.id}`, 404));
  }
  res.status(200).json({ updateUser });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!updateUser) {
    return next(new Boom(`No User With This Id: ${req.params.id}`, 404));
  }
  res.status(200).json({ updateUser });
});
// @desc  delete Specific User
// @route DELETE api/v1/users/:id
// @access Privte/admin

exports.deleteUser = factory.deleteUser(User);

// @desc Get  logged user data
// @route POST api/v1/auth/getme
// @access Privte/Protect
exports.GetLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc Update logged User Password
// @route PUT  api/v1/auth/updatemypassword
// @access Privte/Protect

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  //! 1) Update User Password Based on Payload

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  //! 2) Generate Token
  const token = generateToken(user._id);
  res.status(200).json({ data: user, token });
});

// @desc Update logged User data
// @route PUT  api/v1/auth/updatemyprofile
// @access Privte/Protect

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      email: req.body.email,
      name: req.body.name,
      phone: req.body.phone,
      slug: slugify(req.body.name),
    },
    { new: true }
  );
  res.status(200).json({ data: updateUser });
});

// @desc deactivate logged User
// @route DELETE  api/v1/auth/deletemyprofile
// @access Privte/Protect

exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: 'Secess' });
});
