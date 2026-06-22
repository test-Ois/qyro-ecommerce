const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    minlength: 3
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please use valid email"]
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  role: {
    type: String,
    enum: ["user", "seller", "admin", "super_admin"],
    default: "user"
  },

  isBlocked: {
    type: Boolean,
    default: false
  },

  // Granular approval status for sellers and admins
  // users: always "approved", sellers/admins: start "pending"
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved" // overridden on register for seller/admin
  },

  resetPasswordToken: {
    type: String
  },

  resetPasswordExpire: {
    type: Date
  },

  otp: {
    type: String
  },

  otpExpire: {
    type: Date
  },

  // Refresh token for extended sessions
  refreshToken: {
    type: String,
    default: null
  },

  refreshTokenExpire: {
    type: Date,
    default: null
  },

  // Wishlist array
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }
  ],

  // Seller approval status — admin approves seller
  isApproved: {
    type: Boolean,
    default: false
  },

  // Platform commission percentage deducted from seller earnings
  commissionRate: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },

  // Seller shop name
  shopName: {
    type: String,
    default: ""
  },

  // Seller shop description
  shopDescription: {
    type: String,
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
