const express = require('express');

const router = express.Router();

// all the handlers (getAllTours ...) are been moved to "tourController.js"
const tourController = require('./../controllers/tourController');
// Another way; const {getAllTours....} = require('./../controllers/tourController');

const authController = require('./../controllers/authController');

router.param('id', (req, res, next, val) => {
  // eslint-disable-next-line no-console
  console.log(`Tour ID (from tourRoutes.js) is ${val}`);
  next();
});

// router.param('id',tourController.checkID); < checkID function is no longer available >

// routing is done via an alias (short cut selection)
// "aliasTopTours" is a function in "tourController" where it sets query param before hand
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getToursbyMongooseQuery);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  // 1st "protect" middleW will execute and then "getAllTours"
  // in the post, a header value set as "Authorization", with value be like "Bearer <Token>"

  //.post(tourController.checkBody, tourController.createTour);
  .post(tourController.createTour);

router
  .route('/getToursbyMongooseQuery')
  .get(tourController.getToursbyMongooseQuery);

router
  .route('/:id/:x?')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
