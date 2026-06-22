import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import User from "../models/User.js";
import { sendVerificationEmail } from "../services/emailService.js";
import { config } from "../configs/validateEnv.js";

const postRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      const err: any = new Error("User already exists.");
      err.status = 400;
      return next(err);
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
    });

    const verficationToken = jwt.sign(
      { userId: newUser._id },
      config.JWT_SECRET,
      { expiresIn: (config.VERIFICATION_TOKEN_EXPIRY || "1h") as any },
    );

    if (config.NODE_ENV !== "test") {
      await sendVerificationEmail(newUser.email, verficationToken);
    } else {
      newUser.isVerified = true;
      await newUser.save();
    }

    // we are deleting the password before sending it back also we update the IUser interface so that password becomes optional so that the red line goes
    // const userResponse = newUser.toObject();
    // delete userResponse.password;

    res.status(201).json({
      status: "success",
      message:
        "Registration successful. Please check your email (and spam folder) to verify your account.",
    });
  } catch (e) {
    const err: any = e;
    return next(err);
  }
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;

    if (!token) {
      const err: any = new Error("Verification token is required.");
      err.status = 400;
      return next(err);
    }

    interface MyToken {
      userId: string;
    }
    // Verify the token
    const decoded = jwt.verify(token as string, config.JWT_SECRET) as MyToken;

    // Find user and mark as verified
    const user = await User.findById(decoded.userId);
    if (!user) {
      const err: any = new Error("User not found.");
      err.status = 404;
      return next(err);
    }

    if (user.isVerified) {
      return res.status(200).json({
        status: "success",
        message: "Email already verified. You can now log in.",
      });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const err: any = new Error(
        "Verification token has expired. Please register again.",
      );
      err.status = 400;
      return next(err);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      const err: any = new Error("Invalid verification token.");
      err.status = 400;
      return next(err);
    }
    next(error);
  }
};

const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }).select("+password");
    if (!user) {
      const err: any = new Error("Incorrect Email and Password");
      err.status = 400;
      return next(err);
    }

    if (!user.isVerified) {
      const err: any = new Error(
        "Please verify your email before logging in. Check your spam folder for the verification email.",
      );
      err.status = 403;
      return next(err);
    }

    const matchPassword = await bcrypt.compare(
      password,
      user.password as string,
    );
    if (!matchPassword) {
      const err: any = new Error("Incorrect Email and Password");
      err.status = 400;
      return next(err);
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      config.JWT_SECRET as string,
      { expiresIn: (config.JWT_EXPIRES_IN || "1d") as any },
    );

    res.status(200).json({
      status: "Success",
      token: token,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    const err: any = e;
    return next(err);
  }
};

export default {
  postRegister,
  verifyEmail,
  postLogin,
};
