const router = require("express").Router();
const multer = require("multer");
const path = require("path");

const azureStorage = require("azure-storage");
const getStream = require("into-stream");
const uuid = require("uuid");

const config = require("../config.js");

var startDate = new Date();
startDate.setMinutes(startDate.getMinutes() - 5);
var expiryDate = new Date(startDate);
expiryDate.setMinutes(startDate.getMinutes() + 60);

const sharedAccessPolicy = {
  AccessPolicy: {
    Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
    Start: startDate,
    Expiry: expiryDate,
  },
};

const inMemoryStorage = multer.memoryStorage();
// const singleFileUpload = multer({ storage: inMemoryStorage });
const multipleFileUpload = multer({ storage: inMemoryStorage }).array(
  "file",
  5
);

uploadFilesToBlob = async (directoryPath, containerName, files) => {
  var promiseList = [];

  files.forEach((file) => {
    const blobName = getBlobName(file);
    const stream = getStream(file.buffer);
    const streamLength = file.buffer.length;
    const blobNamewithFolder = directoryPath
      ? `${directoryPath}/${blobName}`
      : `${blobName}`;
    console.log("blobNamewithFolder", blobNamewithFolder);
    promiseList.push(
      new Promise((resolve, reject) => {
        // const blobService = azureStorage.createBlobService(
        //     config.azureStorageConfig.connectionString
        // );
        const blobService = azureStorage.createBlobService(
          config.azureStorageConfig.accountName,
          config.azureStorageConfig.accountKey
        );
        blobService.createBlockBlobFromStream(
          containerName,
          blobNamewithFolder,
          stream,
          streamLength,
          (err) => {
            if (err) {
              reject(err);
            } else {
              var token = blobService.generateSharedAccessSignature(
                containerName,
                blobNamewithFolder,
                sharedAccessPolicy
              );
              const sasUrl = blobService.getUrl(
                containerName,
                blobNamewithFolder,
                token
              );

              resolve({
                filename: blobName,
                originalname: file.originalname,
                size: streamLength,
                path: `${azureStorageConfig.containerName}/${blobNamewithFolder}`,
                url: sasUrl,
              });
            }
          }
        );
      })
    );
  });

  return Promise.all(promiseList).then((values) => {
    return values;
  });
};

const getBlobName = (file) => {
  const fileName =
    Date.now() + "-" + uuid.v4() + path.extname(file.originalname);
  return fileName;
};

const imageUpload = async (req, res, next) => {
  try {
    console.log("file length", req.files.length);
    const image = await uploadFilesToBlob(
      req.body.folderpath,
      req.body.containerName,
      req.files
    ); // images is a directory in the Azure container
    return res.json(image);
  } catch (error) {
    next(error);
  }
};

const deleteImage = (req, res, next) => {
  try {
    const blobService = azureStorage.createBlobService(
      config.azureStorageConfig.connectionString
    );

    //  blobService.logger.level = azureStorage.Logger.LogLevels.DEBUG;
    // console.log(req.body);
    // blobService.doesBlobExist(req.body.containerName, req.body.path, (error, result) => {
    //   if (!error) {
    //     if (result.exists) {
    //       console.log("Blob exists...");
    //     } else {
    //       console.log("Blob does not exist...");
    //     }
    //   }
    // });
    blobService.deleteBlobIfExists(
      req.body.containerName,
      req.body.path,
      (error, result) => {
        if (!error) {
          if (result.exists) {
            res.json({
              error: false,
              Message: "File deleted SuceesFully",
              Data: null,
            });
          } else {
            res.json({
              error: true,
              Message: "File was not deleted from storeg",
              Data: null,
            });
          }
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

//router.route("/upload").post(singleFileUpload.single("file"), imageUpload);
router.route("/upload").post(multipleFileUpload, imageUpload);
router.route("/delete").post(deleteImage);

module.exports = router;
