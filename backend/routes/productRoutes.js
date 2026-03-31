const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview,
  uploadVariantImages
} = require("../controllers/productController");

const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");
const ownerMiddleware = require("../middleware/ownerMiddleware");
const upload = require("../middleware/upload");

/* ================= PUBLIC ================= */
router.get("/", getProducts);
router.get("/:id", getProductById);

/* ================= SELLER ================= */
// Sellers can manage their own products
router.post("/", auth, sellerMiddleware, upload.uploadDynamic, upload.handleUploadError, addProduct);
router.put("/:id", auth, sellerMiddleware, ownerMiddleware("product"), upload.uploadDynamic, upload.handleUploadError, updateProduct);
router.delete("/:id", auth, sellerMiddleware, ownerMiddleware("product"), deleteProduct);

// Variant image upload for sellers
router.post("/:id/variants/:variantId/images", auth, sellerMiddleware, ownerMiddleware("product"), upload.uploadMultiple, upload.handleUploadError, uploadVariantImages);

/* ================= ADMIN ================= */
// Admin can manage any product (override seller restrictions)
router.put("/:id/admin", auth, roleMiddleware("admin"), upload.uploadDynamic, upload.handleUploadError, updateProduct);
router.delete("/:id/admin", auth, roleMiddleware("admin"), deleteProduct);

/* ================= REVIEW ================= */
router.post("/:id/reviews", auth, addReview);
router.delete("/:id/reviews/:reviewId", auth, roleMiddleware("admin"), deleteReview);

module.exports = router;