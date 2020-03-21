/* eslint-disable no-console */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
  //console.log('ID >> ', id);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // this will used to create a user
  const newUser = await User.create(req.body); // below mentioned way is more secure!
  /*
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });
  */

  const token = signToken(newUser._id);
  /*
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  */

  res.status(201).json({
    status: 'success',
    token,
    date: {
      user: newUser
    },
    location: 'USERS: GET api with params  [authCtrl/signup]'
  });
  // go to "https://jwt.io/debugger" and paste token to see header, payload & secret
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; // this is similar to "const email = req.body.email;" and var & property name should be similar

  // 1 - Check if email & pwd exist
  if (!email || !password) {
    return next(
      new AppError('Please provide email & password!', 400, 'authCtrl/login-01')
    );
  }

  // 2 - check if user exists && pwd is correct
  const user = await User.findOne({ email }).select('+password'); // similar to ({email: email})
  // "password" need to specified as in the userModel it is selected false

  //const correct = await user.correctPassword(password, user.password);

  // in "userModel" there is a function to compare the passwords
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('Incorrect email or password', 401, 'authCtrl/login-02')
    );
  }

  // 3 - send the token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    user: user,
    location: 'USERS: GET api with params  [authCtrl/login]'
  });
});

// this is to validate login(s) on route. impl: "tourRoutes.js"
exports.protect = catchAsync(async (req, res, next) => {
  // 1) get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // eslint-disable-next-line no-console
  console.log('Token', token);

  if (!token) {
    return next(
      new AppError(
        'You are not logged in. Log into access',
        401,
        'authCtrl/protect'
      )
    );
  }
  // eslint-disable-next-line no-console
  console.log('Token received & exists!');

  // 2) verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // this will return a break up of JWT
  console.log(decoded);

  // 3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('User (of token) is inactive', 401, 'authCtrl/currentUser')
    );
  }

  // 4) if user change pwd, after token is issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User Password is changed', 401, 'authCtrl/currentUser-2')
    );
  }

  // 5) grant access to specfied route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  // as, roles are specified as an array
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // here, "req.user" is set via "authCtrl.protect" function
      return next(
        new AppError(
          'Do not have permission to delete',
          403,
          'authCtrl/restrictTo'
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(
        'No user selected for the provided email address',
        404,
        'authCtrl/forgotPassword'
      )
    );
  }

  // generate randon token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // this will only save token related fields by holding validations
  //console.log('resetToken >> ', resetToken);

  // send back as an email
  const resetURL = `{req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Submit a PATCH request with new PWD & PWD Confirm to ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message
    });

    res.status(200).json({
      status: 'success',
      resetToken,
      resetURL,
      message,
      user: user,
      location: 'USERS: POST api with params  [authCtrl/forgotPassword]'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Error in sending the password reset email',
        500,
        'authCtrl/forgotPassword'
      )
    );
  }
});

exports.resetPassword = (req, res, next) => {};
