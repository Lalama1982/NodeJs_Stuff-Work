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
    const resAwaitData = await readFilePromises(`${__dirname}/dog.txt`);
    console.log(`[reading] Breed: ${resAwaitData}`);

    const res1Promise = superagent.get(
      `https://dog.ceo/api/breed/${resAwaitData}/images/random`
    );

    const res2Promise = superagent.get(
      `https://dog.ceo/api/breed/${resAwaitData}/images/random`
    );

    const res3Promise = superagent.get(
      `https://dog.ceo/api/breed/${resAwaitData}/images/random`
    );

    const all = await Promise.all([res1Promise, res2Promise, res3Promise]);
    const imgs = all.map(el => el.body.message);
    console.log('imgs >> ' + imgs);

    //console.log('[via Await/Promises] body message: ' + all.body.message); // not possible

    await writeFilePromises('dog-image.txt', imgs.join('\n'));
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
