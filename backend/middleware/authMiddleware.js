const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");

module.exports = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApiError(401, "No token provided");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Invalid token format - use Bearer <token>");
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // SECURITY: Validate required fields exist in token
    if (!decoded.id || !decoded.role) {
      throw new ApiError(401, "Invalid token structure");
    }

    req.user = decoded;

    next();

  } catch (error) {

    // SECURITY: Provide specific error messages for different JWT errors
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token signature"
      });
    }

    return res.status(401).json({
      message: "Token validation failed"
    });

  }

};