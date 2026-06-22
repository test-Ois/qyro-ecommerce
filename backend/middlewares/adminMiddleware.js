const ApiError = require("../utils/apiError");

/**
 * Admin Middleware
 * Allows access to admin and super_admin roles.
 * Admins must be approved (isApproved: true) before accessing dashboard.
 * Super admins bypass the approval check (seeded directly).
 */
module.exports = (req, res, next) => {

  // SECURITY: Verify user object exists from auth middleware
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  const { role, isApproved } = req.user;

  // Only admin and super_admin can proceed
  if (role !== "admin" && role !== "super_admin") {
    throw new ApiError(403, "Access denied — admin privileges required");
  }

  // Super admins are always approved (seeded, not registered)
  if (role === "super_admin") {
    return next();
  }

  // Regular admins must be approved by a super_admin
  if (!isApproved) {
    throw new ApiError(403, "Admin account pending super admin approval");
  }

  next();

};