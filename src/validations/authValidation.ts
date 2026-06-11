import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Name must be a string." })
      .min(2, "Name must be at least 2 characters long"),
    email: z.email({ error: "Please enter a valid email address" }),
    password: z
      .string({ error: "Password must be a string." })
      .min(6, "Password must be at least 6 characters long"),
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
