const express = require("express");
const router = express.Router();

const User = require("../models/User");
const auth = require("../middlewares/authMiddleware");

/* ================= GET WISHLIST ================= */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.wishlist);
  } catch (error) {
    console.error("Get wishlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADD TO WISHLIST ================= */
router.post("/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadyAdded = user.wishlist.includes(req.params.productId);
    if (alreadyAdded) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    user.wishlist.push(req.params.productId);
    await user.save();
    res.json({ message: "Added to wishlist" });

  } catch (error) {
    console.error("Add wishlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= REMOVE FROM WISHLIST ================= */
router.delete("/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );

    await user.save();
    res.json({ message: "Removed from wishlist" });

  } catch (error) {
    console.error("Remove wishlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
