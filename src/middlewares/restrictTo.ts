import { Request, Response, NextFunction } from "express";

const restrictTo = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user && req.user.role == "admin") {
      next();
    } else {
      const err: any = new Error("Access Denied. Admins Only.");
      err.status = 403;
      next(err);
    }
  } catch (e) {
    const err: any = e;
    next(err);
  }
};

export default restrictTo;
