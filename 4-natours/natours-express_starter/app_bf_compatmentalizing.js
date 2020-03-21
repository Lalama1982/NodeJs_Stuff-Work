/* eslint-disable import/newline-after-import */
const express = require('express');
//const fs = require('fs');
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

//importing the custom created js files to define handlers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// everytime a request or response is referenced, this middleware will get executed.
// next() is to move to next method in the program.
// can be of multipes of "app.use..."
/*
app.use((req, res, next) => {
  console.log('From the defined middleware');
  next();
});
*/

// this middleware modifies a param in the request object which can be referred when the request is referred
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log("From the deinfed middleware");
  next();
});

// ROUTE HANDLERS
// getAllTours etc are moved to "tourRouters.js"
// getAllUsers etc are moved to "userRouters.js"

// ROUTES
//app.get("/api/v1/tours", getAllTours); /***** GET */
//app.get("/api/v1/tours/:id/:x?",getTour); /***** GET */
//app.post("/api/v1/tours", createTour); /***** POST */
//app.patch('/api/v1/tours/:id', updateTour); /***** PATCH */
//app.delete('/api/v1/tours/:id',deleteTour); /***** DELETE */

// compartmentalizing multiple handlers in calling different functions
// -- tours --
//const tourRouter = express.Router(); // moved to "tourRouters.js"
app.use('/api/v1/tours', tourRouter); // sort of substitute part of the URL, called mounting

//const userRouter = express.Router(); // moved to "userRouters.js"
app.use('/api/v1/users', userRouter); // sort of substitute part of the URL

/*
// moved to "tourRouters.js"
tourRouter
  .route("/")
  .get(getAllTours)
  .post(createTour);
tourRouter
  .route(":id/:x?")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);
*/

// -- users --
/*
// moved to "tourRouters.js"
userRouter
  .route("/")
  .get(getAllUsers)
  .post(createUser);
userRouter
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);
*/

// START THE SERVER
module.exports = app;
// now the starting page will be "server.js", hence as above "app" is passed to "server.js"
/*
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}.....`);
});
*/
