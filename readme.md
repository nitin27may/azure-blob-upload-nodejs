# Azure Blob File Upload (JavaScript v12 SDK - @azure/storage-blob)

This is a sample project for uploading (images, videos, etc.) using the JavaScript v12 SDK (`@azure/storage-blob`) in Node.js and generating a SAS URL to access the files.

We use **Angular 19** for the frontend (with drag-and-drop functionality) and **Express.js 4.18** to expose REST APIs for file uploads and SAS token generation. The project supports multiple file upload strategies:

- **Multipart Form Data**
- **Chunked Uploads**
- **Stream Uploads**

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
