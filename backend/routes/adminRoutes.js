const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const auth = require("../middlewares/authMiddleware");
const admin = require("../middlewares/adminMiddleware");

/* ========== ADMIN STATS (existing) ========== */

router.get("/stats", auth, admin, async (req, res) => {

  try {

    const products = await Product.countDocuments();
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    const users = await User.countDocuments();
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
    const recentOrders = orders.slice(0, 5).map((order) => ({
      _id: order._id,
      totalPrice: order.totalPrice,
      status: order.status || order.orderStatus || "Pending",
      createdAt: order.createdAt,
      user: order.user
    }));

    const seriesMap = new Map();

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);

      const key = date.toISOString().slice(0, 10);
      seriesMap.set(key, {
        label: date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short"
        }),
        revenue: 0,
        orders: 0
      });
    }

    orders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      createdAt.setHours(0, 0, 0, 0);
      const key = createdAt.toISOString().slice(0, 10);

      if (!seriesMap.has(key)) {
        return;
      }

      const current = seriesMap.get(key);
      current.revenue += Number(order.totalPrice) || 0;
      current.orders += 1;
    });

    const chartSeries = Array.from(seriesMap.values());

    res.json({
      products,
      orders: orders.length,
      users,
      totalRevenue,
      recentOrders,
      revenueSeries: chartSeries.map((item) => ({
        label: item.label,
        revenue: item.revenue
      })),
      orderSeries: chartSeries.map((item) => ({
        label: item.label,
        orders: item.orders
      }))
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }

});

/* ========== TOP PRODUCTS (existing) ========== */

router.get("/top-products", auth, admin, async (req, res) => {

  try {

    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalOrders: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.quantity", "$totalPrice"] } }
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          name: "$productInfo.name",
          image: "$productInfo.image",
          totalOrders: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json(topProducts);

  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({ message: "Server error" });
  }

});

/* ========== SALES ANALYTICS (existing) ========== */

router.get("/sales-analytics", auth, admin, async (req, res) => {

  try {

    const orders = await Order.find();

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const monthlyMap = {};

    orders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "long",
        year: "numeric"
      });
      monthlyMap[month] = (monthlyMap[month] || 0) + order.totalPrice;
    });

    const bestMonth = Object.entries(monthlyMap).sort((a, b) => b[1] - a[1])[0];

    res.json({
      totalRevenue,
      avgOrderValue: Math.round(avgOrderValue),
      bestMonth: bestMonth ? bestMonth[0] : "N/A",
      bestMonthRevenue: bestMonth ? bestMonth[1] : 0
    });

  } catch (error) {
    console.error("Sales analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }

});

/* ========== GET ALL SELLERS - Admin (new) ========== */

router.get("/sellers", auth, admin, async (req, res) => {

  try {

    // Get all users with seller role
    const sellers = await User.find({ role: "seller" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(sellers);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }

});

/* ========== APPROVE SELLER - Admin (new) ========== */

router.put("/sellers/:id/approve", auth, admin, async (req, res) => {

  try {

    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select("-password");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json({ message: "Seller approved", seller });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }

});

/* ========== REJECT SELLER - Admin (new) ========== */

router.put("/sellers/:id/reject", auth, admin, async (req, res) => {

  try {

    // Set role back to user and remove approval
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, role: "user" },
      { new: true }
    ).select("-password");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json({ message: "Seller rejected", seller });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }

});

/* ========== UPDATE COMMISSION RATE - Admin (new) ========== */

router.put("/sellers/:id/commission", auth, admin, async (req, res) => {

  try {

    const { commissionRate } = req.body;

    if (commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ message: "Commission must be between 0-100" });
    }

    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { commissionRate },
      { new: true }
    ).select("-password");

    res.json({ message: "Commission updated", seller });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }

});

module.exports = router;

