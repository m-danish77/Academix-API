import rateLimit from "express-rate-limit";

// Strict limiter for authentication routes (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP address
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Send rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Softer limiter for general API routes
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
