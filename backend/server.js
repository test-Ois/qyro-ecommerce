/* LOAD ENV VARIABLES FIRST */
require("dotenv").config();

/* IMPORT PACKAGES */
const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

/* IMPORT DATABASE */
const connectDB = require("./config/db");

/* IMPORT ROUTES */
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const otpRoutes = require("./routes/otpRoutes");
const adminRoutes = require("./routes/adminRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const chatRoutes = require("./routes/chatRoutes"); // New
const paymentRoutes = require("./routes/paymentRoutes");

/* INITIALIZE APP */
const app = express();

/* CREATE HTTP SERVER */
const server = http.createServer(app);

/* INITIALIZE SOCKET.IO */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* MAKE io ACCESSIBLE IN ROUTES */
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* CONNECT DATABASE */
connectDB();

/* GLOBAL MIDDLEWARE */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* API ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/chat", chatRoutes); // New
app.use("/api/payment", paymentRoutes);

/* SOCKET.IO CONNECTION */
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

/* START SERVER */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});