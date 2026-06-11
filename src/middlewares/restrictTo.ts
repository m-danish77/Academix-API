import { Request, Response, NextFunction } from "express";

type Role = "student" | "instructor" | "admin";
// We are passing array of allowed roles but roles should only be of Role type
const restrictTo = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user's role is in the allowed roles list
      // ! this sign tell TS trust me req.user is defined
      if (!allowedRoles.includes(req.user!.role)) {
        const err: any = new Error(
          `Access denied. Required role(s): ${allowedRoles.join(" or ")}`,
        );
        err.status = 403;
        return next(err);
      }
      next();
    } catch (e) {
      next(e);
    }
  };
};

export default restrictTo;
