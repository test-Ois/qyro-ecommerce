const productService = require("../services/productService");

/* ================= GET ALL PRODUCTS ================= */
exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET PRODUCT BY ID ================= */
exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Get Product By ID Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADD PRODUCT ================= */
exports.addProduct = async (req, res) => {
  try {
    const saved = await productService.createProduct(req, req.user.id);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Add Product Error:", error.stack || error.message || error);
    res.status(500).json({ message: "Product create failed" });
  }
};

/* ================= UPDATE PRODUCT ================= */
exports.updateProduct = async (req, res) => {
  try {
    const updated = await productService.updateProduct(req.params.id, req);
    res.json(updated);
  } catch (error) {
    console.error("Update Product Error:", error.message);
    if (error.message === "Product not found") {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};;

/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete Product Error:", error.message);
    if (error.message === "Product not found") {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPLOAD VARIANT IMAGES ================= */
exports.uploadVariantImages = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const variant = await productService.uploadVariantImages(id, variantId, req.files);

    res.json({ message: "Variant images uploaded successfully", variant });
  } catch (error) {
    console.error("Upload Variant Images Error:", error.message);
    if (error.message === "Product not found" || error.message === "Variant not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

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