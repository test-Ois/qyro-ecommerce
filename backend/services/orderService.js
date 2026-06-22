const Order = require("../models/Order");
const Product = require("../models/Product");
const ApiError = require("../utils/apiError");
const crypto = require("crypto");

exports.createOrder = async (userId, products, totalPrice, paymentMethod = "COD", paymentDetails = null) => {
  if (!products || products.length === 0) {
    throw new ApiError(400, "No products in order");
  }

  // Verify payment signature if card checkout (Bypassed for dummy online payment)
  if (paymentMethod === "Card" || paymentMethod === "ONLINE") {
    /* 
       DUMMY CHECKOUT INTEGRATION:
       Replace with real Razorpay implementation in production:
       - Validate signatures using crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
       - Require razorpay_payment_id, razorpay_order_id, and razorpay_signature
    */
    // No signature check needed for dummy flow
  }

  const formattedProducts = [];

  for (const item of products) {
    const foundProduct = await Product.findById(item.product);
    if (!foundProduct) throw new ApiError(404, "Product not found");

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
      if (!variant) throw new ApiError(400, "Selected variant not found");

      if (variant.stock < quantity) {
        throw new ApiError(400, `Insufficient stock for ${foundProduct.name}`);
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
        throw new ApiError(400, `Insufficient stock for ${foundProduct.name}`);
      }
      foundProduct.stock -= quantity;
    }

    await foundProduct.save();
    formattedProducts.push(finalItem);
  }

  const isOnline = paymentMethod === "Card" || paymentMethod === "ONLINE";
  const orderData = {
    user: userId,
    products: formattedProducts,
    totalPrice,
    paymentMethod: isOnline ? "ONLINE" : paymentMethod,
    paymentStatus: isOnline ? "PAID (DUMMY)" : "pending",
    orderStatus: "processing",
    status: "Pending"
  };

  if (isOnline && paymentDetails) {
    orderData.razorpayDetails = {
      paymentId: paymentDetails.razorpay_payment_id || "dummy_payment_id",
      orderId: paymentDetails.razorpay_order_id || "dummy_order_id",
      signature: paymentDetails.razorpay_signature || "dummy_signature"
    };
  }

  return await Order.create(orderData);
};

exports.getMyOrders = async (userId) => {
  return await Order.find({ user: userId })
    .populate("products.product")
    .sort({ createdAt: -1 });
};

exports.getAllOrders = async () => {
  return await Order.find()
    .populate("user", "name email")
    .populate("products.product", "name image")
    .sort({ createdAt: -1 });
};

exports.getOrderById = async (id) => {
  const order = await Order.findById(id)
    .populate("user", "name email role")
    .populate("products.product", "name image price");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return order;
};

exports.updateOrderStatus = async (id, status) => {
  const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const order = await Order.findById(id).populate("user", "name email");
  if (!order) throw new ApiError(404, "Order not found");

  if (order.status === "Cancelled") {
    throw new ApiError(400, "Order already cancelled");
  }

  order.status = status;
  await order.save();

  return order;
};

exports.cancelMyOrder = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized to cancel this order");
  }

  if (order.status === "Delivered") {
    throw new ApiError(400, "Delivered order cannot be cancelled");
  }

  if (order.status === "Cancelled") {
    throw new ApiError(400, "Order already cancelled");
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

  return order;
};

exports.getSellerOrders = async (sellerId) => {
  const sellerProducts = await Product.find({ seller: sellerId });
  const productIds = sellerProducts.map(p => p._id.toString());

  const orders = await Order.find({ "products.product": { $in: sellerProducts.map(p => p._id) } })
    .populate("user", "name email")
    .populate("products.product")
    .sort({ createdAt: -1 });

  // For safety, only return products that belong to this seller in the response
  const filteredOrders = orders.map(order => {
    const orderObj = order.toObject();
    orderObj.products = orderObj.products.filter(item =>
      item.product && productIds.includes(item.product._id.toString())
    );
    return orderObj;
  });

  return filteredOrders;
};

