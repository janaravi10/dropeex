const express = require("express"),
  fs = require("fs"),
  app = express(),
  path = require("path"),
  port = process.env.PORT || 3000,
  base64Img = require("base64-img"),
  uniqid = require("uniqid");
app.use("/static", express.static(path.join(__dirname, "image")));
app.use(express.json({ limit: "50mb" }));
app.post("/uploadImage", (req, res) => {
  if (!fs.existsSync(__dirname + "/image/" + req.body.image.productId)) {
    fs.mkdir(__dirname + "/image/" + req.body.image.productId, processImage);
  } else {
    deleteFolderRecursive(__dirname + "/image/" + req.body.image.productId);
    fs.mkdir(__dirname + "/image/" + req.body.image.productId, processImage);
  }
  //   req.body.image.forEach(element => {});
  function processImage() {
    var object = { default: [] };
    req.body.image.default.forEach(element => {
      object.default.push(
        base64Img.imgSync(
          element,
          __dirname + "/image/" + req.body.image.productId,
          uniqid() + ""
        )
      );
    });
    object.variants = req.body.image.variants.map(element => {
      var objName = {};
      for (const key in element) {
        objName[key] = base64Img.imgSync(
          element[key],
          __dirname + "/image/" + req.body.image.productId,
          uniqid() + ""
        );
      }
      return objName;
    });
    res.send(object);
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
function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
