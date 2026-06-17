import { z } from "zod";
import dotenv from "dotenv";
// 1. Load the .env file into process.env
dotenv.config();

// 2. Define the RULES
const envSchema = z.object({
  // --- REQUIRED ---
  ATLAS_URI: z.string().min(1, "ATLAS_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  NODE_ENV: z.enum(["development", "production", "test"]),

  // --- OPTIONAL
  PORT: z.string().default("3000"),
  DEPLOYED_URL: z.string().optional(),
});

// 3. Check if the rules are followed
const parsedEnv = envSchema.safeParse(process.env);

// 4. If rules are broken, crash immediately
if (!parsedEnv.success) {
  console.error("Invalid or missing environment variables:");
  console.error(parsedEnv.error.message);
  process.exit(1); // <-- Server stops here. No DB connection, no port listening.
}

// 5. Export the validated object so we can import it everywhere else
export const config = parsedEnv.data;
