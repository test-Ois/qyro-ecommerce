const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

const razorpay = require("../config/razorpay");

router.get("/key", auth, (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY });
});

router.post("/create-order", auth, async (req, res) => {

  const { amount } = req.body;

  const order = await razorpay.orders.create({

    amount: amount * 100,

    currency: "INR"

  });

  res.json(order);

});

module.exports = router;