const express = require("express");
const router = express.Router();

const {
  getChatHistory,
  sendMessage,
  clearChat
} = require("../controllers/chatController");

const auth = require("../middleware/authMiddleware");

/* GET chat history — logged in user only */
router.get("/history", auth, getChatHistory);

/* SEND message to Gemini and save to DB */
router.post("/send", auth, sendMessage);

/* CLEAR chat history manually */
router.delete("/clear", auth, clearChat);

module.exports = router;
