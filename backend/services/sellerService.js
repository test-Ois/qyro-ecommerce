const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const ApiError = require("../utils/apiError");

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

const splitUploadFiles = (files) => {
  const productFiles = [];
  const groupedVariantFiles = new Map();

  files.forEach((file) => {
    if (file.fieldname === "images" || file.fieldname === "image") {
      productFiles.push(file);
      return;
    }

    const indexedMatch = /^variantImages[-_](\d+)$/.exec(file.fieldname);

    if (!indexedMatch) {
      return;
    }

    const variantIndex = Number(indexedMatch[1]);
    const currentFiles = groupedVariantFiles.get(variantIndex) || [];
    currentFiles.push(file);
    groupedVariantFiles.set(variantIndex, currentFiles);
  });

  return { productFiles, groupedVariantFiles };
};

const buildImageRecords = (files, productName) =>
  files.map((file, index) => ({
    url: file.path,
    type: index === 0 ? "main" : "gallery",
    publicId: file.filename,
    altText: `${productName} - Image ${index + 1}`
  }));

const buildVariants = (variantsRaw, files, fallbackPrice = 0) => {
  const parsedVariants = parseVariants(variantsRaw);
  const { groupedVariantFiles } = splitUploadFiles(files);

  return parsedVariants.reduce((accumulator, variant, index) => {
    const existingImages = normalizeImageList(variant.images);
    const uploadedImages = (groupedVariantFiles.get(index) || [])
      .map((file) => file.path)
      .filter(Boolean);
    const mergedImages = [...existingImages, ...uploadedImages];
    const size = String(variant.size || "").trim();
    const color = String(variant.color || "").trim();
    const sku = String(variant.sku || "").trim();
    const rawPrice = variant.price;
    const rawStock = variant.stock;
    const hasAnyContent =
      size ||
      color ||
      sku ||
      rawPrice !== undefined && rawPrice !== "" ||
      rawStock !== undefined && rawStock !== "" ||
      mergedImages.length > 0;

    if (!hasAnyContent) {
      return accumulator;
    }

    const variantPrice =
      rawPrice === undefined || rawPrice === ""
        ? Number(fallbackPrice) || 0
        : Number(rawPrice);

    if (!Number.isFinite(variantPrice) || variantPrice < 0) {
      throw new ApiError(400, `Variant ${index + 1} price must be a valid number`);
    }

    const variantStock =
      rawStock === undefined || rawStock === "" ? 0 : Number(rawStock);

    if (!Number.isFinite(variantStock) || variantStock < 0) {
      throw new ApiError(400, `Variant ${index + 1} stock must be a valid number`);
    }

    const variantName = String(
      variant.name || [color, size].filter(Boolean).join(" - ") || sku || `Variant ${index + 1}`
    ).trim();

    accumulator.push({
      name: variantName,
      size,
      color,
      price: variantPrice,
      stock: variantStock,
      sku,
      image: mergedImages[0] || "",
      images: mergedImages
    });

    return accumulator;
  }, []);
};

exports.getSellerStats = async (userId) => {
  const products = await Product.find({ seller: userId });
  const productIds = products.map((p) => p._id.toString());

  const orders = await Order.find({ "products.product": { $in: products.map((p) => p._id) } });

  let totalRevenue = 0;

  orders.forEach((order) => {
    order.products.forEach((item) => {
      if (item.product && productIds.includes(item.product.toString())) {
        const product = products.find((p) => p._id.toString() === item.product.toString());
        if (product) {
          totalRevenue += (Number(item.price) || product.price || 0) * (Number(item.quantity) || 0);
        }
      }
    });
  });

  const seller = await User.findById(userId);
  const commissionRate = seller?.commissionRate || 0;
  const commissionAmount = (totalRevenue * commissionRate) / 100;
  const netEarnings = totalRevenue - commissionAmount;

  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue,
    commissionRate,
    commissionAmount,
    netEarnings
  };
};

exports.getSellerProducts = async (userId) => {
  return await Product.find({ seller: userId });
};

exports.addSellerProduct = async (req, userId) => {
  const files = Array.isArray(req.files) ? req.files : [];
  const { productFiles } = splitUploadFiles(files);
  const images = buildImageRecords(productFiles, req.body.name || "Product");
  const legacyImage = images.length > 0 ? images[0].url : "";
  const parsedVariants = buildVariants(req.body.variants, files, req.body.price);

  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    stock: req.body.stock || 0,
    image: legacyImage,
    images: images,
    seller: userId,
    variants: parsedVariants
  });

  return await product.save();
};

exports.updateSellerProduct = async (id, req, userId) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.seller?.toString() !== userId.toString()) throw new ApiError(403, "Not authorized");

  const files = Array.isArray(req.files) ? req.files : [];
  const { productFiles } = splitUploadFiles(files);
  const images = buildImageRecords(productFiles, req.body.name || product.name);
  const legacyImage = images.length > 0 ? images[0].url : "";

  const updateData = {
    name: req.body.name || product.name,
    price: req.body.price || product.price,
    description: req.body.description || product.description,
    category: req.body.category || product.category,
    stock: req.body.stock !== undefined ? req.body.stock : product.stock
  };

  if (images.length > 0) {
    updateData.image = legacyImage;
    updateData.images = images;
  }

  if (req.body.variants !== undefined) {
    updateData.variants = buildVariants(
      req.body.variants,
      files,
      req.body.price || product.price
    );
  }

  const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
  return updated;
};

exports.deleteSellerProduct = async (id, userId) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.seller?.toString() !== userId.toString()) throw new ApiError(403, "Not authorized");

  await Product.findByIdAndDelete(id);
  return { message: "Product deleted" };
};

exports.uploadSellerVariantImages = async (id, variantId, req, userId) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.seller?.toString() !== userId.toString()) throw new ApiError(403, "Not authorized");

  const variantIndex = product.variants.findIndex((v) => v._id.toString() === variantId);
  if (variantIndex === -1) throw new ApiError(404, "Variant not found");

  if (!req.files || req.files.length === 0) throw new ApiError(400, "No images provided");

  const uploadedImages = req.files
    .map((file) => file.path)
    .filter(Boolean);

  product.variants[variantIndex].images = [
    ...(product.variants[variantIndex].images || []),
    ...uploadedImages
  ];

  if (uploadedImages.length > 0 && !product.variants[variantIndex].image) {
    product.variants[variantIndex].image = uploadedImages[0];
  }

  await product.save();

  return product.variants[variantIndex];
};
