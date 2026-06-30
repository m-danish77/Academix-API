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
 *     summary: Register a new user (student or instructor only)
 *     tags: [Authentication]
 *     description: |
 *       Registers a new user and sends a verification email.
 *       The user must verify their email before they can log in.
 *       Only student and instructor roles can be created via registration.
 *       Admin accounts must be manually created in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Muhammad Munib Danish"
 *               email:
 *                 type: string
 *                 example: "munib@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Danish9."
 *                 description: Must be at least 8 characters with uppercase, lowercase, number, and special character
 *               role:
 *                 type: string
 *                 enum: ["student", "instructor"]
 *                 default: "student"
 *                 description: "Only student and instructor can register. Admin accounts must be manually created."
 *     responses:
 *       201:
 *         description: User created successfully. Verification email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Registration successful. Please check your email (and spam folder) to verify your account."
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                       message:
 *                         type: string
 *       429:
 *         description: Too many registration attempts. Please try again later.
 */
authRouter.post(
  "/auth/register",
  authLimiter as RequestHandler,
  validate(registerSchema),
  authController.postRegister,
);

authRouter.get("/auth/verify-email", authController.verifyEmail);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     description: |
 *       Login with valid credentials. User must have verified their email first.
 *       If email is not verified, a 403 error is returned with a spam folder notice.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "munib@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Danish9."
 *     responses:
 *       200:
 *         description: Successful login, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Success"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Muhammad Munib Danish"
 *                     email:
 *                       type: string
 *                       example: "munib@example.com"
 *                     role:
 *                       type: string
 *                       example: "student"
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Incorrect Email and Password"
 *       403:
 *         description: Email not verified. User must verify email before logging in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Please verify your email before logging in. Check your spam folder for the verification email."
 *       429:
 *         description: Too many login attempts. Please try again later.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Too many authentication attempts. Please try again after 15 minutes."
 */
authRouter.post(
  "/auth/login",
  authLimiter as RequestHandler,
  validate(loginSchema),
  authController.postLogin,
);

export default authRouter;
