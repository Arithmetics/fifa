import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "prisma/config";

// Load .env from project root (parent directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://user:password@localhost:5432/db",
  },
});
