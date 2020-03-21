const fs = require('fs');
const Tour = require('./../models/tourModel');

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// rather than validating individually, when the request is made, in general it is validated
exports.checkID = (req, res, next, val) => {
  console.log(`Tour ID passed (at tourController.js) is ${val}`);
  // moved into a seperate function "checkID"
  if (req.params.id * 1 > toursData.length) {
    return res.status(404).json({
      status: 'fail',
      location: 'common fuction checkID',
      message: '(common) failure: invalid ID'
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log('GET Body data' + req.body);
  res.status(200).json({
    status: 'success',
    location: 'GET api without params [getAllTours]',
    requestedTime: req.requestTime, // this is enabled by the use of middleware defined on top
    results: toursData.length,
    data: {
      toursData //even can use as "tours: toursData"
    }
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1; // dirty js trick to convert to integer
  /*  
  // moved into a seperate function "checkID"   
  
  // checking if the ID provided exists
  if (id > toursData.length) {
    return res.status(404).json({
      status: "fail",
      location: "GET api with params [getTour]",
      //results: tour.length, // this cuases an issue if the object "tour" is not fetched i.e. due to wrong param id, hence commented
      data: "Invalid ID"
    });
  }
  */
  const tour = toursData.find(el => el.id === id); // filter out a set, which matches "id" specified by req.params

  /* does not work 
    const tt = tour.length;
    console.log("tt >> " + tt);
    */

  res.status(200).json({
    status: 'success',
    location: 'GET api with params [getTour]',
    //results: tour.length, // this causes an issue if the object "tour" is not fetched i.e. due to wrong param id, hence commented
    data: {
      tour //even can use as "tours: tour"
    }
  });
};

exports.createTour = (req, res) => {
  console.log('POST Body data' + req.body); // requires enabling of "express.json()"
  // will display the contents POST via the body

  const newId = toursData[toursData.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  toursData.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(toursData),
    err => {
      res.status(201).json({
        status: 'success',
        location: 'POST api without params [createTour]',
        data: {
          newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  /*  
    // moved into a seperate function "checkID"      
    if (req.params.id * 1 > toursData.length) {
      return res.status(404).json({
        status: "fail",
        location: "PATCH api without params [updateTour]",
        message: "patch failure: invalid ID"
      });
    }
    */

  res.status(200).json({
    status: 'success',
    location: 'PATCH api without params',
    data: {
      tour: '<patched tour>'
    }
  });
};

exports.deleteTour = (req, res) => {
  /*  
    // moved into a seperate function "checkID"
    if (req.params.id * 1 > toursData.length) {
        return res.status(404).json({
          status: "fail",
          location: "DELETE api without params [deleteTour]",
          message: "delete failure: invalid ID"
        });
      };
    */
  res.status(204).json({
    status: 'success',
    location: 'DELETE api without params [deleteTour]',
    data: null
  });
};
