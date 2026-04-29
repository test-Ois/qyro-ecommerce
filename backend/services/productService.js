const Product = require("../models/Product");
const parseVariants = require("../utils/parseVariants");
const { deleteProductImages } = require("../utils/imageUtils");
const ApiError = require("../utils/apiError");

const buildImageRecords = (files, baseName) => {
  if (!files || !files.length) return [];

  return files.map((file, index) => ({
    url: file.path,
    type: index === 0 ? "main" : "gallery",
    publicId: file.filename,
    altText: `${baseName} - Image ${index + 1}`
  }));
};

const sanitizeVariantImages = (images) => {
  if (!Array.isArray(images)) return [];
  
  return images.filter((img) => {
    // Keep images that have either url or publicId (both ideally)
    return img && (img.url || img.publicId);
  });
};

exports.getAllProducts = async (keyword = "") => {
  const trimmedKeyword = String(keyword || "").trim();
  const query = trimmedKeyword
    ? {
        name: { $regex: trimmedKeyword, $options: "i" }
      }
    : {};

  return await Product.find(query);
};

exports.getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

exports.createProduct = async (req, userId) => {
  // SECURITY: Always ensure seller ID is set from authenticated user
  if (!userId) {
    throw new ApiError(401, "User authentication required");
  }

  const productImages = buildImageRecords(req.files, req.body.name || "Product");
  const legacyImage = productImages.length > 0 ? productImages[0].url : "";

  let parsedVariants = [];
  if (req.body.variants) {
    parsedVariants = parseVariants(req.body.variants, legacyImage);

    if (req.body.variantImages) {
      const variantImagesData = JSON.parse(req.body.variantImages || "[]");

      parsedVariants = parsedVariants.map((variant, index) => {
        const variantImageData = variantImagesData[index];
        const variantFiles = (req.files || []).filter(file => file.fieldname === `variant_${index}_images`);

        const uploadedImages = buildImageRecords(variantFiles, `${req.body.name} - ${variant.color || variant.size}`);

        if (uploadedImages.length > 0 || (variantImageData && variantImageData.images)) {
          const mergedImages = [...(variantImageData?.images || []), ...uploadedImages];
          return {
            ...variant,
            images: sanitizeVariantImages(mergedImages)
          };
        }

        return variant;
      });
    }

    // Final sanitization of all variant images
    parsedVariants = parsedVariants.map((variant) => ({
      ...variant,
      images: sanitizeVariantImages(variant.images)
    }));
  }

  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    image: legacyImage,
    images: productImages,
    stock: req.body.stock || 0,
    variants: parsedVariants,
    seller: userId, // SECURITY: Set from authenticated user ID, not request body
    isBanner: req.body.isBanner === "true",
    isSideBanner: req.body.isSideBanner === "true",
    isDeal: req.body.isDeal === "true",
    bannerType: req.body.bannerType || "none"
  });

  return await product.save();
};

exports.updateProduct = async (id, req) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  // SECURITY: Strict owner validation - defense in depth
  // Even with middleware, validate ownership in service layer
  if (req.user.role !== "admin" && product.seller.toString() !== req.user.id) {
    throw new ApiError(403, "Access denied - you can only modify your own products");
  }

  const productImages = buildImageRecords(req.files, req.body.name || product.name);
  const legacyImage = productImages.length > 0 ? productImages[0].url : "";

  const updateData = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    stock: req.body.stock,
    isBanner: req.body.isBanner === "true",
    isSideBanner: req.body.isSideBanner === "true",
    isDeal: req.body.isDeal === "true",
    bannerType: req.body.bannerType || "none"
  };

  if (productImages.length > 0) {
    updateData.image = legacyImage;
    updateData.images = productImages;
  }

  if (req.body.variants !== undefined) {
    let parsedVariants = parseVariants(req.body.variants, legacyImage || product.image);

    if (req.body.variantImages) {
      const variantImagesData = JSON.parse(req.body.variantImages || "[]");

      parsedVariants = parsedVariants.map((variant, index) => {
        const variantImageData = variantImagesData[index];
        const variantFiles = (req.files || []).filter(file => file.fieldname === `variant_${index}_images`);
        const uploadedImages = buildImageRecords(variantFiles, `${req.body.name || product.name} - ${variant.color || variant.size}`);

        if (uploadedImages.length > 0 || (variantImageData && variantImageData.images)) {
          const mergedImages = [...(variantImageData?.images || []), ...uploadedImages];
          return {
            ...variant,
            images: sanitizeVariantImages(mergedImages)
          };
        }

        return variant;
      });
    }

    // Final sanitization of all variant images
    parsedVariants = parsedVariants.map((variant) => ({
      ...variant,
      images: sanitizeVariantImages(variant.images)
    }));

    updateData.variants = parsedVariants;
  }

  const updated = await Product.findByIdAndUpdate(id, updateData, {
    new: true
  });

  if (!updated) throw new Error("Product not found");

  return updated;
};

exports.deleteProduct = async (id, userId, userRole = "seller") => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  // SECURITY: Strict owner validation - defense in depth
  if (userRole !== "admin" && product.seller.toString() !== userId) {
    throw new ApiError(403, "Access denied - you can only delete your own products");
  }

  await deleteProductImages(product);
  return await Product.findByIdAndDelete(id);
};

exports.uploadVariantImages = async (id, variantId, files) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
  if (variantIndex === -1) throw new ApiError(404, "Variant not found");

  let variantImages = buildImageRecords(files, `${product.name} - ${product.variants[variantIndex].color || product.variants[variantIndex].size}`);

  product.variants[variantIndex].images = [
    ...(product.variants[variantIndex].images || []),
    ...variantImages
  ];

  if (variantImages.length > 0 && !product.variants[variantIndex].image) {
    product.variants[variantIndex].image = variantImages[0].url;
  }

  await product.save();

  return product.variants[variantIndex];
};

exports.addReview = async (id, user, rating, comment) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === user.id.toString());
  if (alreadyReviewed) throw new ApiError(400, "Product already reviewed");

  const review = {
    user: user.id,
    name: user.name,
    rating: Number(rating),
    comment
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.averageRating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  return product;
};

exports.deleteReview = async (id, reviewId) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");
  const reviewExists = product.reviews.some((r) => r._id.toString() === reviewId);
  if (!reviewExists) throw new ApiError(404, "Review not found");
  product.reviews = product.reviews.filter((r) => r._id.toString() !== reviewId);
  product.numReviews = product.reviews.length;
  product.averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 0;

  await product.save();
  return product;
};
