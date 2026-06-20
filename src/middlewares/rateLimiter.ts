import rateLimit from "express-rate-limit";
import { config } from "../configs/validateEnv.js";
import { NextFunction } from "express";

// Disable rate limiting in test environment
const isLimit = config.NODE_ENV === "test";

// Strict limiter for authentication routes (login, register)
export const authLimiter = isLimit
  ? (req: Request, res: Response, next: NextFunction) => next()
  : rateLimit({
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
export const generalLimiter = isLimit
  ? (req: Request, res: Response, next: NextFunction) => next()
  : rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
      message: {
        success: false,
        message: "Too many requests. Please slow down.",
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
