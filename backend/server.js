/* LOAD ENV VARIABLES FIRST */
require("dotenv").config();

/* IMPORT PACKAGES */
const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const logger = require("./utils/logger");

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
    origin: [
      "http://localhost:3000",  // Frontend
      "http://localhost:3001",  // Admin panel
      process.env.PRODUCTION_FRONTEND_URL || "",
      process.env.PRODUCTION_ADMIN_URL || ""
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* MAKE io ACCESSIBLE IN ROUTES */
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* CONNECT DATABASE */
connectDB();

/**
 * PRODUCTION SECURITY CONFIGURATION
 * CORS: Only allow specified origins (frontend & admin panel)
 * Morgan: Log all HTTP requests for security auditing
 */

// CORS Configuration: Whitelist only trusted origins
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",      // Frontend dev
      "http://localhost:3001",      // Admin panel dev
      process.env.PRODUCTION_FRONTEND_URL || "",
      process.env.PRODUCTION_ADMIN_URL || ""
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

/* GLOBAL MIDDLEWARE */
app.use(cors(corsOptions)); // CORS must be before other middleware

// HTTP Request Logging (Morgan)
// Log requests in 'combined' format by default, only log errors in production
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

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

/* GLOBAL ERROR HANDLER */
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

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