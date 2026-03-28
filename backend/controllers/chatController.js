const Chat = require("../models/Chat");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with backend API key — secure, not exposed to browser
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Q-Mart specific system prompt — strictly restricts AI to Q-Mart topics only
const SYSTEM_PROMPT = `You are Qyro customer service AI assistant. Q-Mart is an Indian e-commerce platform.

You can ONLY help with:
- Order tracking and status questions
- Return and refund policy queries
- Product information and recommendations
- Account related issues
- Payment problems
- Delivery queries
- General shopping help on Qyro

Qyro Policies:
- Returns accepted within 7 days of delivery
- Free delivery on orders above ₹499
- Payment methods accepted: UPI, Credit/Debit Card, Net Banking, COD
- AI Support: 24/7 available
- Human Support hours: 9AM - 6PM IST (Mon-Sat)
- Refund processing time: 5-7 business days

STRICT RULES:
- You MUST ONLY answer Qyro related questions
- If asked ANYTHING unrelated to Qyro or shopping, respond with: "I can only help with Qyro related queries. For other questions, please use a general search engine."
- Never provide harmful, offensive or unrelated information
- Always be helpful, polite and professional
- Respond in the same language the user writes in
- If you cannot resolve an issue, suggest contacting human support at support@qyro.com`;

/* ========== GET CHAT HISTORY ========== */

exports.getChatHistory = async (req, res) => {
  try {

    // Find most recent chat session for this user
    const chat = await Chat.findOne({ user: req.user.id })
      .sort({ createdAt: -1 });

    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chat.messages });

  } catch (error) {
    console.error("Get chat history error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========== SEND MESSAGE TO GEMINI + SAVE ========== */

exports.sendMessage = async (req, res) => {
  try {

    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT
    });

    // Build valid conversation history for Gemini
    // Rules: must start with user, must alternate user/model
    const rawHistory = (history || [])
      .filter(msg => msg.role === "user" || msg.role === "assistant")
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

    // Ensure history starts with user role — remove leading model messages
    const validHistory = [];
    let expectingUser = true;

    for (const msg of rawHistory) {
      if (expectingUser && msg.role === "user") {
        validHistory.push(msg);
        expectingUser = false;
      } else if (!expectingUser && msg.role === "model") {
        validHistory.push(msg);
        expectingUser = true;
      }
      // Skip messages that break the alternating pattern
    }

    // Start chat session with cleaned history
    const chat = model.startChat({ history: validHistory });

    // Send current message and get AI response
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    // Find or create chat document for this user
    let chatDoc = await Chat.findOne({ user: req.user.id })
      .sort({ createdAt: -1 });

    if (!chatDoc) {
      chatDoc = new Chat({ user: req.user.id, messages: [] });
    }

    // Save user message to database
    chatDoc.messages.push({ role: "user", content: message });

    // Save AI response to database
    chatDoc.messages.push({ role: "assistant", content: aiResponse });

    await chatDoc.save();

    res.json({ response: aiResponse });

  } catch (error) {
    console.error("Send message error:", error.message);
    res.status(500).json({ message: "Failed to get AI response" });
  }
};

/* ========== CLEAR CHAT HISTORY ========== */

exports.clearChat = async (req, res) => {
  try {

    await Chat.deleteMany({ user: req.user.id });

    res.json({ message: "Chat history cleared" });

  } catch (error) {
    console.error("Clear chat error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};