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
const admin = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

/* ================= PUBLIC ================= */
router.get("/", getProducts);
router.get("/:id", getProductById);

/* ================= ADMIN ================= */
router.post("/", auth, admin("admin"), upload.uploadDynamic, upload.handleUploadError, addProduct);
router.put("/:id", auth, admin("admin"), upload.uploadDynamic, upload.handleUploadError, updateProduct);
router.delete("/:id", auth, admin("admin"), deleteProduct);

// Variant image upload endpoint
router.post("/:id/variants/:variantId/images", auth, admin("admin"), upload.uploadMultiple, upload.handleUploadError, uploadVariantImages);

/* ================= REVIEW ================= */
router.post("/:id/reviews", auth, addReview);
router.delete("/:id/reviews/:reviewId", auth, admin("admin"), deleteReview);

module.exports = router;