const hello = 'Node.js - Index: Hello';
console.log(hello);
const fs = require('fs'); // access to file system
//reading the file, in blocking, synchronous way
console.log('reading the file, in blocking, synchronous way');
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log('textIn >> ' + textIn);
//writing to file
const textOut = `textOut with textIn from "input.txt" file: ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);
console.log('File written in synchronous way');
console.log('');
console.log('');
var data1, data2, data3;
//reading the file, in non-blocking, asynchronous way
console.log('reading the file, in non-blocking, asynchronous way');
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
    //fs.readFile('./txt/starteee.txt', 'utf-8', (err, data1) => { // (looking for wrong fileJUST TO SHOW HOW ERROR WORKS...!
    if (err) return console.log('ERROR!');
    console.log('From "start.txt" file >> ' + data1);
    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
        console.log('From second file, (specified by first file) >> ' + data2);
        fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
            console.log('From "append.txt" file >> ' + data3);
            fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
                console.log('File written in asynchronous way');
            })
        })
    })
})
/*
//writing into the file, in non-blocking, asynchronous way -- THIS does not work
console.log('writing into the file, in non-blocking, asynchronous way');
fs.writeFile('.txt/final.txt',`${data2}\n${data3}`, 'utf-8', err => {
console.log('File written in asynchronous way');
})
*/

console.log('< Since now reading in async way, this will be displayed first >');
