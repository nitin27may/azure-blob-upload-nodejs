# Azure Blob (upload)
This is a sample project for uploading (images, videos etc ) and get a SAS url to access the files.

We have used Angular for frontend and expresjs to expose apis.

## Getting started


1. Clone the project (you can download too) and run `npm install` in frontend and api folders to install all depndencies. 
2. Navigate to api folder. Rename `.env.example` to `.env` and add your Azure storage details (Storage account name, key also add connection string).
3. Run `npm run dev-server` in frontend folder. It will start both frontend and api.
```
 git clone https://github.com/nitin27may/azure-blob-upload.git

 cd azure-blob-upload/api

 npm i

 cd azure-blob-upload/frontend

 npm i

 npm run dev-server

```