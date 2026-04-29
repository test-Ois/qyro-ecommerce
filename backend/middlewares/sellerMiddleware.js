// Middleware to check if user is an approved seller
const ApiError = require("../utils/apiError");

module.exports = (req, res, next) => {

  // SECURITY: Verify user object exists from auth middleware
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  if (req.user.role !== "seller") {
    throw new ApiError(403, "Access denied - seller account required");
  }

  // SECURITY: Check seller approval status (edge case handling)
  if (!req.user.isApproved) {
    throw new ApiError(403, "Seller account pending admin approval - feature access restricted");
  }

  next();

};