const productService = require("../services/productService");
const asyncHandler = require("../utils/asyncHandler");

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();
  res.json(products);
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json(product);
});

exports.addProduct = asyncHandler(async (req, res) => {
  const saved = await productService.createProduct(req, req.user.id);
  res.status(201).json(saved);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const updated = await productService.updateProduct(req.params.id, req);
  res.json(updated);
});

/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user.id);
  res.json({ message: "Product deleted" });
});

/* ================= UPLOAD VARIANT IMAGES ================= */
exports.uploadVariantImages = asyncHandler(async (req, res) => {
  const { id, variantId } = req.params;
  const variant = await productService.uploadVariantImages(id, variantId, req.files);
  res.json({ message: "Variant images uploaded successfully", variant });
});

/* ================= ADD REVIEW ================= */
exports.addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await productService.addReview(req.params.id, req.user, rating, comment);
  res.status(201).json({ message: "Review added", product });
});

/* ================= DELETE REVIEW ================= */
exports.deleteReview = asyncHandler(async (req, res) => {
  await productService.deleteReview(req.params.id, req.params.reviewId);
  res.json({ message: "Review deleted" });
});

/* ================= ADD REVIEW ================= */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await productService.addReview(req.params.id, req.user, rating, comment);
    res.status(201).json({ message: "Review added", product });
  } catch (error) {
    console.error("Add Review Error:", error.message);
    if (error.message === "Product not found") {
      return res.status(404).json({ message: "Product not found" });
    }
    if (error.message === "Product already reviewed") {
      return res.status(400).json({ message: "Product already reviewed" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE REVIEW ================= */
exports.deleteReview = async (req, res) => {
  try {
    await productService.deleteReview(req.params.id, req.params.reviewId);
    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Delete Review Error:", error.message);
    if (error.message === "Product not found") {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};