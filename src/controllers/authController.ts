import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { Request, Response, NextFunction } from "express";

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

    // we are deleting the password before sending it back also we update the IUser interface so that password becomes optional so that the red line goes
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (e) {
    const err: any = e;
    return next(err);
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
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as any },
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
  postLogin,
};
