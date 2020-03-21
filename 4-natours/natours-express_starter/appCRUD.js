const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json()); // to modify the body of data set as a middleware

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

/***** GET */
// using "v1" enable to handle different versions of handlers via same program. for next version of "get" could use "v2"
// to call this handler, "127.0.0.1:3000/api/v1/tours" as a GET
app.get("/api/v1/tours", (req, res) => {
  console.log("GET Body data" + req.body);
  res.status(200).json({
    status: "success",
    location: "GET api without params",
    results: toursData.length,
    data: {
      toursData //even can use as "tours: toursData"
    }
  });
});

// to query from tours
// to call this handler, "127.0.0.1: 3000/api/v1/tours/5"  as a GET
// below shown handler will give output array of { id: '5' }
// if the handler is changed like "/api/v1/tours/:id/:x" will give output array of { id: '5', x: '23' }
// "/api/v1/tours/:id/:x?" will make "x" optional, thus not required to set at the POST
app.get("/api/v1/tours/:id/:x?", (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1; // dirty js trick to convert to integer
  // checking if the ID provided exists
  if (id > toursData.length) {
    return res.status(404).json({
      status: "fail",
      location: "GET api with params",
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
    location: "GET api with params",
    //results: tour.length, // this cuases an issue if the object "tour" is not fetched i.e. due to wrong param id, hence commented
    data: {
      tour //even can use as "tours: tour"
    }
  });
});

/***** POST */
// to call this handler, "127.0.0.1:3000/api/v1/tours" as a POST with JSON object in the body to add into "tours-simple.json" file
app.post("/api/v1/tours", (req, res) => {
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
        location: "POST api without params",
        data: {
          newTour
        }
      });
    }
  );
});

/***** PATCH */
// to amend only the properties
// calling this handler: 127.0.0.1:3000/api/v1/tours/4 as a PATCH
app.patch('/api/v1/tours/:id', (req,res) => {
  if(req.params.id * 1 > toursData.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'patch failure: invalid ID'
    })
  }

  res.status(200).json({
    status: 'success',
    location: "PATCH api without params",
    data: {
      tour: '<patched tour>'
    }
  })
});

/***** DELETE */
// to amend only the properties
// calling this handler: 127.0.0.1:3000/api/v1/tours/4 as DELETE
app.delete('/api/v1/tours/:id', (req,res) => {
  if(req.params.id * 1 > toursData.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'delete failure: invalid ID'
    })
  }

  res.status(204).json({
    status: 'success',
    location: "DELETE api without params",
    data: null
  })
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}.....`);
});
