const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder
} = require("../controllers/orderController");

const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");
const ownerMiddleware = require("../middleware/ownerMiddleware");

/* ================= USER ================= */
router.post("/", auth, createOrder);
router.get("/my", auth, getMyOrders);
router.put("/:id/cancel", auth, ownerMiddleware("order"), cancelMyOrder);

/* ================= SELLER ================= */
router.get("/seller", auth, sellerMiddleware, getMyOrders); // Orders for seller's products

/* ================= ADMIN ================= */
router.get("/", auth, roleMiddleware("admin"), getAllOrders);
router.put("/:id/status", auth, roleMiddleware("admin"), updateOrderStatus);

module.exports = router;