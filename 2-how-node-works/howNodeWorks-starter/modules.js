//console.log(arguments);
//console.log(require('module').wrapper);

// importing a Class from a module in a js file "test-module-1"
const C = require("./test-module-1");
const calc1 = new C();
console.log("From test-module-1 >> " + calc1.add(2, 5));

// another importing
const calc2 = require("./test-module-2");
console.log("From test-module-2 >> " + calc2.multiply(3, 8));

// another importing
const { add, multiply, divide } = require("./test-module-2");
console.log("From test-module-2 (as a construct) >> " + multiply(4, 8));

//caching
require("./test-module-3")();

require("./test-module-3")();
require("./test-module-3")();
/*
Hello from test-module-3 >>> this is showed only once, as module is called only once
>> but below is shown 3 times because of the caching
Exporting from test-module-3 
Exporting from test-module-3
Exporting from test-module-3
*/
