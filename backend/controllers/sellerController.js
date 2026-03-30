const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const parseVariants = require("../utils/parseVariants");

/* ========== GET SELLER DASHBOARD STATS ========== */
exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const products = await Product.find({ seller: sellerId });
    const productIds = products.map((p) => p._id.toString());

    const orders = await Order.find({
      "products.product": { $in: products.map((p) => p._id) }
    });

    let totalRevenue = 0;

    orders.forEach((order) => {
      order.products.forEach((item) => {
        if (item.product && productIds.includes(item.product.toString())) {
          const product = products.find(
            (p) => p._id.toString() === item.product.toString()
          );

          if (product) {
            totalRevenue += product.price * item.quantity;
          }
        }
      });
    });

    const seller = await User.findById(sellerId);
    const commissionRate = seller?.commissionRate || 0;
    const commissionAmount = (totalRevenue * commissionRate) / 100;
    const netEarnings = totalRevenue - commissionAmount;

    res.json({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      commissionRate,
      commissionAmount,
      netEarnings
    });
  } catch (error) {
    console.error("Seller stats error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========== GET SELLER PRODUCTS ========== */
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });
    res.json(products);
  } catch (error) {
    console.error("Get seller products error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========== ADD SELLER PRODUCT ========== */
exports.addSellerProduct = async (req, res) => {
  try {
    // Handle multiple images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        url: file.path,
        type: index === 0 ? "main" : "gallery", // First image is main
        publicId: file.filename,
        altText: `${req.body.name} - Image ${index + 1}`
      }));
    }

    // Fallback to single image for backward compatibility
    const legacyImage = images.length > 0 ? images[0].url : "";

    const parsedVariants = parseVariants(req.body.variants, legacyImage);

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock || 0,
      image: legacyImage, // Keep for backward compatibility
      images: images,
      seller: req.user.id,
      variants: parsedVariants
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Add seller product error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

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