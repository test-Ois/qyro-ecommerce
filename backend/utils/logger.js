const winston = require("winston");
const path = require("path");

/**
 * PRODUCTION LOGGING SYSTEM
 * Tracks all auth events for security audit trail
 * Logs to: console (dev) + file (production)
 * Features: Daily rotation, size-based rotation, max file limits
 */

const logsDir = path.join(__dirname, "../logs");

// Try to import daily rotate file for better rotation support
let DailyRotateFile;
try {
  DailyRotateFile = require("winston-daily-rotate-file");
} catch (err) {
  // Fallback to basic file transport if module not installed
  DailyRotateFile = null;
}

// Transport configuration factory
const createFileTransport = (filename, level = undefined, maxsize = 10485760, maxFiles = 20) => {
  const baseConfig = {
    filename: path.join(logsDir, filename),
    dirname: logsDir,
    maxsize,
    maxFiles,
    tailable: true
  };

  if (level) {
    baseConfig.level = level;
  }

  // Use DailyRotateFile if available, otherwise use basic File transport
  if (DailyRotateFile) {
    return new DailyRotateFile({
      ...baseConfig,
      datePattern: "YYYY-MM-DD",
      utc: false,
      maxDays: "30d"
    });
  } else {
    return new winston.transports.File(baseConfig);
  }
};

// Create a custom logger for authentication events
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "auth-service" },
  transports: [
    // Always log errors to file with rotation
    createFileTransport("error.log", "error", 5242880, 5), // 5MB per file, max 5 files
    
    // Log all events to combined.log with rotation
    createFileTransport("combined.log", undefined, 10485760, 20), // 10MB per file, max 20 files
    
    // Log auth events specifically with rotation
    createFileTransport("auth.log", "info", 5242880, 10) // 5MB per file, max 10 files
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
      })
    )
  }));
}

/**
 * LOG SUCCESSFUL LOGIN
 * Security: Track who logs in, when, from where
 */
logger.logLoginSuccess = (email, role, ip) => {
  logger.info("User login successful", {
    event: "LOGIN_SUCCESS",
    email,
    role,
    ip,
    timestamp: new Date()
  });
};

/**
 * LOG FAILED LOGIN ATTEMPT
 * Security: Detect brute force attacks
 */
logger.logLoginFailure = (email, reason, ip) => {
  logger.warn("User login failed", {
    event: "LOGIN_FAILURE",
    email,
    reason,
    ip,
    timestamp: new Date()
  });
};

/**
 * LOG REGISTRATION
 * Security: Track account creation
 */
logger.logRegistration = (email, role, ip) => {
  logger.info("User registered", {
    event: "REGISTRATION",
    email,
    role,
    ip,
    timestamp: new Date()
  });
};

/**
 * LOG REGISTRATION FAILURE
 * Security: Prevent spam/duplicate accounts
 */
logger.logRegistrationFailure = (email, reason, ip) => {
  logger.warn("Registration failed", {
    event: "REGISTRATION_FAILURE",
    email,
    reason,
    ip,
    timestamp: new Date()
  });
};

/**
 * LOG TOKEN REFRESH
 * Security: Monitor token usage
 */
logger.logTokenRefresh = (userId, email, ip) => {
  logger.info("Token refreshed", {
    event: "TOKEN_REFRESH",
    userId,
    email,
    ip,
    timestamp: new Date()
  });
};

/**
 * LOG INVALID TOKEN
 * Security: Detect suspicious activity
 */
logger.logInvalidToken = (token, reason, ip) => {
  logger.warn("Invalid token attempt", {
    event: "INVALID_TOKEN",
    reason,
    ip,
    tokenPreview: token?.substring(0, 20) + "...",
    timestamp: new Date()
  });
};

/**
 * LOG AUTH ERROR
 * Security: Track system issues
 */
logger.logAuthError = (error, context) => {
  logger.error("Authentication error", {
    event: "AUTH_ERROR",
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date()
  });
};

module.exports = logger;
