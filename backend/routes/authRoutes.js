const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  loginLimiter,
  registerLimiter,
  otpLimiter,
  passwordResetLimiter,
  refreshTokenLimiter
} = require("../middlewares/rateLimiter");

const { validateRegister, validateLogin, validateSendOTP, validateVerifyOTP, validateResetPassword, validateRefreshToken } = require("../validators/authValidator");

const {
  register,
  login,
  sendOTP,
  verifyOTP,
  resetPassword,
  refreshToken,
  logout
} = require("../controllers/authController");

/**
 * VALIDATION & RATE LIMITING MIDDLEWARE
 * All requests are validated for format and rate limited to prevent attacks
 */

// Validation middleware that checks request body and returns formatted errors
const validateRequest = (validationFn) => {
  return (req, res, next) => {
    const { error, value } = validationFn(req.body);
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ 
        success: false,
        message: "Validation failed",
        errors: messages 
      });
    }
    req.validatedData = value;
    next();
  };
};

// Public routes (require rate limiting & validation)
router.post("/register", registerLimiter, validateRequest(validateRegister), register);
router.post("/login", loginLimiter, validateRequest(validateLogin), login);
router.post("/send-otp", otpLimiter, validateRequest(validateSendOTP), sendOTP);
router.post("/verify-otp", otpLimiter, validateRequest(validateVerifyOTP), verifyOTP);
router.post("/reset-password", passwordResetLimiter, validateRequest(validateResetPassword), resetPassword);
router.post("/refresh-token", refreshTokenLimiter, validateRequest(validateRefreshToken), refreshToken);

// Protected route (requires auth)
router.post("/logout", authMiddleware, logout);

module.exports = router;
