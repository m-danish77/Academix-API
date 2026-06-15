import express from "express";
import authController from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";

const authRouter = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (student, instructor, or admin)
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
 *               role: { type: string, enum: ["student", "instructor", "admin"], default: "student" }
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
 */
authRouter.post("/auth/login", validate(loginSchema), authController.postLogin);

export default authRouter;
