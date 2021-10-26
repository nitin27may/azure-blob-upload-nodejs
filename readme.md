# Azure Blob file Upload (JavaScript v12 SDK - @azure/storage-blob)
This is a sample project for uploading (images, videos etc ) using JavaScript v12 SDK (@azure/storage-blob) in Node.js  and get a SAS url to access the files.

We have used Angular 12 for the for frontend (Drag and Drop) and expresjs to expose rest apis to upload file and get SAS token attached URLs.

## Getting started


1. Clone the project (you can download too) and run `npm install` in frontend and api folders to install all depndencies. 
2. Navigate to api folder. Rename `.env.example` to `.env` and add your Azure storage details (Storage account name, key also add connection string).
3. Run `npm run dev-server` in frontend and api folder. It will start both frontend and api in development mode.
```
 git clone https://github.com/nitin27may/azure-blob-upload.git

 cd azure-blob-upload/api

 npm i
 
 npm run dev-server

 cd azure-blob-upload/frontend

 npm i

 npm run dev-server

```
