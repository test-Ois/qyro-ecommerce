const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password -refreshToken -refreshTokenExpire -otp -otpExpire -resetPasswordToken -resetPasswordExpire")
    .sort({ createdAt: -1 });

  res.json(users);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "You cannot delete your own admin account" });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ message: "User deleted successfully" });
});

exports.toggleUserBlock = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "You cannot block your own admin account" });
  }

  const user = await User.findById(req.params.id)
    .select("-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isBlocked = !user.isBlocked;

  if (user.isBlocked) {
    user.refreshToken = null;
    user.refreshTokenExpire = null;
  }

  await user.save();
  const sanitizedUser = await User.findById(req.params.id)
    .select("-password -refreshToken -refreshTokenExpire -otp -otpExpire -resetPasswordToken -resetPasswordExpire");

  res.json({
    message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
    user: sanitizedUser
  });
});
