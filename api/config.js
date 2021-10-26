module.exports = {
  secret: process.env.SECRET,
  azureStorageConfig: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY,
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
    blobURL:
      "https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net",
  },
  expressPort: process.env.EXPRESS_PORT,
};
