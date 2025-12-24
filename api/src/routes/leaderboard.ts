import express from "express";
import { prisma } from "../db.js";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = express.Router();

const CONTEST_CLOSED_KEY = "contestClosed";

// Get leaderboard data (public, authenticated users only)
router.get("/users", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if contest is closed
    const setting = await prisma.settings.findUnique({
      where: { key: CONTEST_CLOSED_KEY },
    });

    const contestClosed = setting?.value === "true";

    // Get all users
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    // If contest is not closed, return users without bet data
    if (!contestClosed) {
      const usersWithoutBets = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        displayName: user.displayName,
        hasPaid: user.hasPaid,
        createdAt: user.createdAt,
        bets: [], // No bet data
      }));

      return res.json({ users: usersWithoutBets });
    }

    // If contest is closed, return full data with bets (same as admin endpoint)
    const usersWithBets = await prisma.user.findMany({
      include: {
        bets: {
          include: {
            choice: {
              include: {
                line: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const usersWithStatus = usersWithBets.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      displayName: user.displayName,
      hasPaid: user.hasPaid,
      createdAt: user.createdAt,
      bets: user.bets.map((bet) => ({
        id: bet.id,
        choiceId: bet.choiceId,
        choice: {
          id: bet.choice.id,
          lineId: bet.choice.lineId,
          title: bet.choice.title,
          flag: bet.choice.flag,
          primaryPoints: bet.choice.primaryPoints,
          secondaryPoints: bet.choice.secondaryPoints,
          isPrimaryWin: bet.choice.isPrimaryWin,
          isSecondaryWin: bet.choice.isSecondaryWin,
          line: {
            id: bet.choice.line.id,
            title: bet.choice.line.title,
            collection: bet.choice.line.collection,
          },
        },
      })),
    }));

    res.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Error fetching leaderboard users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

