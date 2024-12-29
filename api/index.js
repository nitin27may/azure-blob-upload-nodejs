const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const config = require("./config.js");
const router = require("express").Router();

// Initialise the app
const app = express();

// Enable CORS
app.use(cors());

// Configure bodyparser to handle post requests
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Base API route
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

// Use API routes in the App
const fileRoutes = require("./controllers/blob-upload.controller");
app.use("/api/blob", fileRoutes);

const port = process.env.PORT || config.expressPort;

// Launch app to listen to specified port
app.listen(port, function () {
  console.log("Running Azure File upload API on port " + port);
});
