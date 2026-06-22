/**
 * Role Middleware
 * Checks if the authenticated user has one of the allowed roles.
 * Super admins always pass — they have platform-wide access.
 */
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized"
      });
    }

    // Super admins bypass all role restrictions
    if (req.user.role === "super_admin") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};