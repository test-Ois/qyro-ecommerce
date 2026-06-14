const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * MongoDB Connection with Retry Logic
 * 
 * Handles transient DNS/network failures by retrying the connection
 * with exponential backoff. This is critical for production deployments
 * where DNS SRV resolution (mongodb+srv://) can intermittently fail.
 */
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 3000; // 3 seconds initial delay

const connectDB = async (retryCount = 0) => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      logger.error("MONGO_URI is not defined in environment variables");
      process.exit(1);
    }

    // Validate the URI format
    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      logger.error("MONGO_URI has an invalid format. Must start with mongodb:// or mongodb+srv://");
      process.exit(1);
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout for server selection
      socketTimeoutMS: 45000,          // 45 second timeout for socket operations
    });

    logger.info("MongoDB connected", {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    });
  } catch (error) {
    logger.error("MongoDB connection failed", {
      error: error.message,
      attempt: retryCount + 1,
      maxRetries: MAX_RETRIES,
    });

    if (retryCount < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
      logger.info(`Retrying MongoDB connection in ${delay / 1000}s...`, {
        nextAttempt: retryCount + 2,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retryCount + 1);
    }

    logger.error("All MongoDB connection attempts exhausted. Exiting.", {
      hint: "Check: 1) MONGO_URI in .env is correct, 2) Your IP is whitelisted in MongoDB Atlas Network Access, 3) DNS can resolve the cluster hostname, 4) No firewall/VPN blocking DNS SRV lookups",
    });
    process.exit(1);
  }
};

// Handle connection events for monitoring
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting reconnection...");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error", { error: err.message });
});

module.exports = connectDB;
