const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const sendEmail = require("../utils/sendEmail");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      role: user.role,
      isApproved: user.isApproved
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

exports.register = async ({ name, email, password, role = "user", shopName, shopDescription }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // SECURITY: Public register only allows user and seller roles.
  // admin and super_admin registration is strictly prohibited through this endpoint.
  if (role === "admin" || role === "super_admin") {
    throw new ApiError(403, "Admin registration is not permitted through this endpoint.");
  }

  const userRole = role === "seller" ? "seller" : "user";

  if (name.length < 3) {
    throw new ApiError(400, "Name must be at least 3 characters");
  }

  if (!passwordRegex.test(password)) {
    throw new ApiError(400, "Password must be at least 8 characters and include uppercase, number, and special character.");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    logger.logRegistrationFailure(normalizedEmail, "Email already registered");
    throw new ApiError(400, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = {
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: userRole,
    shopName: userRole === "seller" ? shopName || "" : "",
    shopDescription: userRole === "seller" ? shopDescription || "" : "",
    isApproved: false,
    // Sellers start pending, users are auto-approved
    approvalStatus: userRole === "seller" ? "pending" : "approved"
  };

  try {
    const user = await User.create(userData);

    // Send welcome email (don't fail registration if email fails)
    try {
      await sendEmail(
        user.email,
        userRole === "seller" ? "Qyro Seller Application Received" : "Welcome to Qyro",
        userRole === "seller"
          ? `Hello ${user.name}, your seller application is under review. We will notify you once approved.`
          : `Hello ${user.name}, your account has been created successfully.`
      );
    } catch (err) {
      logger.logAuthError(err, { context: "email_send_failed", email: normalizedEmail });
    }

    logger.logRegistration(normalizedEmail, userRole);

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in user
    user.refreshToken = refreshToken;
    user.refreshTokenExpire = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save();

    return {
      message: userRole === "seller" ? "Seller application submitted. Await admin approval." : "User created successfully",
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "Email already exists");
    }

    throw error;
  }
};

// ADMIN REGISTRATION — separate endpoint, requires super_admin approval
exports.adminRegister = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (name.length < 3) {
    throw new ApiError(400, "Name must be at least 3 characters");
  }

  if (!passwordRegex.test(password)) {
    throw new ApiError(400, "Password must be at least 8 characters and include uppercase, number, and special character.");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    logger.logRegistrationFailure(normalizedEmail, "Email already registered");
    throw new ApiError(400, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      isApproved: false,
      approvalStatus: "pending"
    });

    logger.logRegistration(normalizedEmail, "admin");

    return {
      message: "Admin registration submitted. Await super admin approval before accessing the dashboard.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "Email already exists");
    }
    throw error;
  }
};

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    logger.logLoginFailure(email, "User not found");
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isBlocked) {
    logger.logLoginFailure(email, "Blocked account");
    throw new ApiError(403, "Your account has been blocked");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.logLoginFailure(email, "Invalid password");
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token
  user.refreshToken = refreshToken;
  user.refreshTokenExpire = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await user.save();

  // Log successful login for security audit
  logger.logLoginSuccess(email, user.role);

  return {
    message: "Login successful",
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      createdAt: user.createdAt
    }
  };
};

exports.sendOTP = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // SECURITY: Generic error prevents account enumeration
    logger.logAuthError(new Error(`OTP requested for non-existent user`), { email });
    throw new ApiError(404, "If an account exists with this email, you will receive an OTP.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  // Rate limit resends: check if OTP document exists
  let otpDoc = await Otp.findOne({ email: normalizedEmail });
  if (otpDoc) {
    if (otpDoc.resends >= 3) {
      throw new ApiError(429, "Too many OTP resend attempts. Please try again after 15 minutes.");
    }
    otpDoc.resends += 1;
  } else {
    otpDoc = new Otp({ email: normalizedEmail, otp: "" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpDoc.otp = otp;
  otpDoc.attempts = 0; // Reset verification attempts on new send
  otpDoc.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration
  await otpDoc.save();

  await sendEmail(user.email, "Qyro Password Reset OTP", `Your OTP for password reset is: ${otp}`);

  return { message: "OTP sent to email" };
};

exports.verifyOTP = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) {
    logger.logAuthError(new Error(`OTP verified for non-existent user`), { email });
    throw new ApiError(400, "Invalid OTP. Please request a new one.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const otpDoc = await Otp.findOne({ email: normalizedEmail });

  if (!otpDoc) {
    throw new ApiError(400, "Invalid or expired OTP. Please request a new one.");
  }

  // Brute force protection: check verification attempts
  if (otpDoc.attempts >= 5) {
    await Otp.deleteOne({ _id: otpDoc._id });
    throw new ApiError(429, "Too many failed attempts. Please request a new OTP.");
  }

  if (otpDoc.otp !== otp) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    throw new ApiError(400, "Invalid OTP. Please try again.");
  }

  // Generate short-lived password reset token (15 mins)
  const resetToken = jwt.sign(
    { email: normalizedEmail, purpose: "password-reset" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Successfully verified, remove document
  await Otp.deleteOne({ _id: otpDoc._id });

  return { message: "OTP verified", resetToken };
};

exports.resetPassword = async ({ email, password, token }) => {
  if (!token) {
    throw new ApiError(400, "Reset token is required to reset password.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email !== email.trim().toLowerCase() || decoded.purpose !== "password-reset") {
      throw new ApiError(400, "Invalid password reset token.");
    }
  } catch (err) {
    throw new ApiError(401, "Password reset session has expired or is invalid.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    logger.logAuthError(new Error(`Password reset for non-existent user`), { email });
    throw new ApiError(400, "User account not found.");
  }

  if (!passwordRegex.test(password)) {
    throw new ApiError(400, "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
  }

  user.password = await bcrypt.hash(password, 10);
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  return { message: "Password reset successful" };
};

exports.refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token required");
  }

  try {
    // Verify JWT signature
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    // SECURITY: Multiple validation checks for refresh token
    if (!user) {
      logger.logInvalidToken(refreshToken, "User not found");
      throw new ApiError(401, "Invalid token");
    }

    // Check if stored refresh token matches (prevents old token reuse)
    if (user.refreshToken !== refreshToken) {
      logger.logAuthError(new Error("Token mismatch - possible token reuse attack"), { userId: user._id });
      throw new ApiError(401, "Invalid token");
    }

    // Check if refresh token is expired
    if (!user.refreshTokenExpire || user.refreshTokenExpire < Date.now()) {
      // Clear expired token from database
      user.refreshToken = null;
      user.refreshTokenExpire = null;
      await user.save();
      throw new ApiError(401, "Refresh token expired");
    }

    if (user.isBlocked) {
      user.refreshToken = null;
      user.refreshTokenExpire = null;
      await user.save();
      throw new ApiError(403, "Your account has been blocked");
    }

    // Generate new tokens (rotation)
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update user with new refresh token
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpire = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    // SECURITY: Re-throw ApiError instances, wrap others
    if (error instanceof ApiError) {
      throw error;
    }
    // JWT verification failures get specific error message
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, "Invalid refresh token signature");
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, "Refresh token expired");
    }
    throw new ApiError(401, "Token refresh failed");
  }
};

exports.logout = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // SECURITY: Invalidate refresh token on logout
  user.refreshToken = null;
  user.refreshTokenExpire = null;
  await user.save();

  return { message: "Logged out successfully" };
};
