const Product = require("../models/Product");
const productService = require("../services/productService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { sendSuccess } = require("../utils/apiResponse");

const parseVariants = (variantsRaw) => {
  if (!variantsRaw) {
    return [];
  }

  try {
    const parsed = typeof variantsRaw === "string" ? JSON.parse(variantsRaw) : variantsRaw;
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    throw new ApiError(400, "Invalid variants payload");
  }
};

const normalizeImageList = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      if (typeof image === "string") {
        return image.trim();
      }

      if (image && typeof image === "object" && typeof image.url === "string") {
        return image.url.trim();
      }

      return "";
    })
    .filter(Boolean);
};

const groupVariantFiles = (files) => {
  const groupedFiles = new Map();
  const flatVariantFiles = [];

  files.forEach((file) => {
    if (file.fieldname === "images") {
      flatVariantFiles.push(file);
      return;
    }

    const indexedMatch = /^variantImages[-_](\d+)$/.exec(file.fieldname);

    if (!indexedMatch) {
      return;
    }

    const variantIndex = Number(indexedMatch[1]);
    const currentFiles = groupedFiles.get(variantIndex) || [];
    currentFiles.push(file);
    groupedFiles.set(variantIndex, currentFiles);
  });

  return { groupedFiles, flatVariantFiles };
};

const buildVariants = (variantsRaw, files) => {
  const parsedVariants = parseVariants(variantsRaw);
  const { groupedFiles, flatVariantFiles } = groupVariantFiles(files);
  let flatFileCursor = 0;

  return parsedVariants.reduce((accumulator, variant, index) => {
    const existingImages = normalizeImageList(variant.images);
    const size = String(variant.size || "").trim();
    const color = String(variant.color || "").trim();
    const sku = String(variant.sku || "").trim();
    const variantName = String(
      variant.name || [color, size].filter(Boolean).join(" - ") || sku || `Variant ${index + 1}`
    ).trim();
    const variantPrice = Number(variant.price);
    const hasAnyContent =
      variantName ||
      size ||
      color ||
      sku ||
      variant.price !== undefined ||
      variant.stock !== undefined ||
      existingImages.length > 0 ||
      Number(variant.newImageCount) > 0 ||
      (groupedFiles.get(index) || []).length > 0;

    if (!hasAnyContent) {
      return accumulator;
    }

    if (!variantName) {
      throw new ApiError(400, `Variant ${index + 1} name is required`);
    }

    if (!Number.isFinite(variantPrice) || variantPrice < 0) {
      throw new ApiError(400, `Variant ${index + 1} price must be a valid number`);
    }

    const directFiles = groupedFiles.get(index) || [];
    const requestedFlatCount = Math.max(0, Number(variant.newImageCount) || 0);
    const assignedFlatFiles =
      directFiles.length === 0 && requestedFlatCount > 0
        ? flatVariantFiles.slice(flatFileCursor, flatFileCursor + requestedFlatCount)
        : [];

    if (directFiles.length === 0 && requestedFlatCount > 0) {
      flatFileCursor += requestedFlatCount;
    }

    const newImages = [...directFiles, ...assignedFlatFiles]
      .map((file) => file.path)
      .filter(Boolean);
    const mergedImages = [...existingImages, ...newImages];
    const fallbackImage = String(variant.image || "").trim();

    accumulator.push({
      name: variantName,
      price: variantPrice,
      images: mergedImages,
      image: mergedImages[0] || fallbackImage || "",
      size,
      color,
      stock: Number(variant.stock) || 0,
      sku
    });

    return accumulator;
  }, []);
};

const buildProductImages = (mainImageFile, productName) => {
  if (!mainImageFile) {
    return [];
  }

  return [
    {
      url: mainImageFile.path,
      type: "main",
      publicId: mainImageFile.filename,
      altText: `${productName} - Main Image`
    }
  ];
};

const getMainImageFile = (files) => files.find((file) => file.fieldname === "image") || null;

