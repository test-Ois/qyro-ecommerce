const ApiError = require("../utils/apiError");

/**
 * Super Admin Middleware
 * Only users with role === "super_admin" can access these routes.
 * Super admins bypass approval checks — they are seeded directly into DB.
 */
module.exports = (req, res, next) => {

  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  if (req.user.role !== "super_admin") {
    throw new ApiError(403, "Access denied — super admin privileges required");
  }

  next();
};
