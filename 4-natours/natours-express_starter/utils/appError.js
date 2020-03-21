/* eslint-disable no-template-curly-in-string */
class AppError extends Error {
  /*
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = '${statusCode}'.startsWith('4') ? 'fail' : 'error'; // if the statusCode starts with, then return as fail
    this.isOperational = true; // this is to tag, errors created via the application

    Error.captureStackTrace(this, this.constructor);
  }
  */
  constructor(message, statusCode, location) {
    super(message);

    this.statusCode = statusCode;
    this.status = '${statusCode}'.startsWith('4') ? 'fail' : 'error'; // if the statusCode starts with, then return as fail
    this.isOperational = true; // this is to tag, errors created via the application
    //this.message = message;
    this.location = location;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
