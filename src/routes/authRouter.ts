import express from "express";
import authController from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";

const authRouter = express.Router();

authRouter.post(
  "/auth/register",
  validate(registerSchema),
  authController.postRegister,
);
authRouter.post("/auth/login", validate(loginSchema), authController.postLogin);

export default authRouter;
