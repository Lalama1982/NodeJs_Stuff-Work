/* eslint-disable no-console */
// URL to use: 127.0.0.1:3000/api/v1/tours/getToursbyMongooseQuery?difficulty=easy&price[lte]=1500&sort=location&fields=name,duration,difficulty,price

const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
// rather than validating individually, when the request is made, in general it is validated
// "exports.checkID" is removed. Available at "tourController_wout_DBImpl.js"
// "exports.checkBody" is removed.

exports.getAllTours = async (req, res) => {
  try {
    console.log(`GET Body data ${req.body}`);
    const toursData = await Tour.find(); // query will get executed and return all records

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
  console.log(`POST Body data${req.body}`); // requires enabling of "express.json()"
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

// this sets mentioned param values when called to the query.
// "next" will make the controller to be passed to next execution point, in reffered code
// to execute "127.0.0.1:3000/api/v1/tours/top-5-cheap", along with this, "getToursbyMongooseQuery" is called afterwards
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getToursbyMongooseQuery = async (req, res) => {
  try {
    console.log(`GET Body data${req.body}`);

    // execute the query
    // "APIFeatures" is defined an a seperate file and imported
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const toursData = await features.query; // query gets executed

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

// aggregation pipeline implementation (similar to grouping/char functions)
// get called as "127.0.0.1:3000/api/v1/tours/tour-stats"
// this whole set is one big selection criteria
// as name depicts, each "group"(i.e. $match etc), performs the respective aggregation on the data set
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 0 } } // this will 2st filter "ratingsAverage"s gte to 4.5
      },
      {
        // below groups according to "_id" value, which is a field in the data set
        $group: {
          //_id: null, // this denoted, no field binds to grouping
          //_id: '$ratings', // grouped on field "ratings"
          //_id: '$difficulty',
          _id: { $toUpper: '$difficulty' }, // value of the grouped field is converted to capital
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        // this sorts the data-set as specfied
        // but need to specify the new fields of this result set, like in a "having by" clause
        $sort: { avgPrice: -1 } // 1: asc, -1: desc
      }
      /*
      {
        $match: {
          _id: { $ne: 'EASY' } // not-select when "id" value in "$group" is "EASY"
        }
      }
      */
    ]);

    res.status(200).json({
      status: 'success',
      location: 'GET api without params [getTourStats]',
      requestedTime: req.requestTime, // this is enabled by the use of middleware defined on top
      results: stats.length,
      data: {
        stats //even can use as "tours: toursData"
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'getTourStats-fail',
      message: err
    });
  }
};

// get called as "127.0.0.1:3000/api/v1/tours/monthly-plan/2021"
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    console.log('Year >> ', year);
    const plan = await Tour.aggregate([
      {
        // DB has multiple dates for single record
        // below will pivot the record for each start date
        $unwind: '$startDates'
      },
      {
        // select records only based on below interval
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' }, // groping by startdates
          numTourStarts: { $sum: 1 }, // this is equal to count(*)
          tours: { $push: '$name' } // adding a field to show
        }
      },
      {
        $addFields: { month: '$_id' } // adding a field to show
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: 1 }
      },
      {
        $limit: 6
      }
    ]);

    res.status(200).json({
      status: 'success',
      location: 'GET api without params [getMonthlyPlan]',
      requestedTime: req.requestTime, // this is enabled by the use of middleware defined on top
      results: plan.length,
      data: {
        plan //even can use as "tours: toursData"
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'getMonthlyPlan-fail',
      message: err
    });
  }
};
