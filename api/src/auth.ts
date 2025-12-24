import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from project root (parent directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../.env") });

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.js";

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    `http://localhost:${process.env.PORT || 3001}`,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET!,
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:3000"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false, // Only Google OAuth
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});

const ADMIN_EMAIL = "brock.m.tillotson@gmail.com";

/**
 * Check if the user from a session is an admin
 * @param user The user object from the session
 * @returns true if the user is an admin, false otherwise
 */
export function isAdmin(user: { email: string } | null | undefined): boolean {
  return user?.email === ADMIN_EMAIL;
}
