const cloudinary = require("cloudinary").v2;

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
    console.warn('Cloudinary connection warning:', error.message);
    console.warn('Server will continue without Cloudinary verification');
  } else {
    console.log('Cloudinary connected successfully');
  }
}).catch(err => {
  console.warn('Cloudinary ping failed, but server will continue:', err.message);
});

module.exports = cloudinary;