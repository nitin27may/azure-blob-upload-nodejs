require("dotenv").config();
// Import express
let express = require("express");
// Import Body parser
let bodyParser = require("body-parser");
// Initialise the app
let app = express();
const config = require("./config.js");
let router = require("express").Router();

// Configure bodyparser to handle post requests
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(
  "/api",
  router.get("/", function (req, res) {
    res.json({
      status: "API Its Working",
      message: "Welcome to RESTHub crafted with love!",
    });
  })
);
console.log("account name", process.env.AZURE_STORAGE_ACCOUNT_NAME);
// Use Api routes in the App
//let fileRoutes = require("./controllers/file-upload.controller");
let fileRoutes = require("./controllers/blob-upload.controller");
app.use("/file", fileRoutes);

let port = process.env.PORT || config.expressPort;
// Launch app to listen to specified port
app.listen(port, function () {
  console.log("Running Azure File uplaod API on port " + port);
});
