/* eslint-disable no-console */
const AppError = require('./../utils/appError');

// this will handle, invalid paths with IDs, not exist & not match the "id" format
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  // eslint-disable-next-line new-cap
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  /**
   * Incase of a duplication error, following will be shown
        Error:  { driver: true,
        name: 'MongoError',
        index: 0,
        code: 11000,
        keyPattern: { name: 1 },
        keyValue: { name: 'The Forest Hiker' },
        errmsg:
        'E11000 duplicate key error collection: natours.tours index: name_1 dup key: { name: "The Forest Hiker" }',
        statusCode: 500,
        status: 'error',
        [Symbol(mongoErrorContextSymbol)]: {} }
   * Here, error is captured by considering the "code: 11000"
   */

  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  // eslint-disable-next-line no-console
  console.log(value);
  const message = `Duplicate field value: ${value}. Please another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  /**
 * Following is the format of the "err" (or "error") object.
 *     "error": {
        "errors": {
            "name": {
                "message": "Name must exceed 10 or more characters",
                ..
            },
            "difficulty": {
                "message": "Allowed difficulties are \\'easy', 'medium' and 'difficult'",
                ..
                },
                "kind": "enum",
                "path": "difficulty",
                "value": "whatever"
            }
        }
 * from the loop down here, it tries to capture "message" and pass it as an array
 */
  const errors = Object.values(err.errors).map(el =>
    el.message.replace(/[^a-zA-Z0-9 ]/, '')
  );
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid Token. Log in again!', 401, 'errrCtrl/handleJWTError');

const handleJWTExpiredError = () =>
  new AppError(
    'Expired token. Login in again',
    401,
    'errrCtrl/handleJWTExpiredError'
  );

const sendErrorDevl = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    location: `${err.location}/_sendErrorDevl`
  });
};

const sendErrorProd = (err, res) => {
  // distinguishing the error based on application or not
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      location: `${err.location}/_endErrorProd`
    });
  } else {
    // eslint-disable-next-line no-console
    console.error('Error: ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevl(err, res);
  } else if (process.env.NODE_ENV.trimLeft().trimRight() === 'production') {
    let error = { ...err };

    if (err.name.trimLeft().trimRight() === 'CastError') {
      // this will handle, invalid paths with IDs, not exist & not match the "id" format
      error = handleCastErrorDB(error);
    }

    let vErrCode = (err.code || 'error').toString();
    vErrCode = vErrCode.trim().replace(/[^0-9]/, '');
    if (vErrCode === '11000') {
      // handles duplicate error
      error = handleDuplicateFieldsDB(error);
    }

    if (err.name.trimLeft().trimRight() === 'ValidationError') {
      // this will handle, invalid paths with IDs, not exist & not match the "id" format
      error = handleValidationErrorDB();
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }
    //console.log('error.message >>> ', error.message);
    sendErrorProd(error, res);
  }
};
