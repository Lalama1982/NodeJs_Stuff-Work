const EvenEmitter = require('events');
const http = require('http');

// As a class
class Sales extends EvenEmitter {
  constructor() {
    super();
  }
}

//const myEmitter = new EvenEmitter();
const myEmitter = new Sales();

myEmitter.on('newSale', () => {
  console.log('There was a new Sale - 001');
});

myEmitter.on('newSale', () => {
  console.log('There was a new Sale - 002');
});

myEmitter.on('newSale', args => {
  console.log(`Argument passed is ${args}`);
});

myEmitter.emit('newSale', 9);

/*
const mySalesEmitter = new Sales();
mySalesEmitter.on("newSaleEmi", () => {
    console.log("There was a new Sale on Class - 003")
});
mySalesEmitter.emit("newSale", 9); 
*/

//////////////////////////////////

const server = http.createServer();

server.on('request', (req, res) => {
  console.log('Request received');
  res.end('Request received');
});

server.on('request', (req, res) => {
  console.log('Another Request');
  res.end('Another Request');
});

server.on('close', () => {
  console.log('Server closed');
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Waiting for requests');
});
