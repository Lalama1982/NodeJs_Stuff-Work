const express = require('express');

const router = express.Router();

// all the handlers (getAllUser ...) are been moved to "userController.js"
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

//< could write like this as well > ... router.post('/signup', authController.signup);
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
