import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from project root (parent directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../.env") });

import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { fromNodeHeaders } from "better-auth/node";
import userRoutes from "./routes/user.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// User routes - must be before better-auth catch-all
app.use("/api/auth/user", userRoutes);

// Better Auth middleware - handle all other auth routes
// Express 5 requires named wildcards
app.all("/api/auth/{*splat}", toNodeHandler(auth));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Root route - API server info
app.get("/", (req, res) => {
  res.json({
    message:
      "This is the API server. The web application is available at http://localhost:3000",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/*",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
