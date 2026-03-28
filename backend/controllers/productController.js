const Product = require("../models/Product");
const parseVariants = require("../utils/parseVariants");
const { deleteProductImages } = require("../utils/imageUtils");

/* ================= GET ALL PRODUCTS ================= */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET PRODUCT BY ID ================= */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

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
    // Handle multiple images for the main product
    let productImages = [];
    if (req.files) {
      // Filter files for main product images (not variant images)
      const mainImages = req.files.filter(file =>
        file.fieldname === 'images' ||
        (!file.fieldname.startsWith('variant_') && file.fieldname !== 'variantImages')
      );

      productImages = mainImages.map((file, index) => ({
        url: file.path,
        type: index === 0 ? "main" : "gallery",
        publicId: file.filename,
        altText: `${req.body.name} - Image ${index + 1}`
      }));
    }

    // Fallback to single image for backward compatibility
    const legacyImage = productImages.length > 0 ? productImages[0].url : "";

    // Parse variants and assign images if provided
    let parsedVariants = [];
    if (req.body.variants) {
      parsedVariants = parseVariants(req.body.variants, legacyImage);

      // Handle variant-specific images from uploaded files and req.body.variantImages
      if (req.body.variantImages) {
        const variantImagesData = JSON.parse(req.body.variantImages || '[]');

        parsedVariants = parsedVariants.map((variant, index) => {
          const variantImageData = variantImagesData[index];
          const variantFiles = req.files.filter(file =>
            file.fieldname === `variant_${index}_images`
          );

          const uploadedImages = variantFiles.map((file, imgIndex) => ({
            url: file.path,
            type: imgIndex === 0 ? "main" : "gallery",
            publicId: file.filename,
            altText: `${req.body.name} - ${variant.color || variant.size} - Image ${imgIndex + 1}`
          }));

          if (uploadedImages.length > 0 || (variantImageData && variantImageData.images)) {
            return {
              ...variant,
              images: [
                ...(variantImageData?.images || []),
                ...uploadedImages
              ]
            };
          }
          return variant;
        });
      }
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
      isBanner: req.body.isBanner === "true",
      isSideBanner: req.body.isSideBanner === "true",
      isDeal: req.body.isDeal === "true",
      bannerType: req.body.bannerType || "none"
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Add Product Error:", error.stack || error.message || error);
    res.status(500).json({ message: "Product create failed" });
  }
};

/* ================= UPDATE PRODUCT ================= */
exports.updateProduct = async (req, res) => {
  try {
    // Handle multiple images for the main product
    let productImages = [];
    if (req.files) {
      // Filter files for main product images (not variant images)
      const mainImages = req.files.filter(file =>
        file.fieldname === 'images' ||
        (!file.fieldname.startsWith('variant_') && file.fieldname !== 'variantImages')
      );

      productImages = mainImages.map((file, index) => ({
        url: file.path,
        type: index === 0 ? "main" : "gallery",
        publicId: file.filename,
        altText: `${req.body.name || 'Product'} - Image ${index + 1}`
      }));
    }

    // Fallback to single image for backward compatibility
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

    if (req.files && req.files.length > 0) {
      updateData.image = legacyImage;
      updateData.images = productImages;
    }

    // Handle variant updates with images
    if (req.body.variants !== undefined) {
      let parsedVariants = parseVariants(req.body.variants, legacyImage);

      // Handle variant-specific images from uploaded files and req.body.variantImages
      if (req.body.variantImages) {
        const variantImagesData = JSON.parse(req.body.variantImages || '[]');

        parsedVariants = parsedVariants.map((variant, index) => {
          const variantImageData = variantImagesData[index];
          const variantFiles = req.files.filter(file =>
            file.fieldname === `variant_${index}_images`
          );

          const uploadedImages = variantFiles.map((file, imgIndex) => ({
            url: file.path,
            type: imgIndex === 0 ? "main" : "gallery",
            publicId: file.filename,
            altText: `${req.body.name || 'Product'} - ${variant.color || variant.size} - Image ${imgIndex + 1}`
          }));

          if (uploadedImages.length > 0 || (variantImageData && variantImageData.images)) {
            return {
              ...variant,
              images: [
                ...(variantImageData?.images || []),
                ...uploadedImages
              ]
            };
          }
          return variant;
        });
      }

      updateData.variants = parsedVariants;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update Product Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};;

/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    await deleteProductImages(product);

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete Product Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPLOAD VARIANT IMAGES ================= */
exports.uploadVariantImages = async (req, res) => {
  try {
    const { id, variantId } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
    if (variantIndex === -1) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Handle multiple images for this variant
    let variantImages = [];
    if (req.files && req.files.length > 0) {
      variantImages = req.files.map((file, index) => ({
        url: file.path,
        type: index === 0 ? "main" : "gallery",
        publicId: file.filename,
        altText: `${product.name} - ${product.variants[variantIndex].color || product.variants[variantIndex].size} - Image ${index + 1}`
      }));
    }

    // Update the variant with new images
    product.variants[variantIndex].images = [
      ...(product.variants[variantIndex].images || []),
      ...variantImages
    ];

    // Also update the legacy image field if this is the first image
    if (variantImages.length > 0 && !product.variants[variantIndex].image) {
      product.variants[variantIndex].image = variantImages[0].url;
    }

    await product.save();

    res.json({
      message: "Variant images uploaded successfully",
      variant: product.variants[variantIndex]
    });
  } catch (error) {
    console.error("Upload Variant Images Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADD REVIEW ================= */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    product.averageRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added" });
  } catch (error) {
    console.error("Add Review Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE REVIEW ================= */
exports.deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== req.params.reviewId
    );

    product.numReviews = product.reviews.length;

    product.averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
          product.reviews.length
        : 0;

    await product.save();

    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Delete Review Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};