/* eslint-disable no-console */
const mongoose = require('mongoose');
const mongooseLocal = require('mongoose');

const dotenv = require('dotenv'); // need to install "dotenv"

dotenv.config({ path: './config.env' }); // this will read "config.env" file and add the variables to "process.env"
// now "app.js"  uses values from "config.env", hence before running the "app.js",
// ... it is needed to be added to path
const app = require('./app');

//console.log(app.get('env'));
//console.log(process.env); // will display all the env variables

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//console.log("DB > "+DB);

// Connecting to Atlas (cloud) DB
/* // no connection via office network
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log("DB (Cloud) Connection Successful"));
*/
//-- another way
//    .then(con => {
//    console.log(con.connections);
//    console.log('DB Connection Done');
//    });

// Connectiong to local DB (check whether it is up..!)
mongooseLocal
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB (Local) Connection Successful'));

/*
// moved to models/tourModel.js
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"]
  }
});

// here even though specifed as "Tour", when checked in DB collection is recorded as "Tours"
const Tour = mongoose.model('Tour', tourSchema);
*/

/* 
// needed for testing at "server.js" file
const testTour = new Tour({
  name: 'The Forest Hiker 3',
  rating: 4.7,
  price: 497
});

testTour.save().then(doc => {
  console.log(doc);
}).catch(err => {console.log('Error: ', err)});
*/

const port = process.env.PORT || 3005; // reading from the "config.dev", if null will use 3000 (OR operation)
app.listen(port, () => {
  console.log(`App running on port ${port}.....`);
});
