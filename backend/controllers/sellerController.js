const sellerService = require("../services/sellerService");
const asyncHandler = require("../utils/asyncHandler");

exports.getSellerStats = asyncHandler(async (req, res) => {
  const stats = await sellerService.getSellerStats(req.user.id);
  res.json(stats);
});

exports.getSellerProducts = asyncHandler(async (req, res) => {
  const products = await sellerService.getSellerProducts(req.user.id);
  res.json(products);
});

exports.addSellerProduct = asyncHandler(async (req, res) => {
  const saved = await sellerService.addSellerProduct(req, req.user.id);
  res.status(201).json(saved);
});

exports.updateSellerProduct = asyncHandler(async (req, res) => {
  const updated = await sellerService.updateSellerProduct(req.params.id, req, req.user.id);
  res.json(updated);
});

exports.deleteSellerProduct = asyncHandler(async (req, res) => {
  const result = await sellerService.deleteSellerProduct(req.params.id, req.user.id);
  res.json(result);
});

exports.uploadSellerVariantImages = asyncHandler(async (req, res) => {
  const variant = await sellerService.uploadSellerVariantImages(req.params.id, req.params.variantId, req, req.user.id);
  res.json({ message: "Variant images uploaded successfully", variant });
});

/* ========== UPDATE SELLER PRODUCT ========== */
exports.updateSellerProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Handle multiple images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        url: file.path,
        type: index === 0 ? "main" : "gallery", // First image is main
        publicId: file.filename,
        altText: `${req.body.name || product.name} - Image ${index + 1}`
      }));
    }

    // Fallback to single image for backward compatibility
    const legacyImage = images.length > 0 ? images[0].url : "";

    const updateData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock
    };

    if (req.files && req.files.length > 0) {
      updateData.image = legacyImage; // Keep for backward compatibility
      updateData.images = images;
    }

    if (req.body.variants !== undefined) {
      updateData.variants = parseVariants(req.body.variants, legacyImage || product.image);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true
    });

    res.json(updated);
  } catch (error) {
    console.error("Update seller product error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========== DELETE SELLER PRODUCT ========== */
exports.deleteSellerProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete seller product error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========== UPLOAD VARIANT IMAGES (SELLER) ========== */
exports.uploadSellerVariantImages = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    
    // Verify product exists and belongs to seller
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find variant
    const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
    if (variantIndex === -1) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Build image records from uploaded files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const uploadedImages = req.files.map((file, index) => ({
      url: file.path,
      type: index === 0 ? "main" : "gallery",
      publicId: file.filename,
      altText: `${product.name} - ${product.variants[variantIndex].color || product.variants[variantIndex].size} - Image ${index + 1}`
    }));

    // Add to variant images
    product.variants[variantIndex].images = [
      ...(product.variants[variantIndex].images || []),
      ...uploadedImages
    ];

    const updated = await product.save();

    res.json({ 
      message: "Variant images uploaded successfully", 
      variant: updated.variants[variantIndex] 
    });
  } catch (error) {
    console.error("Upload seller variant images error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};