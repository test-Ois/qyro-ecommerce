/**
 * Super Admin Seed Script
 * ========================
 * Creates the initial super_admin account in the database.
 *
 * USAGE:
 *   cd backend
 *   node scripts/createSuperAdmin.js
 *
 * This script reads credentials from environment variables for security.
 * Set these in your shell before running, or create a .env file:
 *
 *   SUPER_ADMIN_NAME="Super Admin"
 *   SUPER_ADMIN_EMAIL="superadmin@qyro.com"
 *   SUPER_ADMIN_PASSWORD="YourSecureP@ss1"
 *
 * The super_admin role CANNOT be created via any API endpoint — only through this script.
 * Run this ONCE on initial deployment. Re-running will skip if the email already exists.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const NAME = process.env.SUPER_ADMIN_NAME || "Super Admin";
const EMAIL = process.env.SUPER_ADMIN_EMAIL || "superadmin@qyro.com";
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error("\n❌ ERROR: SUPER_ADMIN_PASSWORD environment variable is required.");
  console.error("   Set it in your shell: $env:SUPER_ADMIN_PASSWORD='YourSecureP@ss1'");
  process.exit(1);
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if (!passwordRegex.test(PASSWORD)) {
  console.error("\n❌ ERROR: Password must be 8+ chars with uppercase, lowercase, number, and special character.");
  process.exit(1);
}

async function createSuperAdmin() {
  try {
    console.log("\n🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("✅ Connected to MongoDB\n");

    // Check if super_admin already exists
    const existingSuper = await User.findOne({ role: "super_admin" });
    if (existingSuper) {
      console.log(`ℹ️  A super_admin already exists: ${existingSuper.email}`);
      console.log("   Skipping creation. To reset, manually delete the account from MongoDB.");
      process.exit(0);
    }

    // Check if email is already taken by another role
    const existingEmail = await User.findOne({ email: EMAIL.toLowerCase() });
    if (existingEmail) {
      console.error(`\n❌ ERROR: Email "${EMAIL}" is already registered with role: ${existingEmail.role}`);
      console.error("   Use a different email for the super_admin account.");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(PASSWORD, 12);

    const superAdmin = await User.create({
      name: NAME,
      email: EMAIL.toLowerCase(),
      password: hashedPassword,
      role: "super_admin",
      isApproved: true,
      approvalStatus: "approved",
      isBlocked: false
    });

    console.log("✅ Super Admin created successfully!\n");
    console.log("   Name:  ", superAdmin.name);
    console.log("   Email: ", superAdmin.email);
    console.log("   Role:  ", superAdmin.role);
    console.log("   ID:    ", superAdmin._id.toString());
    console.log("\n🔐 Store these credentials securely. This is the only time they are shown.");
    console.log("🚀 Super Admin can now log in via the admin panel at /admin/login\n");

  } catch (error) {
    console.error("\n❌ Failed to create super admin:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

createSuperAdmin();
