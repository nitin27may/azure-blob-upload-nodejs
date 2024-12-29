const mime = require("mime");

/**
 * Get the content type of a file based on its extension.
 * @param {string} fileName - The name of the file.
 * @returns {string} - The determined content type or "application/octet-stream" if not found.
 */
function getContentType(fileName) {
  const contentType = mime.getType(fileName);
  return contentType || "application/octet-stream"; // Default to application/octet-stream
}

module.exports = { getContentType };
