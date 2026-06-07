import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 'parseAsync' checks req.body, req.query, and req.params all at once
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next(); // Input is perfect, move to the controller!
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod's complex internal error into a clean, readable array for the frontend
        return res.status(400).json({
          status: "fail",
          errors: error.issues.map((err) => ({
            path: err.path[1] || err.path[0], // Identifies which field failed (e.g., 'email')
            message: err.message, // Your custom error message
          })),
        });
      }

      return res
        .status(500)
        .json({ message: "Internal Server Error during validation" });
    }
  };
};
