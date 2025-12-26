import express from "express";
import { prisma } from "../db.js";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = express.Router();

const CONTEST_CLOSED_KEY = "contestClosed";

// Helper function to check if contest is closed
async function isContestClosed(): Promise<boolean> {
  const setting = await prisma.settings.findUnique({
    where: { key: CONTEST_CLOSED_KEY },
  });
  return setting?.value === "true";
}

// Get all bets for the logged-in user
router.get("/", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const bets = await prisma.bet.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        choice: {
          include: {
            line: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json({ bets });
  } catch (error) {
    console.error("Error fetching bets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create or replace bets for a collection
router.post("/", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if contest is closed - if so, prevent bet creation/deletion
    if (await isContestClosed()) {
      return res.status(403).json({
        error: "Contest is closed. Bets cannot be modified.",
      });
    }

    const { choiceIds } = req.body;

    if (!Array.isArray(choiceIds) || choiceIds.length === 0) {
      return res
        .status(400)
        .json({ error: "choiceIds must be a non-empty array" });
    }

    // Check for duplicates
    const uniqueChoiceIds = new Set(choiceIds);
    if (uniqueChoiceIds.size !== choiceIds.length) {
      return res
        .status(400)
        .json({ error: "choiceIds must not contain duplicates" });
    }

    // Fetch all the choices with their lines to validate
    const choices = await prisma.choice.findMany({
      where: {
        id: {
          in: choiceIds,
        },
      },
      include: {
        line: true,
      },
    });

    if (choices.length !== choiceIds.length) {
      return res.status(400).json({
        error: "One or more choiceIds are invalid",
      });
    }

    // Validate all choices belong to lines in the same collection
    const firstLine = choices[0].line;
    const firstCollection = [...firstLine.collection].sort();
    const collectionLimit = firstLine.choiceCollectionLimit;

    // If collectionLimit is null (single line, no collection), skip collection validation
    // Otherwise, validate all choices belong to lines in the same collection
    if (collectionLimit !== null) {
      const allSameCollection = choices.every((choice) => {
        const choiceCollection = [...choice.line.collection].sort();
        if (choiceCollection.length !== firstCollection.length) return false;
        return choiceCollection.every(
          (item, idx) => item === firstCollection[idx]
        );
      });

      if (!allSameCollection) {
        return res.status(400).json({
          error: "All choices must belong to lines in the same collection",
        });
      }
    }

    // Validate collection limit

    if (collectionLimit === null) {
      // If no collection limit, validate that all choices are from the same line
      const lineIds = new Set(choices.map((c) => c.lineId));
      if (lineIds.size !== 1) {
        return res.status(400).json({
          error:
            "When no collection limit is set, all choices must be from the same line",
        });
      }

      const singleLine = firstLine;
      if (choiceIds.length !== singleLine.choiceLimit) {
        return res.status(400).json({
          error: `Must select exactly ${singleLine.choiceLimit} choice(s) for this line`,
        });
      }

      // For single lines (no collection), delete bets only for this specific line
      await prisma.bet.deleteMany({
        where: {
          userId: session.user.id,
          choice: {
            lineId: singleLine.id,
          },
        },
      });
    } else {
      // Validate against collection limit
      if (choiceIds.length !== collectionLimit) {
        return res.status(400).json({
          error: `Must select exactly ${collectionLimit} choice(s) for this collection`,
        });
      }

      // Delete existing bets for this collection from this user
      // Find all lines that have the same collection (to handle all lines in the collection, not just submitted ones)
      const allLines = await prisma.line.findMany({
        select: {
          id: true,
          collection: true,
        },
      });

      // Filter to lines with matching collection (same elements, same length)
      const matchingLineIds = allLines
        .filter((line) => {
          const lineCollection = [...line.collection].sort();
          return (
            lineCollection.length === firstCollection.length &&
            lineCollection.every((item, idx) => item === firstCollection[idx])
          );
        })
        .map((l) => l.id);

      // Delete all bets for this user for lines in this collection
      await prisma.bet.deleteMany({
        where: {
          userId: session.user.id,
          choice: {
            lineId: {
              in: matchingLineIds,
            },
          },
        },
      });
    }

    // Create new bets
    await prisma.bet.createMany({
      data: choiceIds.map((choiceId) => ({
        choiceId,
        userId: session.user.id,
      })),
    });

    // Fetch the created bets with their relations for the response
    const createdBets = await prisma.bet.findMany({
      where: {
        userId: session.user.id,
        choiceId: {
          in: choiceIds,
        },
      },
      include: {
        choice: {
          include: {
            line: true,
          },
        },
      },
    });

    res.json({ bets: createdBets });
  } catch (error) {
    console.error("Error creating bets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
