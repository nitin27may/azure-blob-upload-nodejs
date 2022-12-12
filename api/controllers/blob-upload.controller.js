const router = require("express").Router()
const multer = require("multer")
const inMemoryStorage = multer.memoryStorage()
const path = require("path")

const {
  generateBlobSASQueryParameters,
  SASProtocol,
  BlobServiceClient,
  newPipeline,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  AccountSASPermissions,
} = require("@azure/storage-blob")

import * as getStream from "into-stream";
const uuid = require("uuid")

const config = require("../config.js")

const { setLogLevel } = require("@azure/logger")
setLogLevel("info")

// Use StorageSharedKeyCredential with storage account and account key

const getBlobName = (file) => {
  const fileName = Date.now() + "-" + uuid.v4() + path.extname(file.originalname)
  return fileName
}

uploadFilesToBlob = async (directoryPath, containerName1, files) => {
  var promiseList = []

  const sharedKeyCredential = new StorageSharedKeyCredential(config.azureStorageConfig.accountName, config.azureStorageConfig.accountKey)

  const pipeline = newPipeline(sharedKeyCredential, {
    // httpClient: MyHTTPClient, // A customized HTTP client implementing IHttpClient interface
    retryOptions: { maxTries: 4 }, // Retry options
    userAgentOptions: { userAgentPrefix: "Blob Upload" }, // Customized telemetry string
    keepAliveOptions: {
      // Keep alive is enabled by default, disable keep alive by setting false
      enable: false,
    },
  })

  const blobServiceClient = new BlobServiceClient(`https://${config.azureStorageConfig.accountName}.blob.core.windows.net`, sharedKeyCredential)

  // Create a container
  const containerName = config.azureStorageConfig.containerName ? config.azureStorageConfig.containerName : `newcontainer${new Date().getTime()}`
  const containerClient = blobServiceClient.getContainerClient(containerName)
  //   try {
  //      await containerClient.createIfNotExists()

  //   } catch (err) {
  //       console.log("error", err);
  //     console.log(`Creating a container fails, requestId - ${err.details.requestId}, statusCode - ${err.statusCode}, errorCode - ${err.details.errorCode}`)
  //   }

  files.forEach((file) => {
    const blobName = getBlobName(file)
    const stream = getStream(file.buffer)
    const streamLength = file.buffer.length
    const blobNamewithFolder = directoryPath ? `${directoryPath}/${blobName}` : `${blobName}`
    console.log("blobNamewithFolder", blobNamewithFolder)
    promiseList.push(
      new Promise((resolve, reject) => {
        // Create a blob
        //const blobName = "newblob" + new Date().getTime();
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        // Parallel uploading a Readable stream with BlockBlobClient.uploadStream() in Node.js runtime
        // BlockBlobClient.uploadStream() is only available in Node.js
        try {
          blockBlobClient.uploadStream(stream, 4 * 1024 * 1024, 20, {
            // abortSignal: AbortController.timeout(30 * 60 * 1000), // Abort uploading with timeout in 30mins
            onProgress: (ev) => console.log("progress", ev),
          })

          let startDateTime = new Date();
          startDateTime.setMinutes(startDateTime.getMinutes() - 5);

          let endDateTime = new Date();
          endDateTime.setMinutes(endDateTime.getMinutes() + 45);

          const sasOptions = {
            containerName: config.azureStorageConfig.containerName,
            blobName: blobName,
            startsOn: startDateTime,
            expiresOn: endDateTime,
            permissions: BlobSASPermissions.parse("r"),
            protocol: SASProtocol.https,
          }
          let blobUrl = `https://${config.azureStorageConfig.accountName}.blob.core.windows.net/${config.azureStorageConfig.containerName}/${blobName}`
          setTimeout(function () {
            const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString()
            blobUrl += `?${sasToken}`
            resolve({
              filename: blobName,
              originalname: file.originalname,
              size: streamLength,
              path: `${config.azureStorageConfig.containerName}/${blobName}`,
              url: blobUrl,
            })
          }, 2500)
        } catch (err) {
          console.log("error ", err)
          console.log(`uploadStream failed, requestId - ${err.details.requestId}, statusCode - ${err.statusCode}, errorCode - ${err.details.errorCode}`)
          reject(err)
        }
      }),
    )
  })
  return Promise.all(promiseList).then((values) => {
    return values
  })
}

const imageUpload = async (req, res, next) => {
  try {
    console.log("file length", req.files.length)
    const image = await uploadFilesToBlob(req.body.folderpath, req.body.containerName, req.files) // images is a directory in the Azure container
    return res.json(image)
  } catch (error) {
    next(error)
  }
}

const multipleFileUpload = multer({ storage: inMemoryStorage }).array("file", 5)

router.route("/upload").post(multipleFileUpload, imageUpload);

module.exports = router
