// URL to use: 127.0.0.1:3000/api/v1/tours/getToursbyMongooseQuery?difficulty=easy&price[lte]=1500&sort=location&fields=name,duration,difficulty,price

const fs = require('fs');
const Tour = require('./../models/tourModel');

// rather than validating individually, when the request is made, in general it is validated
// "exports.checkID" is removed. Available at "tourController_wout_DBImpl.js"
// "exports.checkBody" is removed.

// this sets mentioned param values when called to the query.
// "next" will make the controller to be passed to next execution point, in reffered code
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    console.log('GET Body data' + req.body);
    const toursData = await Tour.find(); // will return all records

    res.status(200).json({
      status: 'success',
      location: 'GET api without params [getAllTours]',
      requestedTime: req.requestTime, // this is enabled by the use of middleware defined on top
      results: toursData.length,
      data: {
        toursData //even can use as "tours: toursData"
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'getAllTours-fail',
      message: err
    });
  }
};

exports.getToursbyMongooseQuery = async (req, res) => {
  try {
    console.log('GET Body data' + req.body);

    // filtering of requests
    /** hardcoded method 
    const toursData = await Tour.find({
      duration: 5,
      difficulty: 'easy'
    });
    */

    /** // this is similar to "duration = 5 AND difficulty = 'easy' "
    const toursData = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');
    */

    // const toursData = await Tour.find(); // will return all records

    const queryObj = { ...req.query };
    /**
     * effect of above logging.
     * If the URL > "127.0.0.1:3000/api/v1/tours?duration=5&difficulty=easy" is called then ...
     * " { duration: '5', difficulty: 'easy' } " will be showed in the console.
     */
    console.log(req.query);
    console.log('queryObj before exclusion >> ', queryObj);
    // URL might contain other params like "page", "sort" which are not fields of the object ..\
    // ... hence need to remove them
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);
    console.log('queryObj after exclusion >> ', queryObj);

    // adding operator based selection
    // called URL is "127.0.0.1:3000/api/v1/tours/getToursbyMongooseQuery?duration[gte]=5&difficulty=easy&price[lte]=1500&sort=location&limit=10"
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // prefixing $ to operators, to pass it to mongoose commands
    console.log('queryStr after $ added', JSON.parse(queryStr));

    /**
     * Below wil not give the flexibility to change the query(i.e. sort etc)
     * const toursData = await Tour.find(queryObj);
     */

    // build the query
    let query = Tour.find(JSON.parse(queryStr));

    // adding sorting
    // append ["?sort=-price" or "?sort=price"] or ["?sort=-price,ratingsAverage" or "?sort=price,-ratingsAverage"] to the end
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log('Sorting line >> ', sortBy); // result: -price -ratingsAverage
      //query = query.sort(req.query.sort); // for single sorting param
      query = query.sort(sortBy);
    } else {
      // setting a default sorting condition
      query = query.sort('-createdAt');
    }

    // selecting specific fileds
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      console.log('Specified fields >> ', fields); // result: name duration difficulty price
      query = query.select(fields);
      // if append & run "?fields=name,duration,difficulty,price", then only those columns will be showed.
      // "?fields=-name,-duration" >> this will show all the other except for these specified columns
    } else {
      // this is the default of "selecting of fields"
      // fields starting with "__v" are ignored (they are mongoDB specific fields)
      query = query.select('-__v');
    }

    // pagination
    //?page=2&limit=10 >s> [1-10] = page1 and [11-20] = page2 and [21-30] = page3
    const page = req.query.page * 1 || 1; // by default needs 1
    const limit = req.query.limit * 1 || 1;
    // if # records/page = 10, request is for 3rd page, then need to skip 20 pages, to be at 3rd page
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments(); // like "count(*)"
      if (skip >= numTours) throw new Error('This page does not exist'); // directs to the "catch" for error handling
    }

    // execute the query
    const toursData = await query;

    res.status(200).json({
      status: 'success',
      location: 'GET api without params [getToursbyMongooseQuery]',
      requestedTime: req.requestTime, // this is enabled by the use of middleware defined on top
      results: toursData.length,
      data: {
        toursData //even can use as "tours: toursData"
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'getToursbyMongooseQuery-fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  //without DB implementations, check the file "tourController_wout_DBImpl.js"
  try {
    const tour = await Tour.findById(req.params.id);
    // use of "findOne" >> Tour.findOne({_id: req.params.id})

    res.status(200).json({
      status: 'success',
      location: 'GET api with params [getTour]',
      //results: tour.length, // this cuases an issue if the object "tour" is not fetched i.e. due to wrong param id, hence commented
      data: {
        tour //even can use as "tours: tour"
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'getTours-fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  console.log('POST Body data' + req.body); // requires enabling of "express.json()"
  // will display the contents POST via the body
  // in order to resolve issue of NodeJS and async, at the "env" file "engines" is specified

  try {
    /* // earlier
  const newTour = new Tour({}); // no arguments means, a blank "tour" record/document
  newTour.save();
  */
    const newTour = await Tour.create(req.body);

    // temporarily
    res.status(201).json({
      status: 'success',
      location: 'POST api without params [createTour]',
      data: {
        newTour
      }
    });

    /*temporarily
    const newId = toursData[toursData.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    toursData.push(newTour);
  
    fs.writeFile(
      `${__dirname}/../dev-data/data/tours-simple.json`,
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
    );*/
  } catch (err) {
    res.status(400).json({
      status: 'createTour - fail',
      message: err //'Invalid Data passed'
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true // this will execute the validations in the model
    });

    res.status(200).json({
      status: 'success',
      location: 'PATCH api without params',
      data: {
        tour: tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'updateTour - fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id); // no data is sent back when a deletion occur

    res.status(204).json({
      status: 'success',
      location: 'DELETE api without params [deleteTour]',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'deleteTour - fail',
      message: err
    });
  }
};
