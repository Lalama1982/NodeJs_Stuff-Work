/* eslint-disable no-console */
//const mongoose = require('mongoose');
const mongooseLocal = require('mongoose');

const dotenv = require('dotenv'); // need to install "dotenv"

process.on('uncaughtException', err => {
  console.log('uncaughtException! >> ', err.name, err.message);
  //console.log('uncaughtException - Full >> ', err);
  process.exit(1); //[0 - Successful Exit, 1 - Uncaught exception related exit]
});

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

console.log('DB >> ', DB);
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
  .then(() => console.log('MongoDB (Local) Connection Successful'));
//.catch(() => console.log('Error while connecting to MongoDB (Local)')); // this will hanlde the errors related to DB connection

const port = process.env.PORT || 3005; // reading from the "config.dev", if null will use 3000 (OR operation)
const server = app.listen(port, () => {
  console.log(`App running on port ${port}.....`);
});

// this is the last resort of error handling (like "WHEN OTHERS THEN")
process.on('unhandledRejection', err => {
  console.log('unhandledRejection! >> ', err.name, err.message);
  //console.log('unhandledRejection - Full >> ', err);
  server.close(() =>
    // this will allow the server to close its services, before the exit
    {
      process.exit(1); //[0 - Successful Exit, 1 - Uncaught exception related exit]
    }
  );
});

// better position be at the begining of this file, as there 3rd party references made before uncaught exceptions are listened.
/*
process.on('uncaughtException', err => {
  console.log('uncaughtException! >> ', err.name, err.message);
  //console.log('uncaughtException - Full >> ', err);
  server.close(() =>
    // this will allow the server to close its services, before the exit
    {
      process.exit(1); //[0 - Successful Exit, 1 - Uncaught exception related exit]
    }
  );
});
*/

//console.log(x); // this is an uncaught exception
