import { Request, Response, NextFunction } from "express";

const restrictTo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user && req.user.role == "admin") {
      next();
    } else {
      res.status(403).json({ message: "Access Denied. Admins Only." });
    }
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  }
};

export default restrictTo;
