import { z } from "zod";
import dotenv from "dotenv";

// 1. Load the .env file into process.env
dotenv.config();

// 2. Define the RULES
const envSchema = z.object({
  // --- REQUIRED ---
  ATLAS_URI: z.string().min(1, "ATLAS_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  NODE_ENV: z.enum(["development", "production", "test"]),

  // --- OPTIONAL with defaults ---
  PORT: z.string().default("3000"),
  DEPLOYED_URL: z.string().optional(),
  BASE_URL: z.string().default("http://localhost:3000"),
  VERIFICATION_TOKEN_EXPIRY: z.string().default("1h"),

  // --- 🔑 Gmail API Configuration (NEW) ---
  GMAIL_CLIENT_ID: z.string().min(1, "GMAIL_CLIENT_ID is required"),
  GMAIL_CLIENT_SECRET: z.string().min(1, "GMAIL_CLIENT_SECRET is required"),
  GMAIL_REFRESH_TOKEN: z.string().min(1, "GMAIL_REFRESH_TOKEN is required"),
  GMAIL_USER: z.email({ error: "Valid GMAIL_USER is required" }),
});

// 3. Check if the rules are followed
const parsedEnv = envSchema.safeParse(process.env);

// 4. If rules are broken, crash immediately
if (!parsedEnv.success) {
  console.error("❌ Invalid or missing environment variables:");
  console.error(parsedEnv.error.message);
  process.exit(1);
}

// 5. Export the validated object
export const config = parsedEnv.data;
