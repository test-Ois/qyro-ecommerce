const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/* ========== REGISTER (existing + seller support) ========== */

exports.register = async (req, res) => {

  try {

    const { name, email, password, role, shopName, shopDescription } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (name.length < 3) {
      return res.status(400).json({ message: "Name must be at least 3 characters" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include uppercase, number, and special character."
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If registering as seller, set role and shop details
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role === "seller" ? "seller" : "user",
      shopName: role === "seller" ? shopName || "" : "",
      shopDescription: role === "seller" ? shopDescription || "" : "",
      isApproved: false // Seller needs admin approval
    };

    const user = await User.create(userData);

    await sendEmail(
      user.email,
      role === "seller"
        ? "Q-Mart Seller Application Received"
        : "Welcome to Q-Mart",
      role === "seller"
        ? `Hello ${user.name}, your seller application is under review. We will notify you once approved.`
        : `Hello ${user.name}, your account has been created successfully.`
    );

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        isApproved: user.isApproved
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: role === "seller"
        ? "Seller application submitted. Await admin approval."
        : "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt // FIXED — added createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

/* ========== LOGIN ========== */

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        isApproved: user.isApproved
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt // FIXED — added createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

/* ========== SEND OTP ========== */

exports.sendOTP = async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendEmail(
      user.email,
      "Q-Mart Password Reset OTP",
      `Your OTP for password reset is: ${otp}`
    );

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

/* ========== VERIFY OTP ========== */

exports.verifyOTP = async (req, res) => {

  try {

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

/* ========== RESET PASSWORD ========== */

exports.resetPassword = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password does not meet security requirements"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};