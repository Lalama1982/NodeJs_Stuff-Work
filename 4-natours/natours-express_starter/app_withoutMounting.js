const express = require("express");
const fs = require("fs");
const app = express();
const morgan = require("morgan");

// MIDDLEWARES
app.use(express.json()); // to modify the body of data set as a middleware
app.use(morgan("dev")); // login related 3rd party

// everytime a request or response is referenced, this middleware will get executed.
// next() is to move to next method in the program.
app.use((req, res, next) => {
  console.log("From the defined middleware");
  next();
});

// this middleware modifies a param in the request object which can be referred when the request is referred
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log("From the deinfed middleware");
  next();
});

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// ROUTE HANDLERS
const getAllTours = (req, res) => {
  console.log("GET Body data" + req.body);
  res.status(200).json({
    status: "success",
    location: "GET api without params [getAllTours]",
    requestedTime: req.requestTime, // this is enabled by the use of middleware defined on top
    results: toursData.length,
    data: {
      toursData //even can use as "tours: toursData"
    }
  });
};

const getTour = (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1; // dirty js trick to convert to integer
  // checking if the ID provided exists
  if (id > toursData.length) {
    return res.status(404).json({
      status: "fail",
      location: "GET api with params [getTour]",
      //results: tour.length, // this cuases an issue if the object "tour" is not fetched i.e. due to wrong param id, hence commented
      data: "Invalid ID"
    });
  }
  const tour = toursData.find(el => el.id === id); // filter out a set, which matches "id" specified by req.params

  /* does not work 
  const tt = tour.length;
  console.log("tt >> " + tt);
  */

  res.status(200).json({
    status: "success",
    location: "GET api with params [getTour]",
    //results: tour.length, // this cuases an issue if the object "tour" is not fetched i.e. due to wrong param id, hence commented
    data: {
      tour //even can use as "tours: tour"
    }
  });
};

const createTour = (req, res) => {
  console.log("POST Body data" + req.body); // requires enabling of "express.json()"
  // will display the contents POST via the body

  const newId = toursData[toursData.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  toursData.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(toursData),
    err => {
      res.status(201).json({
        status: "success",
        location: "POST api without params [createTour]",
        data: {
          newTour
        }
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > toursData.length) {
    return res.status(404).json({
      status: "fail",
      location: "PATCH api without params [updateTour]",
      message: "patch failure: invalid ID"
    });
  }

  res.status(200).json({
    status: "success",
    location: "PATCH api without params",
    data: {
      tour: "<patched tour>"
    }
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > toursData.length) {
    return res.status(404).json({
      status: "fail",
      location: "DELETE api without params [deleteTour]",
      message: "delete failure: invalid ID"
    });
  }

  res.status(204).json({
    status: "success",
    location: "DELETE api without params [deleteTour]",
    data: null
  });
};

const getAllUsers = (req, res) => {
  console.log("[getAllUsers] GET Body data" + req.body);
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
    location: "USERS: GET api without params  [getAllUsers]"
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
    location: "USERS: POST api without params  [createUser]"
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
    location: "USERS: GET api without params  [getUser]"
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
    location: "USERS: PATCH api without params  [updateUser]"
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
    location: "USERS: DELETE api without params  [deleteUser]"
  });
};

// ROUTES
//app.get("/api/v1/tours", getAllTours); /***** GET */
//app.get("/api/v1/tours/:id/:x?",getTour); /***** GET */
//app.post("/api/v1/tours", createTour); /***** POST */
//app.patch('/api/v1/tours/:id', updateTour); /***** PATCH */
//app.delete('/api/v1/tours/:id',deleteTour); /***** DELETE */

// compartmentalizing multiple handlers in calling different functions
// -- tours --
app
  .route("/api/v1/tours")
  .get(getAllTours)
  .post(createTour);
app
  .route("/api/v1/tours/:id/:x?")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// -- users --
app
  .route("/api/v1/users")
  .get(getAllUsers)
  .post(createUser);
app
  .route("/api/v1/users/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// START THE SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}.....`);
});
