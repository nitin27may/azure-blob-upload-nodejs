# Azure Blob Storage Example with Expressjs and Angular 19 (JavaScript v12 SDK - @azure/storage-blob)

[https://nitinksingh.com/efficient-file-management-on-azure-blob-storage-crud-operations-and-upload-strategies](https://nitinksingh.com/efficient-file-management-on-azure-blob-storage-crud-operations-and-upload-strategies)

## About the Repository
This repository showcases a comprehensive example of Azure Blob Storage integration using a modern tech stack:

- **Backend**: Expressjs - JavaScript v12 SDK (`@azure/storage-blob`) in Node.js.
- **Frontend**: An Angular 19 project with Material Design for a sleek and user-friendly interface.

It provides robust examples for handling Azure Blob Storage, including three types of upload APIs:

1. **File Upload**: Upload files directly to Azure Blob Storage.
2. **Chunk Upload**: Handle large files by uploading them in smaller chunks.
3. **Stream Upload**: Stream data directly to Azure Blob Storage for efficient handling of larger datasets.

## Features
A complete backend and frontend project structure to show case File operations (CRUD) for Azure Storage

---

## Getting Started

1. Clone the project (or download it) and run `npm install` in both the `frontend` and `api` folders to install all dependencies.

2. Navigate to the `api` folder. Rename `.env.example` to `.env`, and add your Azure storage details (storage account name, key, and connection string).

3. Run the following commands to start the frontend and API in development mode.

```bash
# Clone the repository
git clone https://github.com/nitin27may/azure-blob-upload.git

# Install and start the API
cd azure-blob-upload/api
npm install
npm run dev-server

# Install and start the frontend
cd ../frontend
npm install
npm run dev-server
```

4. Access the application:
   - The API server will typically run on `http://localhost:4000`.
   - The frontend application will run on `http://localhost:4200`.

---

## Key Technologies

- **Frontend**: Angular 19 (with drag-and-drop functionality for file uploads).
- **Backend**: Node.js with Express.js 4.18 for API routes.
- **Azure Blob Storage**: JavaScript v12 SDK (`@azure/storage-blob`) to interact with Azure Blob Storage.
- **Environment Variables**: Used to configure Azure Storage details securely.

---

### Example .env File

Below is an example of the `.env` file to configure your Azure Storage:

```plaintext
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
```

Replace the placeholders with your actual Azure Storage account details.

---

## Features

### File Upload Strategies

1. **Multipart Form Data**:
   - Upload files using the standard `multipart/form-data` format.
   - Suitable for smaller files or when the frontend uses traditional form-based uploads.
   - Files are received, parsed, and then uploaded to Azure Blob Storage.

2. **Chunked Uploads**:
   - Files are divided into smaller chunks on the client side and uploaded sequentially.
   - Recommended for large files to optimize memory usage and handle interruptions during the upload process.

3. **Stream Uploads**:
   - Upload files directly as streams to Azure Blob Storage without loading the entire file into memory.
   - Ideal for large files where minimizing memory consumption is critical.

---

## API Endpoints

### 1. **Multipart Upload**
**Endpoint**: `POST /api/blob/upload-multipart`

- **Headers**: 
  - `Container-Name`: Name of the Azure Blob Storage container.
- **Body**:
  - `multipart/form-data` with file input.
- **Response**:
  - `{ "message": "Upload successful", "fileUrl": "<blob-url>" }`

### 2. **Chunked Upload**
**Endpoint**: `POST /api/blob/upload-chunk`

- **Headers**:
  - `Container-Name`: Name of the Azure Blob Storage container.
- **Body**:
  - JSON with chunk metadata and content.
- **Response**:
  - `{ "message": "Chunk upload successful" }`

### 3. **Stream Upload**
**Endpoint**: `POST /api/blob/stream-upload`

- **Headers**:
  - `Container-Name`: Name of the Azure Blob Storage container.
  - `Blob-Name`: Name of the file to be uploaded.
- **Body**:
  - Raw file data sent in the request body.
- **Response**:
  - `{ "message": "Stream upload successful" }`

---

## Frontend Features

- **Drag-and-Drop File Upload**:
  - Drag and drop files to upload them seamlessly using the preferred upload strategy.
- **Progress Tracking**:
  - Track the progress of chunked uploads in real-time.
- **Error Handling**:
  - Handle upload errors gracefully with retry support for chunked uploads.

---

## Run the Project in Development Mode

```bash
# Start the API
cd azure-blob-upload/api
npm install
npm run dev-server

# Start the Frontend
cd azure-blob-upload/frontend
npm install
npm run start
```

## Accessing the Application
- **API**: `http://localhost:4000`
- **Frontend**: `http://localhost:4200`

---

This setup ensures a scalable solution for file uploads with multiple strategies tailored to different use cases. Let me know if you need further clarifications or additions!
