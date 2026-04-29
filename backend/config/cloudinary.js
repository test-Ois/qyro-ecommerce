const cloudinary = require("cloudinary").v2;
const logger = require("../utils/logger");

// Configure Cloudinary with enhanced settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Always use HTTPS
});

// Add error handling and logging
cloudinary.api.ping((error, result) => {
  if (error) {
    logger.warn("Cloudinary connection warning", { error: error.message });
  } else {
    logger.info("Cloudinary connected successfully");
  }
}).catch(err => {
  logger.warn("Cloudinary ping failed, server will continue", { error: err.message });
});

module.exports = cloudinary;
