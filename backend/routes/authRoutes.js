const express = require("express");
const router = express.Router();

const {
 register,
 login,
 sendOTP,
 verifyOTP,
 resetPassword
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

module.exports = router;