const express = require("express");
const router = express.Router();

const razorpay = require("../config/razorpay");

router.post("/create-order", async (req, res) => {

  const { amount } = req.body;

  const order = await razorpay.orders.create({

    amount: amount * 100,

    currency: "INR"

  });

  res.json(order);

});

module.exports = router;