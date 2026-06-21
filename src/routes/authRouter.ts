import express from "express";
import authController from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { RequestHandler } from "express";

const authRouter = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (student or instructor)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string, example: "Muhammad Munib Danish" }
 *               email: { type: string, example: "munib@example.com" }
 *               password: { type: string, format: password, example: "Danish9." }
 *               role: { type: string, enum: ["student", "instructor"], default: "student" }
 *     responses:
 *       201:
 *         description: User created successfully (password hidden)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *                 name: { type: string }
 *                 email: { type: string }
 *                 role: { type: string }
 *       400:
 *         description: Validation error or user already exists
 */
authRouter.post(
  "/auth/register",
  authLimiter as RequestHandler,
  validate(registerSchema),
  authController.postRegister,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "munib@example.com" }
 *               password: { type: string, format: password, example: "Danish9." }
 *     responses:
 *       200:
 *         description: Successful login, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "Success" }
 *                 token: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *       400:
 *         description: Invalid email or password
 *       429:
 *         description: Too many requests, please try again later
 */
authRouter.post(
  "/auth/login",
  authLimiter as RequestHandler,
  validate(loginSchema),
  authController.postLogin,
);

export default authRouter;
