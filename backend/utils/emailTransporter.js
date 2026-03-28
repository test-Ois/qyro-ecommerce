const nodemailer = require("nodemailer");

/**
 * Centralized email transporter configuration
 * Prevents duplicate transporter creation across the app
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = transporter;
