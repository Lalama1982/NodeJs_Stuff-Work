const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

/* eslint-disable no-console */
exports.getAllUsers = catchAsync(async (req, res, next) => {
  console.log(`[getAllUsers] GET Body data${req.body}`);
  const userData = await User.find(); // query will get executed and return all records

  res.status(200).json({
    status: 'success',
    location: 'GET api without params [getAllUsers]',
    requestedTime: req.requestTime, // this is enabled by the use of middleware defined on top
    results: userData.length,
    data: {
      userData //even can use as "tours: toursData"
    }
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
    location: 'USERS: POST api without params  [createUser]'
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
    location: 'USERS: GET api without params  [getUser]'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
    location: 'USERS: PATCH api without params  [updateUser]'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
    location: 'USERS: DELETE api without params  [deleteUser]'
  });
};
