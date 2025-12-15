import express from "express";
import { prisma } from "../db.js";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = express.Router();

// Update display name
router.post("/display-name", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { displayName } = req.body;

    if (
      !displayName ||
      typeof displayName !== "string" ||
      displayName.trim().length === 0
    ) {
      return res.status(400).json({ error: "Display name is required" });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { displayName: displayName.trim() },
    });

    res.json({ user });
  } catch (error) {
    console.error("Error updating display name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
