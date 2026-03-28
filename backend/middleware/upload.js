const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Enhanced Cloudinary storage with better optimization
const createStorage = (folder = "qmart_products") => new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder,
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      { width: 1200, height: 1200, crop: "limit", quality: "auto" },
      { fetch_format: "auto" } // Auto-format for optimal delivery
    ],
    // Add metadata
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return cb(new Error('File size too large (max 5MB)'), false);
  }

  cb(null, true);
};

// Create multer instances with enhanced configuration
const upload = multer({
  storage: createStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

const uploadMultiple = multer({
  storage: createStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Max 10 files
  }
}).array("images", 10);

// Dynamic upload handler for multiple fields (including variant images)
const uploadDynamic = multer({
  storage: createStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 50 // Allow more files for variants
  }
}).any(); // Accept any field name

// Variant image upload (for future use)
const uploadVariantImages = multer({
  storage: createStorage("qmart_variants"),
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB per file for variants
    files: 5 // Max 5 images per variant
  }
}).array("variantImages", 5);

// Error handling middleware for upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5MB)' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files (max 10)' });
    }
  }

  if (error.message.includes('Only image files')) {
    return res.status(400).json({ message: error.message });
  }

  next(error);
};

module.exports = {
  upload,
  uploadMultiple,
  uploadDynamic,
  uploadVariantImages,
  handleUploadError
};