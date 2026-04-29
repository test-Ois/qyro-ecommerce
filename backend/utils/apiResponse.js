const sendSuccess = (res, { statusCode = 200, message = "Action completed", data = {} } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

module.exports = {
  sendSuccess
};
