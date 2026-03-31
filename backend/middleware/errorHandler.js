const ApiError = require("../utils/apiError");

module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Global error handler:", err.stack || err);

  if (err instanceof ApiError) {
    return res.status(statusCode).json({ message });
  }

  return res.status(statusCode).json({ message });
};
