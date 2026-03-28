/**
 * Cloudinary Image Optimization Utilities
 */

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized URL
 */
const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options;

  // Extract base URL and public ID from Cloudinary URL
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) return url;

  const baseUrl = urlParts[0];
  const imagePath = urlParts[1];

  // Build transformation string
  const transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity && gravity !== 'auto') transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformationString = transformations.join(',');

  return `${baseUrl}/upload/${transformationString}/${imagePath}`;
};

/**
 * Generate responsive image URLs for different breakpoints
 * @param {string} url - Original Cloudinary URL
 * @returns {object} - Object with different size URLs
 */
const getResponsiveImageUrls = (url) => {
  return {
    thumbnail: getOptimizedImageUrl(url, { width: 150, height: 150, crop: 'fill' }),
    small: getOptimizedImageUrl(url, { width: 300, height: 300, crop: 'fill' }),
    medium: getOptimizedImageUrl(url, { width: 600, height: 600, crop: 'fill' }),
    large: getOptimizedImageUrl(url, { width: 1200, height: 1200, crop: 'fill' }),
    original: url
  };
};

/**
 * Generate WebP version of image URL
 * @param {string} url - Original Cloudinary URL
 * @returns {string} - WebP URL
 */
const getWebPUrl = (url) => {
  return getOptimizedImageUrl(url, { format: 'webp' });
};

/**
 * Generate lazy loading placeholder (low quality image)
 * @param {string} url - Original Cloudinary URL
 * @returns {string} - Low quality placeholder URL
 */
const getPlaceholderUrl = (url) => {
  return getOptimizedImageUrl(url, {
    width: 50,
    height: 50,
    quality: 20,
    format: 'webp'
  });
};

/**
 * Delete all images associated with a product from Cloudinary
 * @param {object} product - Product document
 */
const deleteProductImages = async (product) => {
  const cloudinary = require("../config/cloudinary");
  const imagesToDelete = [];

  // Collect all product-level image public IDs
  if (product.images && product.images.length > 0) {
    product.images.forEach(image => {
      if (image.publicId) {
        imagesToDelete.push(image.publicId);
      }
    });
  }

  // Also check variants for images
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach(variant => {
      if (variant.images && variant.images.length > 0) {
        variant.images.forEach(image => {
          if (image.publicId) {
            imagesToDelete.push(image.publicId);
          }
        });
      }
      // Also check legacy single image
      if (variant.image && typeof variant.image === 'string') {
        // For legacy images, we might not have publicId, skip these
        console.warn(`Legacy variant image found without publicId: ${variant.image}`);
      }
    });
  }

  // Delete images in batches to avoid rate limits
  if (imagesToDelete.length > 0) {
    const deletePromises = imagesToDelete.map(publicId =>
      cloudinary.uploader.destroy(publicId).catch(err => {
        console.warn(`Failed to delete image ${publicId}:`, err.message);
        return null; // Don't fail the whole operation
      })
    );

    await Promise.all(deletePromises);
    console.log(`Deleted ${imagesToDelete.length} images for product ${product._id}`);
  }
};

module.exports = {
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  getWebPUrl,
  getPlaceholderUrl,
  deleteProductImages
};