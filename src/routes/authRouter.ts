import express from "express";
import authController from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/auth/register", authController.postRegister);
authRouter.post("/auth/login", authController.postLogin);

export default authRouter;
