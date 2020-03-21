const fs = require("fs");
const crypto = require("crypto");

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 4; // default is 4, but can change

setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile("test-file.txt", () => {
  console.log("I/O finished");

  setTimeout(() => console.log("Timer 2 finished"), 0);
  setTimeout(() => console.log("Timer 3 finished"), 1500);
  setImmediate(() => console.log("Immediate 2 finished"));
  process.nextTick(() => console.log("Process.nextTick"));

  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "(Sync) Password encrypted");

  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
});

console.log("Hello from the top-level code");

/*
order in which statements get executed
----------------------------------------
Hello from the top-level code
Timer 1 finished
Immediate 1 finished
I/O finished
1144 '(Sync) Password encrypted'
Process.nextTick
Immediate 2 finished
Timer 2 finished (after 3secs below command is executed)
Timer 3 finished
2348 'Password encrypted'
2420 'Password encrypted'
2425 'Password encrypted'
2436 'Password encrypted'
*/
