const express = require("express"),
  fs = require("fs"),
  app = express(),
  path = require("path"),
  port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080, //For open shift added env variable
  // ip = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1",
  base64Img = require("base64-img"),
  uniqid = require("uniqid"),
  cors = require("cors");
app.use(cors());
app.use("/static", express.static(path.join(__dirname, "image")));
app.use(express.json({
  limit: "100mb"
}));
app.use(express.urlencoded({
  limit: "100mb",
  extended: false
}));
// CHecking code
app.get("/CHECKUNINSTALL", (req, res) => {
  res.send("NO");
});
app.get("/uploadImage", (req, res) => {
  res.send({
    res: "Just checking if this is working."
  });
});


app.post("/uploadImage", (req, res) => {
  if (!req.body) res.sendStatus(501).send("No request body");
  if (!fs.existsSync(__dirname + "/image/" + req.body.image.productId)) {
    fs.mkdir(__dirname + "/image/" + req.body.image.productId, processImage);
  } else {
    deleteFolderRecursive(__dirname + "/image/" + req.body.image.productId);
    fs.mkdir(__dirname + "/image/" + req.body.image.productId, processImage);
  }
  //   req.body.image.forEach(element => {});
  //  function processImage() {
  //    var object = {
  //      default: []
  //    };
  //    req.body.image.default.forEach(element => {
  //      object.default.push(
  //        base64Img.imgSync(
  //          element,
  //          __dirname + "/image/" + req.body.image.productId,
  //          uniqid() + ""
  //        )
  //      );
  //    });
  //    if (req.body.image.variants) {
  //      object.variants = req.body.image.variants.map(element => {
  //        var objName = {};
  //        for (const key in element) {
  //          objName[key] = base64Img.imgSync(
  //            element[key],
  //            __dirname + "/image/" + req.body.image.productId,
  //            uniqid() + ""
  //          );
  //        }
  //        return objName;
  //      });
  //    }

  //    res.send(object);
  //  }
  //   req.body.image.forEach(element => {});
  function processImage() {
    var object = {
      default: []
    };
    Promise.all(req.body.image.default.map(element => {
      return new Promise((resolve, reject) => {
        base64Img.img(
          element,
          __dirname + "/image/" + req.body.image.productId,
          uniqid() + "", (err, filePath) => resolve(filePath))
      })
    })).then(result => {
      // getting the result of the image default and concating it int he 
      // object 
      object.default = result;
      // console.log(object);
      if (req.body.image.variants) {
        Promise.all(req.body.image.variants.map(element => {
          return new Promise((resolve, reject) => {
            var convertedData = [];
            // convert the object into tow dimensional array
            for (const key in element) {
              convertedData.push([key, element[key]])
            }
            //Object structure 
            // variant {blue:data:blablabla,white: data:blablabla}
            // convertedData [[blue,"data:blablabla"]]
            // then map over this array to provide a array of promise for 
            // the promise.all function
            // after with the result sent it to the client
            Promise.all(convertedData.map(function (arr) {
              return new Promise((resolve, reject) => {
                // Save all sepearate variant image
                Promise.all(arr[1].map(varImg => {
                  return new Promise((varResolve, varReject) => {
                    base64Img.img(
                      varImg,
                      __dirname + "/image/" + req.body.image.productId,
                      uniqid() + "", (err, filePath) => varResolve(filePath)
                    )
                  })
                })).then(allVarImg => {
                  resolve(allVarImg);
                })
              });
            })).then(variantRes => {
              var objName = {};
              convertedData.forEach((arr, index) => {
                objName[arr[0]] = variantRes[index];
              });
              resolve(objName);
            })
          })

        })).then(variantFinalRes => {
          object.variants = variantFinalRes;
          res.send(object);
        })
      } else {
        res.send(object);
      }
    })
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

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
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
app.listen(port, () => {
  console.log("server started")
});
module.exports = app;