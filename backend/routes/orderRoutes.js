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
const admin = require("../middleware/adminMiddleware");

/* CREATE ORDER */
router.post("/", auth, createOrder);

/* GET MY ORDERS - User */
router.get("/my", auth, getMyOrders);

/* GET ALL ORDERS - Admin */
router.get("/", auth, admin, getAllOrders);

/* UPDATE ORDER STATUS - Admin */
router.put("/:id/status", auth, admin, updateOrderStatus);

/* CANCEL MY ORDER - User */
router.put("/:id/cancel", auth, cancelMyOrder);

module.exports = router;