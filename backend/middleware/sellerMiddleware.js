// Middleware to check if user is an approved seller

module.exports = (req, res, next) => {

  if (req.user.role !== "seller") {
    return res.status(403).json({
      message: "Access denied — sellers only"
    });
  }

  if (!req.user.isApproved) {
    return res.status(403).json({
      message: "Your seller account is pending admin approval"
    });
  }

  next();

};