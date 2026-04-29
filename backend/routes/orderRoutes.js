const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelMyOrder
} = require("../controllers/orderController");

const auth = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const sellerMiddleware = require("../middlewares/sellerMiddleware");
const ownerMiddleware = require("../middlewares/ownerMiddleware");

/* ================= USER ================= */
router.post("/", auth, createOrder);
router.get("/my", auth, getMyOrders);
router.put("/:id/cancel", auth, ownerMiddleware("order"), cancelMyOrder);

/* ================= SELLER ================= */
router.get("/seller", auth, sellerMiddleware, getMyOrders); // Orders for seller's products

/* ================= ADMIN ================= */
router.get("/", auth, roleMiddleware("admin"), getAllOrders);
router.get("/:id", auth, roleMiddleware("admin"), getOrderById);
router.put("/:id/status", auth, roleMiddleware("admin"), updateOrderStatus);

module.exports = router;

