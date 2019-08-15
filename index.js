const express = require("express"),
  fs = require("fs"),
  app = express(),
  port = process.env.PORT || 3000;

app.post("/uploadImage", (req, res) => {
    
  if (!fs.existsSync(__dirname + "/hello")) {
    fs.mkdir(__dirname + "/hello", err => {
      if (err) throw err;
      var data = "New File Contents";

      fs.writeFile(__dirname + "/hello/temp.txt", data, err => {
        if (err) console.log(err);
        res.send("Successfully Written to File.");
      });
    });
  }else{
      res.send("FOLDER EXIST")
  }
});
app.get("/getImage", (req, res) => {
  fs.readFile(__dirname + "/hello/temp.txt", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    }
    res.send(data);
    console.log(data);
  });
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
