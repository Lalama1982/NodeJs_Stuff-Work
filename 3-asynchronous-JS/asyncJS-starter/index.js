const fs = require('fs');
const superagent = require('superagent');

const readFilePromises = file => {
  return new Promise((resolve, reject) => {
    // "resolve" & "reject" resembles, 2 functions
    fs.readFile(file, (err, data) => {
      if (err) reject('Error in reading the file');
      resolve(data);
    });
  });
};

const writeFilePromises = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) reject('Error in writing the file');
      resolve('success');
    });
  });
};

var resData;

readFilePromises(`${__dirname}/dog.txt`)
  .then(resultData => {
    resData = resultData;
    console.log(`[reading] Breed: ${resultData}`);
    return superagent.get(`https://dog.ceo/api/breed/${resultData}/images/random`);
  })
  .then(res => {
    // only fulfilled promises
    console.log('[via Promises/reading] body message: ' + res.body.message);
    return writeFilePromises('dog-image.txt', res.body.message);
  })
  .then(() => {
    console.log(`[via Promises/writing] after writing: Random dog image of ${resData} is saved to file`);//"of ${resultData}" resultData is not visible here
  })
  .catch(err => {
    // failed promises
    console.log('[via Promises(reading/writing)]' + err);
  });

// This set-up of call-backs is called "Call-Back Hell"
/*
fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
  console.log(`Breed: ${data}`);
  superagent
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .then(res => { // only fulfilled promises
      console.log(res.body.message);

      fs.writeFile('dog-image.txt', res.body.message, err => {
        console.log(`Random dog image of ${data} is saved to file`);
      });
    }).catch(err => { // failed promises
        console.log(err.message);
    });
});
*/
