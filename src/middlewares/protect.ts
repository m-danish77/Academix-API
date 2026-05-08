import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

interface MyToken {
  userId: string;
  iat?: number;
  exp?: number;
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    // 1. Extract the token from the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. If no token exists, send a 401 error to the Master Handler
    if (!token) {
      const err: any = new Error(
        "You are not logged in. Please provide a token.",
      );
      err.status = 401;
      return next(err); // 'return' ensures the rest of this function doesn't run
    }

    // 3. Verify the token
    // @ts-ignore
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as unknown as MyToken;

    // 4. Check if the user still exists in the database
    const currentUser = await User.findById(decoded.userId);

    if (!currentUser) {
      const err: any = new Error(
        "The user belonging to this token no longer exists.",
      );
      err.status = 401;
      return next(err);
    }

    // 5. Attach the user to the request object and move to the next middleware
    req.user = currentUser;
    next();
  } catch (e) {
    // This catches JWT errors (expired, tampered, etc.)
    const err: any = e;
    next(err);
  }
};

export default protect;
