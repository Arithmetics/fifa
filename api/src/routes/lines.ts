import express from "express";
import { prisma } from "../db.js";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = express.Router();

// Get all lines with their choices
router.get("/", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const lines = await prisma.line.findMany({
      include: {
        choices: {
          orderBy: {
            title: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json({ lines });
  } catch (error) {
    console.error("Error fetching lines:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
