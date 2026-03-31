const Chat = require("../models/Chat");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ApiError = require("../utils/apiError");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

exports.getChatHistory = async (userId) => {
  const chat = await Chat.findOne({ user: userId }).sort({ createdAt: -1 });
  return chat ? chat.messages : [];
};

exports.sendMessage = async (userId, message, history) => {
  if (!message) throw new ApiError(400, "Message is required");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_PROMPT });

  const rawHistory = (history || [])
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

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
  }

  const chat = model.startChat({ history: validHistory });
  const result = await chat.sendMessage(message);
  const aiResponse = result.response.text();

  let chatDoc = await Chat.findOne({ user: userId }).sort({ createdAt: -1 });
  if (!chatDoc) {
    chatDoc = new Chat({ user: userId, messages: [] });
  }

  chatDoc.messages.push({ role: "user", content: message });
  chatDoc.messages.push({ role: "assistant", content: aiResponse });
  await chatDoc.save();

  return aiResponse;
};

exports.clearChat = async (userId) => {
  await Chat.deleteMany({ user: userId });
  return { message: "Chat history cleared" };
};
