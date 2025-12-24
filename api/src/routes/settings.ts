import express from "express";
import { prisma } from "../db.js";
import { auth, isAdmin } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = express.Router();

const CONTEST_CLOSED_KEY = "contestClosed";

// Get settings (public, authenticated users only)
router.get("/", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get or create the contestClosed setting
    let setting = await prisma.settings.findUnique({
      where: { key: CONTEST_CLOSED_KEY },
    });

    if (!setting) {
      // Initialize if it doesn't exist
      setting = await prisma.settings.create({
        data: {
          key: CONTEST_CLOSED_KEY,
          value: "false",
        },
      });
    }

    res.json({
      contestClosed: setting.value === "true",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update settings (admin only)
router.patch("/", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!isAdmin(session.user)) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { contestClosed } = req.body;

    if (typeof contestClosed !== "boolean") {
      return res.status(400).json({ error: "contestClosed must be a boolean" });
    }

    // Update or create the setting
    const setting = await prisma.settings.upsert({
      where: { key: CONTEST_CLOSED_KEY },
      update: { value: contestClosed ? "true" : "false" },
      create: {
        key: CONTEST_CLOSED_KEY,
        value: contestClosed ? "true" : "false",
      },
    });

    res.json({
      contestClosed: setting.value === "true",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

