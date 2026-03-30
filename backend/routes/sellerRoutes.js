const express = require("express");
const router = express.Router();

const {
  getSellerStats,
  getSellerProducts,
  addSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  uploadSellerVariantImages
} = require("../controllers/sellerController");

const auth = require("../middleware/authMiddleware");
const seller = require("../middleware/sellerMiddleware");
const upload = require("../middleware/upload");

/* ========== SELLER DASHBOARD STATS ========== */
router.get("/stats", auth, seller, getSellerStats);

/* ========== GET SELLER PRODUCTS ========== */
router.get("/products", auth, seller, getSellerProducts);

/* ========== ADD PRODUCT ========== */
router.post("/products", auth, seller, upload.uploadMultiple, addSellerProduct);

/* ========== UPDATE PRODUCT ========== */
router.put("/products/:id", auth, seller, upload.uploadMultiple, updateSellerProduct);

/* ========== DELETE PRODUCT ========== */
router.delete("/products/:id", auth, seller, deleteSellerProduct);

/* ========== UPLOAD VARIANT IMAGES (NEW) ========== */
router.post("/products/:id/variants/:variantId/images", auth, seller, upload.uploadMultiple, uploadSellerVariantImages);

module.exports = router;