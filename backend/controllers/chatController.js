const chatService = require("../services/chatService");
const asyncHandler = require("../utils/asyncHandler");

exports.getChatHistory = asyncHandler(async (req, res) => {
  const messages = await chatService.getChatHistory(req.user.id);
  res.json({ messages });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  const response = await chatService.sendMessage(req.user.id, message, history);
  res.json({ response });
});

exports.clearChat = asyncHandler(async (req, res) => {
  const payload = await chatService.clearChat(req.user.id);
  res.json(payload);
});