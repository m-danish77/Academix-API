import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // @ts-ignore
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      // We do this so that the req.user will have the full user information. We need req.user.role for the restrictTo middleware
      const currentUser = await User.findById(decoded.userId);
      if (!currentUser) {
        return res.status(401).json({
          message: "The user belonging to this token no longer exists.",
        });
      }

      req.user = currentUser;
      next();
    }
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  }
};

export default protect;
