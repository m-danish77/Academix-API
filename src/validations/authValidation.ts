import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Name must be a string." })
      .min(2, "Name must be at least 2 characters long"),
    email: z.email({ error: "Please enter a valid email address" }),
    password: z
      .string({
        error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password is too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character (e.g., !, @, #, $, %)",
      ),
    role: z.enum(["student", "instructor", "admin"]).default("student"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ error: "Please enter a valid email address" }),
    password: z
      .string({ error: "Password must be a string." })
      .min(1, "Password cannot be empty"), // ensures non-empty string
  }),
});
