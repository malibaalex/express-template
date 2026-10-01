import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET_KEY: z.string().min(1, "JWT_ACCESS_SECRET_KEY is required"),
  JWT_ACCESS_SECRET_KEY_EXPIRES_IN: z.coerce.number().default(900),
  JWT_REFRESH_SECRET_KEY: z
    .string()
    .min(1, "JWT_REFRESH_SECRET_KEY is required"),
  JWT_REFRESH__SECRET_KEY_EXPIRES_IN: z.coerce.number().default(604800),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    z.flattenError(parsed.error).fieldErrors,
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

export type Env = typeof env;
