const Order = require("../models/Order");
const Product = require("../models/Product");

/* ========== CREATE ORDER ========== */
exports.createOrder = async (req, res) => {
  try {
    const { products, totalPrice } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    const formattedProducts = [];

    for (const item of products) {
      const foundProduct = await Product.findById(item.product);

      if (!foundProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      const quantity = Number(item.quantity) || 1;

      let finalItem = {
        product: item.product,
        quantity,
        variantId: "",
        size: "",
        color: "",
        price: foundProduct.price,
        image: foundProduct.image || "",
        name: foundProduct.name || ""
      };

      if (item.variantId) {
        const variant = foundProduct.variants.id(item.variantId);

        if (!variant) {
          return res.status(400).json({ message: "Selected variant not found" });
        }

        if (variant.stock < quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${foundProduct.name}`
          });
        }

        variant.stock -= quantity;

        finalItem = {
          product: item.product,
          quantity,
          variantId: variant._id.toString(),
          size: item.size || variant.size || "",
          color: item.color || variant.color || "",
          price: item.price || variant.price || foundProduct.price,
          image: item.image || variant.image || foundProduct.image || "",
          name: item.name || foundProduct.name || ""
        };
      } else {
        if ((foundProduct.stock || 0) < quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${foundProduct.name}`
          });
        }

        foundProduct.stock -= quantity;
      }

      await foundProduct.save();
      formattedProducts.push(finalItem);
    }

    const order = await Order.create({
      user: req.user.id,
      products: formattedProducts,
      totalPrice
    });

    req.io.to("admin-room").emit("new-order", {
      message: `New order placed by user`,
      orderId: order._id,
      totalPrice: order.totalPrice,
      time: new Date().toLocaleTimeString()
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========== GET MY ORDERS ========== */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id
    })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========== GET ALL ORDERS - Admin ========== */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ========== UPDATE ORDER STATUS - Admin ========== */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id).populate("user", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    order.status = status;
    await order.save();

    req.io.to(order.user._id.toString()).emit("order-status-update", {
      message: `Your order is now ${status}`,
      orderId: order._id,
      status
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ========== CANCEL MY ORDER - USER ========== */
exports.cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Delivered order cannot be cancelled" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    for (const item of order.products) {
      const foundProduct = await Product.findById(item.product);
      if (!foundProduct) continue;

      if (item.variantId) {
        const variant = foundProduct.variants.id(item.variantId);
        if (variant) {
          variant.stock += Number(item.quantity) || 1;
        }
      } else {
        foundProduct.stock = (foundProduct.stock || 0) + (Number(item.quantity) || 1);
      }

      await foundProduct.save();
    }

    order.status = "Cancelled";
    await order.save();

    req.io.to("admin-room").emit("order-cancelled", {
      message: "Order cancelled by user",
      orderId: order._id
    });

    req.io.to(req.user.id).emit("order-status-update", {
      message: "Your order has been cancelled",
      orderId: order._id,
      status: "Cancelled"
    });

    res.json({
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};