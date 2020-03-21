/* eslint-disable no-console */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // here "query" is an object of "Tour.find()", which is a queried data-set via the "Tour" model
  // "queryString" is an object of "req.query", which is the query string received via the router

  filter() {
    const queryObj = { ...this.queryString }; // instead of "{ ...req.query };"

    // If logged as below, via the URL > "127.0.0.1:3000/api/v1/tours?duration=5&difficulty=easy" is called then ...
    //    { duration: '5', difficulty: 'easy' } " will be showed in the console.
    // eslint-disable-next-line no-console
    console.log('filter()', 'queryObj (bef) >> ', queryObj);

    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);
    console.log('filter()', 'queryObj (aft) >> ', queryObj);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // prefixing $ to operators,

    this.query.find(JSON.parse(queryStr)); // instead of "let query = Tour.find(JSON.parse(queryStr));""
    //console.log("filter()","this.queryString (ret) >> ",this.queryString);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // instead of "(req.query.sort)"
      const sortBy = this.queryString.sort.split(',').join(' '); // instead of "req.query.sort.split(',').join(' ');"
      console.log('Sorting line >> ', sortBy); // result: -price -ratingsAverage

      this.query = this.query.sort(sortBy);
    } else {
      // setting a default sorting condition
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      //instead of (req.query.fields) {
      const fields = this.queryString.fields.split(',').join(' '); // instead of "req.query.fields.split(',').join(' ');"
      console.log('Specified fields >> ', fields); // result: name duration difficulty price
      this.query = this.query.select(fields); //instead of "query = query.select(fields);"
      // if append & run "?fields=name,duration,difficulty,price", then only those columns will be showed.
      // "?fields=-name,-duration" >> this will show all the other except for these specified columns
    } else {
      // this is the default of "selecting of fields"
      // fields starting with "__v" are ignored (they are mongoDB specific fields)
      this.query = this.query.select('-__v'); //instead of "query = query.select('-__v');"
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // by default needs 1
    const limit = this.queryString.limit * 1 || 1;
    // if # records/page = 10, request is for 3rd page, then need to skip 20 pages, to be at 3rd page
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // removes as need to bring the "Tour", hence might built unnecessary dependancy
    //if (this.queryString.page) {
    //const numTours = await Tour.countDocuments(); // like "count(*)"
    //if (skip >= numTours) throw new Error('This page does not exist'); // directs to the "catch" for error handling
    //}

    return this;
  }
}

module.exports = APIFeatures;
