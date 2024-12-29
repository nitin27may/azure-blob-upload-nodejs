const express = require("express");
const multer = require("multer");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  SASProtocol,
} = require("@azure/storage-blob");
const path = require("path");
const { Readable } = require("stream");
const config = require("../config");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const blobServiceClient = new BlobServiceClient(
  `https://${config.azureStorageConfig.accountName}.blob.core.windows.net`,
  new StorageSharedKeyCredential(
    config.azureStorageConfig.accountName,
    config.azureStorageConfig.accountKey
  )
);

const isValidContainerName = (name) => /^[a-z0-9-]+$/.test(name);

const generateBlobNameWithTimestamp = (originalName) => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14);
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  return `${baseName}_${timestamp}${ext}`;
};

// Upload blob
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { containerName, blobName } = req.body;

    if (!isValidContainerName(containerName)) {
      return res.status(400).json({ error: "Invalid container name." });
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blobNameWithTimestamp = generateBlobNameWithTimestamp(blobName);
    const blobClient = containerClient.getBlockBlobClient(blobNameWithTimestamp);

    await blobClient.upload(req.file.buffer, req.file.buffer.length, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });

    res.json({ message: "Upload successful.", blobName: blobNameWithTimestamp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stream upload
router.post("/stream-upload", async (req, res) => {
  try {
    const { containerName, blobName } = req.headers;

    console.log("Received Headers:", { containerName, blobName });

    if (!isValidContainerName(containerName) || !blobName) {
      console.error("Validation Error: Missing or invalid headers.");
      return res.status(400).json({ error: "Container-Name and Blob-Name headers are required." });
    }

    console.log("Validated containerName and blobName.");

    const containerClient = blobServiceClient.getContainerClient(containerName);
    console.log(`Checking if container '${containerName}' exists or needs creation.`);
    await containerClient.createIfNotExists();
    console.log(`Container '${containerName}' is ready.`);

    const blobClient = containerClient.getBlockBlobClient(blobName);

    console.log(`BlobClient created for blob: ${blobName}`);

    const stream = req;
    const contentType = getContentType(blobName); // Use the helper to determine content type

    console.log("Content-Type for upload:", contentType);

    console.log("Starting stream upload...");
    await blobClient.uploadStream(stream, 4 * 1024 * 1024, 20, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    console.log("Stream upload successful.");
    res.json({ message: "Stream upload successful." });
  } catch (error) {
    console.error("Error during stream upload:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Chunk upload
router.post("/upload-chunk", upload.single("chunk"), async (req, res) => {
  try {
    const { containerName, blobName, chunkIndex, totalChunks } = req.body;

    if (!isValidContainerName(containerName)) {
      return res.status(400).json({ error: "Invalid container name." });
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const blockId = Buffer.from(chunkIndex.toString().padStart(6, "0")).toString("base64");

    await blockBlobClient.stageBlock(blockId, req.file.buffer, req.file.buffer.length);

    if (parseInt(chunkIndex, 10) + 1 === parseInt(totalChunks, 10)) {
      const blockList = Array.from({ length: totalChunks }, (_, i) =>
        Buffer.from(i.toString().padStart(6, "0")).toString("base64")
      );
      await blockBlobClient.commitBlockList(blockList);
    }

    res.json({ message: `Chunk ${parseInt(chunkIndex, 10) + 1}/${totalChunks} uploaded successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download blob
router.get("/download", async (req, res) => {
  try {
    const { containerName, blobName } = req.query;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const downloadBlockBlobResponse = await blobClient.download();
    const stream = downloadBlockBlobResponse.readableStreamBody;

    res.setHeader("Content-Disposition", `attachment; filename=${blobName}`);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload large blob in chunks
router.post("/upload-large", upload.single("file"), async (req, res) => {
  try {
    const { containerName, blobName } = req.body;
    const blockSize = 4 * 1024 * 1024; // 4MB

    if (!isValidContainerName(containerName)) {
      return res.status(400).json({ error: "Invalid container name." });
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blobNameWithTimestamp = generateBlobNameWithTimestamp(blobName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobNameWithTimestamp);

    const stream = Readable.from(req.file.buffer);
    let blockId = 0;
    const blockIds = [];
    const buffer = Buffer.alloc(blockSize);
    let bytesRead;

    while ((bytesRead = stream.read(buffer)) !== null) {
      const blockIdEncoded = Buffer.from(blockId.toString().padStart(6, "0"), "utf-8").toString("base64");
      blockIds.push(blockIdEncoded);

      await blockBlobClient.stageBlock(blockIdEncoded, buffer.slice(0, bytesRead));
      blockId++;
    }

    await blockBlobClient.commitBlockList(blockIds);

    res.json({ message: "Large file uploaded successfully.", blobName: blobNameWithTimestamp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate SAS URL
router.get("/sas", async (req, res) => {
  try {
    const { containerName, blobName, expiryTime } = req.query;
    const expiryDate = new Date(expiryTime);

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      protocol: SASProtocol.https,
      startsOn: new Date(),
      expiresOn: expiryDate,
    }, blobServiceClient.credential).toString();

    res.json({ sasUrl: `${blobClient.url}?${sasToken}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete blob
router.delete("/delete", async (req, res) => {
  try {
    const { containerName, blobName } = req.query;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    await blobClient.deleteIfExists();

    res.json({ message: "Blob deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List blobs
router.get("/list", async (req, res) => {
  try {
    let { containerName, prefix = null, includeSasUri = true } = req.query;
    sasExpiryTime = req.query.sasExpiryTime ? new Date(req.query.sasExpiryTime) : new Date(Date.now() + 3600 * 1000);
    console.log("Query Parameters:", { containerName, prefix, includeSasUri, sasExpiryTime });

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobs = [];
    const expiryDate = sasExpiryTime ? new Date(sasExpiryTime) : new Date(Date.now() + 3600 * 1000); // Default 1 hour

    console.log("SAS Expiry Date:", expiryDate);

    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      const blobDetails = {
        name: blob.name,
        createdOn: blob.properties.createdOn,
        metadata: blob.metadata,
        contentType: blob.properties.contentType,
      };

      if (includeSasUri === true && sasExpiryTime) {
        console.log("Generating sas:", sasExpiryTime);
        const blobClient = containerClient.getBlobClient(blob.name);
        const sasToken = generateBlobSASQueryParameters({
          containerName,
          blobName: blob.name,
          permissions: BlobSASPermissions.parse("r"),
          protocol: SASProtocol.https,
          startsOn: new Date(),
          expiresOn: expiryDate,
        }, blobServiceClient.credential).toString();

        blobDetails.sasUri = `${blobClient.url}?${sasToken}`;
        console.log("SAS URI:", blobDetails.sasUri);
      }

      blobs.push(blobDetails);
    }

    res.json(blobs);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
