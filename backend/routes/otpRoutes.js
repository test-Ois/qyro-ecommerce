const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

// Maintain path compatibility but use the secure database-backed authService
router.post("/send", asyncHandler(async (req, res) => {
  const payload = await authService.sendOTP(req.body.email);
  res.json(payload);
}));

router.post("/verify", asyncHandler(async (req, res) => {
  const payload = await authService.verifyOTP(req.body);
  res.json(payload);
}));

module.exports = router;