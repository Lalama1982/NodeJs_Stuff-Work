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

// "await" key word provides an alternative to "then" clause in normal promises
const getDogPic = async () => {
  try {
    const resAwaitData = await readFilePromises(`${__dirname}/dogx.txt`);
    console.log(`[reading] Breed: ${resAwaitData}`);
    const res = await superagent.get(
      `https://dog.ceo/api/breed/${resAwaitData}/images/random`
    );
    console.log('[via Await/Promises] body message: ' + res.body.message);

    await writeFilePromises('dog-image.txt', res.body.message);
    console.log(
      `[via Await/Promises] after writing: Random dog image of ${resAwaitData} is saved to file`
    );
  } catch (err) {
    console.log('[via Await/Promises(reading/writing)]' + err);
    throw err; // This throw will execute the catch error of the actual call of the function (refer "ERROR ***")
  }
  return 'From AsyncFunc';
};

(async () => {
  try {
    console.log('Step01[async]: Before calling the Async Function "getDogPic"');
    const x = await getDogPic();
    console.log('[AsyncFunc]' + x);
    console.log('Step02[async]: After displaying the return from "getDogPic"');
  } catch (err) {
    console.log('ERROR ***');
  }
})();

/*
console.log('Step01: Before calling the Async Function "getDogPic"');
//
 /// const x = getDogPic();
 /// console.log(x); // Output: Promise { <pending> } >> Async by default returns a promise
//
getDogPic()
  .then(x => {
    console.log(x);
    console.log('Step02: After displaying the return from "getDogPic"');
    //order of output >>
      // Step01
      // <Stuff from "getDogPic">
      // From AsyncFunc
      // Step02
  })
  .catch(err => {
    console.log('ERROR ***');
  });
*/
/*
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
*/

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
