const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const auth = require("../middlewares/authMiddleware");
const admin = require("../middlewares/adminMiddleware");
const superAdmin = require("../middlewares/superAdminMiddleware");

/* ========================================================
   ADMIN STATS — admin + super_admin
   ======================================================== */

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
        label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        revenue: 0,
        orders: 0
      });
    }

    orders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      createdAt.setHours(0, 0, 0, 0);
      const key = createdAt.toISOString().slice(0, 10);
      if (!seriesMap.has(key)) return;
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
      revenueSeries: chartSeries.map((item) => ({ label: item.label, revenue: item.revenue })),
      orderSeries: chartSeries.map((item) => ({ label: item.label, orders: item.orders }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================================================
   TOP PRODUCTS — admin + super_admin
   ======================================================== */

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

/* ========================================================
   SALES ANALYTICS — admin + super_admin
   ======================================================== */

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

/* ========================================================
   GET ALL USERS — admin + super_admin
   ======================================================== */

router.get("/users", auth, admin, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["user", "seller"] } })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================================================
   GET ALL SELLERS — admin + super_admin
   ======================================================== */

router.get("/sellers", auth, admin, async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================================================
   APPROVE SELLER — admin + super_admin
   ======================================================== */

router.put("/sellers/:id/approve", auth, admin, async (req, res) => {
  try {
    const seller = await User.findOneAndUpdate(
      { _id: req.params.id, role: "seller" },
      { isApproved: true, approvalStatus: "approved" },
      { new: true }
    ).select("-password");

    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json({ message: "Seller approved", seller });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================================================
   REJECT SELLER — admin + super_admin
   ======================================================== */

router.put("/sellers/:id/reject", auth, admin, async (req, res) => {
  try {
    const seller = await User.findOneAndUpdate(
      { _id: req.params.id, role: "seller" },
      { isApproved: false, approvalStatus: "rejected" },
      { new: true }
    ).select("-password");

    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json({ message: "Seller rejected", seller });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================================================
   UPDATE COMMISSION RATE — admin + super_admin
   ======================================================== */

router.put("/sellers/:id/commission", auth, admin, async (req, res) => {
  try {
    const { commissionRate } = req.body;
    if (commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ message: "Commission must be between 0-100" });
    }
    const seller = await User.findOneAndUpdate(
      { _id: req.params.id, role: "seller" },
      { commissionRate },
      { new: true }
    ).select("-password");
    res.json({ message: "Commission updated", seller });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================================================
   BLOCK / UNBLOCK USER — admin + super_admin
   ======================================================== */

router.put("/users/:id/block", auth, admin, async (req, res) => {
  try {
    // Prevent blocking super_admin accounts
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.role === "super_admin") {
      return res.status(403).json({ message: "Cannot block a super admin" });
    }

    target.isBlocked = true;
    // Invalidate refresh token to force immediate logout
    target.refreshToken = null;
    target.refreshTokenExpire = null;
    await target.save();

    res.json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/users/:id/unblock", auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User unblocked successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================================================
   SUPER ADMIN ONLY — Admin Account Management
   ======================================================== */

// List all pending admins awaiting approval
router.get("/pending-admins", auth, superAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin", approvalStatus: "pending" })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// List all admins
router.get("/admins", auth, superAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["admin", "super_admin"] } })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Approve admin
router.put("/admins/:id/approve", auth, superAdmin, async (req, res) => {
  try {
    const adminUser = await User.findOneAndUpdate(
      { _id: req.params.id, role: "admin" },
      { isApproved: true, approvalStatus: "approved" },
      { new: true }
    ).select("-password");
    if (!adminUser) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin approved", admin: adminUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Reject admin
router.put("/admins/:id/reject", auth, superAdmin, async (req, res) => {
  try {
    const adminUser = await User.findOneAndUpdate(
      { _id: req.params.id, role: "admin" },
      { isApproved: false, approvalStatus: "rejected" },
      { new: true }
    ).select("-password");
    if (!adminUser) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin rejected", admin: adminUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Block admin
router.put("/admins/:id/block", auth, superAdmin, async (req, res) => {
  try {
    const target = await User.findOne({ _id: req.params.id, role: "admin" });
    if (!target) return res.status(404).json({ message: "Admin not found" });

    target.isBlocked = true;
    target.refreshToken = null;
    target.refreshTokenExpire = null;
    await target.save();

    res.json({ message: "Admin blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Unblock admin
router.put("/admins/:id/unblock", auth, superAdmin, async (req, res) => {
  try {
    const target = await User.findOne({ _id: req.params.id, role: "admin" });
    if (!target) return res.status(404).json({ message: "Admin not found" });

    target.isBlocked = false;
    await target.save();

    res.json({ message: "Admin unblocked successfully", admin: target });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Promote admin to super_admin
router.put("/admins/:id/promote", auth, superAdmin, async (req, res) => {
  try {
    const adminUser = await User.findOneAndUpdate(
      { _id: req.params.id, role: "admin" },
      { role: "super_admin", isApproved: true, approvalStatus: "approved" },
      { new: true }
    ).select("-password");
    if (!adminUser) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin promoted to super admin", admin: adminUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Demote super_admin to admin
router.put("/admins/:id/demote", auth, superAdmin, async (req, res) => {
  try {
    const target = await User.findOne({ _id: req.params.id, role: "super_admin" });
    if (!target) return res.status(404).json({ message: "Super admin not found" });

    // Prevent self-demotion
    if (target._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot demote yourself" });
    }

    target.role = "admin";
    await target.save();

    res.json({ message: "Super admin demoted to admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Block seller — super_admin only
router.put("/sellers/:id/block", auth, superAdmin, async (req, res) => {
  try {
    const seller = await User.findOne({ _id: req.params.id, role: "seller" });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    seller.isBlocked = true;
    seller.refreshToken = null;
    seller.refreshTokenExpire = null;
    await seller.save();

    res.json({ message: "Seller blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