const resolveProductPrice = (price, variants, fallback = 0) => {
  const parsedPrice = Number(price);

  if (Number.isFinite(parsedPrice) && parsedPrice >= 0) {
    return parsedPrice;
  }

  if (variants.length > 0) {
    return variants[0].price;
  }

  return fallback;
};

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts(req.query.keyword);
  sendSuccess(res, { message: "Products fetched successfully", data: products });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, { message: "Product fetched successfully", data: product });
});

exports.addProduct = asyncHandler(async (req, res) => {
  const productName = String(req.body.name || "").trim();

  if (!productName) {
    throw new ApiError(400, "Product name is required");
  }

  const files = Array.isArray(req.files) ? req.files : [];
  const mainImageFile = getMainImageFile(files);
  const variants = buildVariants(req.body.variants, files);
  const price = resolveProductPrice(req.body.price, variants);

  if (!Number.isFinite(price) || price < 0) {
    throw new ApiError(400, "Product price must be a valid number");
  }

  const productImages = buildProductImages(mainImageFile, productName);

  const saved = await Product.create({
    name: productName,
    price,
    description: String(req.body.description || "").trim(),
    category: String(req.body.category || "").trim(),
    image: mainImageFile?.path || "",
    images: productImages,
    stock: Number(req.body.stock) || 0,
    variants,
    seller: req.user.id,
    isBanner: req.body.isBanner === "true",
    isSideBanner: req.body.isSideBanner === "true",
    isDeal: req.body.isDeal === "true",
    bannerType: req.body.bannerType || "none"
  });

  sendSuccess(res, { statusCode: 201, message: "Product created successfully", data: saved });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (req.user.role !== "admin" && product.seller?.toString() !== req.user.id) {
    throw new ApiError(403, "Access denied - you can only modify your own products");
  }

  const productName = String(req.body.name || product.name || "").trim();

  if (!productName) {
    throw new ApiError(400, "Product name is required");
  }

  const files = Array.isArray(req.files) ? req.files : [];
  const mainImageFile = getMainImageFile(files);
  const variants =
    req.body.variants !== undefined
      ? buildVariants(req.body.variants, files)
      : product.variants;
  const price = resolveProductPrice(req.body.price, variants, product.price);

  if (!Number.isFinite(price) || price < 0) {
    throw new ApiError(400, "Product price must be a valid number");
  }

  product.name = productName;
  product.price = price;
  product.description = String(req.body.description ?? product.description ?? "").trim();
  product.category = String(req.body.category ?? product.category ?? "").trim();
  product.stock = req.body.stock !== undefined ? Number(req.body.stock) || 0 : product.stock;
  product.variants = variants;
  product.isBanner = req.body.isBanner === "true";
  product.isSideBanner = req.body.isSideBanner === "true";
  product.isDeal = req.body.isDeal === "true";
  product.bannerType = req.body.bannerType || product.bannerType || "none";

  if (mainImageFile) {
    product.image = mainImageFile.path;
    product.images = buildProductImages(mainImageFile, productName);
  }

  const updated = await product.save();
  sendSuccess(res, { message: "Product updated successfully", data: updated });
});

/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, { message: "Product deleted successfully" });
});

/* ================= UPLOAD VARIANT IMAGES ================= */
exports.uploadVariantImages = asyncHandler(async (req, res) => {
  const { id, variantId } = req.params;
  const variant = await productService.uploadVariantImages(id, variantId, req.files);
  sendSuccess(res, { message: "Variant images uploaded successfully", data: { variant } });
});

/* ================= ADD REVIEW ================= */
exports.addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await productService.addReview(req.params.id, req.user, rating, comment);
  sendSuccess(res, { statusCode: 201, message: "Review added successfully", data: { product } });
});

/* ================= DELETE REVIEW ================= */
exports.deleteReview = asyncHandler(async (req, res) => {
  await productService.deleteReview(req.params.id, req.params.reviewId);
  sendSuccess(res, { message: "Review deleted successfully" });
});
