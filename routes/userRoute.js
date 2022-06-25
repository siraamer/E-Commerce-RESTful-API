const express = require('express');
const router = express.Router();
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidator,
  updateLoggedUserValidator,
} = require('../utils/validator/userValidator');
const AuthController = require('../controllers/authController');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  GetLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUser,
} = require('../controllers/userController');

router.get('/getme', AuthController.protect, GetLoggedUserData, getUser);
router.put(
  '/changemypassword',
  AuthController.protect,
  updateLoggedUserPassword
);
router.put('/deletemyprofile', AuthController.protect, deleteLoggedUser);

router.put(
  '/updatemyprofile',

  AuthController.protect,
  updateLoggedUserValidator,
  updateLoggedUserData
);

router.put('/changepassword/:id', changePasswordValidator, changeUserPassword);

router.use(AuthController.protect, AuthController.allowedTo('admin'));
router
  .route('/')
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
  .route('/:id')
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
