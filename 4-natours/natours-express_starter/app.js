const express = require('express');

const app = express();
const morgan = require('morgan');

// MIDDLEWARES
app.use(express.json()); // to modify the body of data set as a middleware

if (process.env.NODE_ENV === 'development') {
  // to log details as "GET /api/v1/tours 200 52.345 ms - 8897" we need this middleware
  // when executed as "npm run start:prod", this will not log
  app.use(morgan('dev')); // login related 3rd party
}

app.use(express.static(`${__dirname}/public`)); // this enables URL access to the folder "public" in the file structure
// this is an "express" feature
// hence use of "127.0.0.1:3000/overview.html" in a browser is allowed
// "overview.html" is a static file in the folder "public"
// Ex: "http://127.0.0.1:3000/img/pin.png"
// Ex: "http://127.0.0.1:3000/img/", does not work as it is not a file

//importing the error class
const AppError = require('./utils/appError');

//importing the error controller file
const globalErrorHandler = require('./controllers/errorController');

//importing the custom created js files to define handlers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// everytime a request or response is referenced, this middleware will get executed.
// next() is to move to next method in the program.
// can be of multipes of "app.use..."

// this middleware modifies a param in the request object which can be referred when the request is referred
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // eslint-disable-next-line no-console
  //console.log('HEADERS >>>>>> ', req.headers); // headers in request
  //console.log("From the deinfed middleware");
  next();
});

// compartmentalizing multiple handlers in calling different functions
// -- tours --
app.use('/api/v1/tours', tourRouter); // sort of substitute part of the URL, called mounting
app.use('/api/v1/users', userRouter); // sort of substitute part of the URL

// incase of an invalid route, sequentially it will try to match defined routes as above.
// if failed, then it will execute follow and send the response
// this must be at the very bottom of execution sequence
app.all('*', (req, res, next) => {
  //const err = new Error(`Cannot find ${req.originalUrl} on this server`);
  //err.status = 'fail';
  //err.statusCode = 404;

  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404)); // this forward to global error handling middleware (??)
});

// global error handling middleware, in "errorController.js"
// now from "next" command, error object is passed to "globalErrorHandler", hence properties are visible to "errorController.js" (??)
app.use(globalErrorHandler);

// START THE SERVER
module.exports = app;
