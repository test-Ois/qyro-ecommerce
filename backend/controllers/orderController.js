const orderService = require("../services/orderService");
const asyncHandler = require("../utils/asyncHandler");

exports.createOrder = asyncHandler(async (req, res) => {
  const { products, totalPrice } = req.body;
  const order = await orderService.createOrder(req.user.id, products, totalPrice);

  req.io?.to("admin-room").emit("new-order", {
    message: `New order placed by user`,
    orderId: order._id,
    totalPrice: order.totalPrice,
    time: new Date().toLocaleTimeString()
  });

  res.json(order);
});

/* ========== GET MY ORDERS ========== */
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user.id);
  res.json(orders);
});

/* ========== GET ALL ORDERS - Admin ========== */
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.json(orders);
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json(order);
});

/* ========== UPDATE ORDER STATUS - Admin ========== */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status);

  req.io?.to(order.user._id.toString()).emit("order-status-update", {
    message: `Your order is now ${status}`,
    orderId: order._id,
    status
  });

  res.json(order);
});

/* ========== CANCEL MY ORDER - USER ========== */
exports.cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelMyOrder(req.params.id, req.user.id);

  req.io?.to("admin-room").emit("order-cancelled", {
    message: "Order cancelled by user",
    orderId: order._id
  });

  req.io?.to(req.user.id).emit("order-status-update", {
    message: "Your order has been cancelled",
    orderId: order._id,
    status: "Cancelled"
  });

  res.json({ message: "Order cancelled successfully", order });
});
