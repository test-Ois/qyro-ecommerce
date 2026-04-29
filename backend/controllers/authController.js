const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

exports.register = asyncHandler(async (req, res) => {
  const payload = await authService.register(req.validatedData || req.body);
  res.status(201).json(payload);
});

exports.login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);
  res.json(payload);
});

exports.sendOTP = asyncHandler(async (req, res) => {
  const payload = await authService.sendOTP(req.body.email);
  res.json(payload);
});

exports.verifyOTP = asyncHandler(async (req, res) => {
  const payload = await authService.verifyOTP(req.body);
  res.json(payload);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const payload = await authService.resetPassword(req.body);
  res.json(payload);
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const payload = await authService.refreshToken(refreshToken);
  res.json(payload);
});

exports.logout = asyncHandler(async (req, res) => {
  const payload = await authService.logout(req.user.id);
  res.json(payload);
});
