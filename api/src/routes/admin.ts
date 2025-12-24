import express from "express";
import { prisma } from "../db.js";
import { auth, isAdmin } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = express.Router();

// Get all users with their pick completion status
router.get("/users", async (req, res) => {
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

    // Get all users with their bets
    const users = await prisma.user.findMany({
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

    // Get all lines to understand required picks
    const lines = await prisma.line.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    // Map step slugs to their required counts
    const stepRequirements: Record<string, number> = {
      "group-winners": 12,
      "group-runners-up": 12,
      "third-place-advancers": 8,
      "round-of-32": 16,
      "round-of-16": 8,
      quarterfinals: 4,
      semifinals: 2,
      championship: 1,
      "player-picks": 4,
    };

    // Helper to get pick count for a category
    const getPickCount = (
      userBets: typeof users[0]["bets"],
      category: string
    ): number => {
      if (category === "group-winners") {
        return userBets.filter((bet) =>
          bet.choice.line.collection.includes("group-winner")
        ).length;
      }
      if (category === "group-runners-up") {
        return userBets.filter((bet) =>
          bet.choice.line.collection.includes("group-runner-up")
        ).length;
      }
      if (category === "third-place-advancers") {
        return userBets.filter((bet) =>
          bet.choice.line.collection.includes("group-third-place")
        ).length;
      }
      if (category === "round-of-32") {
        return userBets.filter((bet) => bet.choice.line.title === "Round of 32")
          .length;
      }
      if (category === "round-of-16") {
        return userBets.filter((bet) => bet.choice.line.title === "Round of 16")
          .length;
      }
      if (category === "quarterfinals") {
        return userBets.filter(
          (bet) => bet.choice.line.title === "Quarterfinals"
        ).length;
      }
      if (category === "semifinals") {
        return userBets.filter((bet) => bet.choice.line.title === "Semifinals")
          .length;
      }
      if (category === "championship") {
        return userBets.filter(
          (bet) => bet.choice.line.title === "Championship"
        ).length;
      }
      if (category === "player-picks") {
        const playerAwardTitles = [
          "Golden Boot (Top Scorer)",
          "Golden Ball (Best Player)",
          "Golden Glove (Best Goalkeeper)",
          "FIFA Young Player Award",
        ];
        return userBets.filter((bet) =>
          playerAwardTitles.includes(bet.choice.line.title)
        ).length;
      }
      return 0;
    };

    // Transform users with pick completion status
    const usersWithStatus = users.map((user) => {
      const categories = Object.keys(stepRequirements);
      const pickStatus: Record<string, { required: number; current: number }> =
        {};

      categories.forEach((category) => {
        const required = stepRequirements[category];
        const current = getPickCount(user.bets, category);
        pickStatus[category] = { required, current };
      });

      const allComplete = categories.every(
        (category) => pickStatus[category].current === pickStatus[category].required
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        displayName: user.displayName,
        hasPaid: user.hasPaid,
        createdAt: user.createdAt,
        pickStatus,
        allComplete,
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
      };
    });

    res.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update win status for a single choice
router.post("/win-status/update-choice", async (req, res) => {
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

    const { choiceId, isPrimaryWin, isSecondaryWin } = req.body;

    if (!choiceId || typeof choiceId !== "string") {
      return res.status(400).json({ error: "choiceId is required" });
    }

    if (typeof isPrimaryWin !== "boolean" || typeof isSecondaryWin !== "boolean") {
      return res.status(400).json({
        error: "isPrimaryWin and isSecondaryWin must be booleans",
      });
    }

    // Update the single choice
    await prisma.choice.update({
      where: { id: choiceId },
      data: { isPrimaryWin, isSecondaryWin },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating choice win status:", error);
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return res.status(404).json({ error: "Choice not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user payment status
router.patch("/users/:userId/payment", async (req, res) => {
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

    const { userId } = req.params;
    const { hasPaid } = req.body;

    if (typeof hasPaid !== "boolean") {
      return res.status(400).json({ error: "hasPaid must be a boolean" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { hasPaid },
      select: {
        id: true,
        hasPaid: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error("Error updating user payment status:", error);
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

