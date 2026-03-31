const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const parseVariants = require("../utils/parseVariants");
const ApiError = require("../utils/apiError");

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
  const images = (req.files || []).map((file, index) => ({
    url: file.path,
    type: index === 0 ? "main" : "gallery",
    publicId: file.filename,
    altText: `${req.body.name} - Image ${index + 1}`
  }));

  const legacyImage = images.length > 0 ? images[0].url : "";
  const parsedVariants = parseVariants(req.body.variants, legacyImage);

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

  const images = (req.files || []).map((file, index) => ({
    url: file.path,
    type: index === 0 ? "main" : "gallery",
    publicId: file.filename,
    altText: `${req.body.name || product.name} - Image ${index + 1}`
  }));

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
    updateData.variants = parseVariants(req.body.variants, legacyImage || product.image);
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

  const uploadedImages = req.files.map((file, index) => ({
    url: file.path,
    type: index === 0 ? "main" : "gallery",
    publicId: file.filename,
    altText: `${product.name} - ${product.variants[variantIndex].color || product.variants[variantIndex].size} - Image ${index + 1}`
  }));

  product.variants[variantIndex].images = [
    ...(product.variants[variantIndex].images || []),
    ...uploadedImages
  ];

  if (uploadedImages.length > 0 && !product.variants[variantIndex].image) {
    product.variants[variantIndex].image = uploadedImages[0].url;
  }

  await product.save();

  return product.variants[variantIndex];
};
