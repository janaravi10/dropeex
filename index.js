const express = require("express"),
  fs = require("fs"),
  app = express(),
  port = 3000;

app.post("/uploadImage", (req, res) => {
  fs.mkdir(__dirname + "/hello", err => {
    if (err) throw err;
    res.send("Hello world");
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
