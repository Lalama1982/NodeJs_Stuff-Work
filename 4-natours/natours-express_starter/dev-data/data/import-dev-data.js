const fs = require('fs');
//const mongoose = require('mongoose');
const mongooseLocal = require('mongoose');
const dotenv = require('dotenv'); // need to install "dotenv"

const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' }); // this will read "config.env" file and add the variables to "process.env"

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connecting to Atlas (cloud) DB
/* // no connection via office network
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log("DB (Cloud) Connection Successful"));
*/
// Connectiong to local DB (check whether it is up..!)
mongooseLocal
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB (Local) Connection Successful'));

// reading the JSON file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8') // cannot use "./tours-simple.json" as "./" means the root project folder
  // ${__dirname} >> current (sub) directory
);

// import data into DB
const importData = async () => {
  try {
    await Tour.create(tours); // "create" is built in function of mongoose
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete all from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // eslint-disable-next-line no-console
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  // if executed as follows, "node dev-data/data/import-dev-data.js --import"
  importData();
} else if (process.argv[2] === '--delete') {
  // if executed as follows, "node dev-data/data/import-dev-data.js --delete"
  deleteData();
}

console.log(process.argv);
