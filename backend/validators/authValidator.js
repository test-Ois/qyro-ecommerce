const Joi = require("joi");

/**
 * PRODUCTION VALIDATOR FOR AUTH INPUTS
 * Enforces: email format, password strength, string sanitization
 * Prevents: injection attacks, weak passwords, malformed data
 */

// Password must be: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
// Example: "Qyro@2024"
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .required()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .messages({
    "string.pattern.base": "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)"
  });

const emailSchema = Joi.string()
  .email()
  .lowercase()
  .trim()
  .required();

/**
 * REGISTER VALIDATION
 * Endpoint: POST /api/auth/register
 */
exports.validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .trim()
      .pattern(/^[a-zA-Z\s'-]*$/)
      .messages({
        "string.pattern.base": "Name can only contain letters, spaces, hyphens, and apostrophes"
      }),
    email: emailSchema,
    password: passwordSchema,
    role: Joi.string()
      .valid("user", "seller", "admin")
      .default("user")
      .messages({
        "any.only": "Role must be 'user', 'seller', or 'admin'"
      }),
    shopName: Joi.string()
      .max(100)
      .allow("")
      .optional()
      .trim(),
    shopDescription: Joi.string()
      .max(500)
      .allow("")
      .optional()
      .trim()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * LOGIN VALIDATION
 * Endpoint: POST /api/auth/login
 */
exports.validateLogin = (data) => {
  const schema = Joi.object({
    email: emailSchema,
    password: Joi.string()
      .min(1)
      .max(128)
      .required()
      .messages({
        "string.empty": "Password is required"
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * OTP REQUEST VALIDATION
 * Endpoint: POST /api/auth/send-otp
 */
exports.validateSendOTP = (data) => {
  const schema = Joi.object({
    email: emailSchema
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * OTP VERIFICATION VALIDATION
 * Endpoint: POST /api/auth/verify-otp
 */
exports.validateVerifyOTP = (data) => {
  const schema = Joi.object({
    email: emailSchema,
    otp: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        "string.length": "OTP must be 6 digits",
        "string.pattern.base": "OTP must contain only numbers"
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * PASSWORD RESET VALIDATION
 * Endpoint: POST /api/auth/reset-password
 */
exports.validateResetPassword = (data) => {
  const schema = Joi.object({
    email: emailSchema,
    newPassword: passwordSchema,
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match"
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * REFRESH TOKEN VALIDATION
 * Endpoint: POST /api/auth/refresh-token
 */
exports.validateRefreshToken = (data) => {
  const schema = Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        "string.empty": "Refresh token is required"
      })
  });

  return schema.validate(data, { abortEarly: false });
};
