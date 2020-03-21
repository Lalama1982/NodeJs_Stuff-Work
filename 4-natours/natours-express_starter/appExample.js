const express = require("express");

const app = express();

app.get("/", (req, res) => {
  //res.status(200).send('Response#1 from Server');
  res
    .status(200)
    .json({ message: "GET - Response from Server [01]", app: "Natours" });
});

app.post("/", (req, res) => {
  res
    .status(200)
    .json({ message: "POST - Response from Server [02]", app: "Natours" });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}.....`);
});
