const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

/**
 * PRODUCTION RATE LIMITING
 * Protection against brute force attacks and spam
 * Uses in-memory store (for production, use Redis)
 *
 * NOTE: express-rate-limit v8+ requires using ipKeyGenerator()
 * when referencing req.ip in custom keyGenerator functions.
 * This prevents IPv6 users from bypassing limits by cycling
 * through addresses within their allocated subnet.
 */

/**
 * LOGIN RATE LIMITER
 * Limit: 5 attempts per 15 minutes per IP
 * Applied to: POST /api/auth/login
 */
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req, res) => {
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") return true;
    return res.statusCode < 400;
  }
});

/**
 * REGISTER RATE LIMITER
 * Limit: 3 attempts per hour per IP
 * Applied to: POST /api/auth/register
 * Prevents spam account creation
 */
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: "Too many accounts created from this IP. Please try again after 1 hour.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
});

/**
 * OTP RATE LIMITER
 * Limit: 5 OTP requests per hour per email
 * Applied to: POST /api/auth/send-otp
 * Prevents OTP spam and enumeration attacks
 */
exports.otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many OTP requests. Please try again later.",
  keyGenerator: (req, res) => {
    // Rate limit by email, not IP (since multiple users might share IP)
    // Falls back to IPv6-safe IP key when email is not provided
    return req.body?.email || ipKeyGenerator(req);
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
});

/**
 * PASSWORD RESET RATE LIMITER
 * Limit: 3 attempts per hour per email
 * Applied to: POST /api/auth/reset-password
 */
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many password reset attempts. Please try again later.",
  keyGenerator: (req, res) => {
    // Falls back to IPv6-safe IP key when email is not provided
    return req.body?.email || ipKeyGenerator(req);
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
});

/**
 * REFRESH TOKEN RATE LIMITER
 * Limit: 10 attempts per 5 minutes per token
 * Applied to: POST /api/auth/refresh-token
 */
exports.refreshTokenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: "Too many token refresh attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
});
