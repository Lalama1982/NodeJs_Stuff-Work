/* eslint-disable no-console */
const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Name must not exceed 40 characters'],
      minlength: [10, 'Name must exceed 10 or more characters']
      //validate: [validator.isAlpha, 'Tour name must only contains characters'] // this is from the library "validator"
      // for update (patch), should be "runValidators: true"  in update router (i.e. tourController.updateTour)
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: "Allowed difficulties are \\'easy', 'medium' and 'difficult'"
      }
    },
    ratingsAverage: {
      type: Number,
      default: 0
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      // because it is Number (works for dates as well), min and max could use
      min: [1, 'Ratings Quantity must be on or above 1.0'],
      max: [5, 'Ratings Quantity must be on or below 5.0']
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    // this is a custom validation on a field
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          //"this" only points to current doc on insert and not on update
          return val < this.price;
        },
        message: 'Discount ({VALUE}) should be less than price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover']
    },
    images: [String], // defined as an array
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false // this will not get selected in a query
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    // enabling virtuals to show in the model
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//USE OF VIRTUAL FIELDS
// "durationWeeks" is a virtual field
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() = "before" (and not on update)
// Equivalent to before/after triggers
// "use of "next() is important as, if o.w. controller will not pass to next step/function

// name: "pre-save" hook/middleware
tourSchema.pre('save', function(next) {
  // eslint-disable-next-line no-console
  //console.log(this);
  this.slug = slugify(this.name, { lower: true });
  console.log('Slug');
  console.log(this.slug);
  next();
});

// can set multiple hooks of same type
tourSchema.pre('save', function(next) {
  console.log('Will save document ...');
  next();
});

// name: "post-save" hook/middleware = "after"
tourSchema.post('save', function(doc, next) {
  //console.log(doc);
  next();
});

// QUERY MIDDLEWARE: this will not focus on the current doc (selected row) but on the query.
//tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  //console.log('At tourModel/preFind');
  // any function starts with "find", will execute this (i.e. findOne, findAll etc)
  // this is useful as, we use "/getTour" route with "findById" command, which will execute this as well
  // "this" represents the query in-running
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  //console.log('At tourModel/postFind');
  console.log(
    `Time took from pre-find to post-find: ${Date.now() - this.start} mSecs`
  );
  //console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  //console.log('At tourModel/preAggregate');
  console.log(this.pipeline()); // displays the grouping

  // adding another "match" condition to pipeline
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
// This will used at "tourController.js"
