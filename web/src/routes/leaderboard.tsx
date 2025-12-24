import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useLeaderboard } from "@/lib/leaderboard";
import { useLines } from "@/lib/lines";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardComponent,
});

type PickStatus = "pending" | "win" | "loss";

type PickWithPoints = {
  flag: string | null;
  name: string;
  points: number;
  status: PickStatus;
  choiceId: string;
  lineId: string;
};

type LeaderboardEntry = {
  userId: string;
  displayName: string;
  email: string;
  champion: PickWithPoints | null;
  finalFour: PickWithPoints[]; // Semifinals winners (2 teams)
  quarterfinals: PickWithPoints[]; // Quarterfinals winners (4 teams)
  totalPoints: number;
  // Additional picks for expanded view
  groupWinners: PickWithPoints[]; // Group winners (primary points only)
  qualifiers: PickWithPoints[]; // Group winner secondary + runners up + third place
  roundOf32: PickWithPoints[]; // Round of 32 picks
  roundOf16: PickWithPoints[]; // Round of 16 picks
  playerAwards: {
    goldenBoot: PickWithPoints | null;
    goldenBall: PickWithPoints | null;
    goldenGlove: PickWithPoints | null;
    youngPlayer: PickWithPoints | null;
  };
};

function LeaderboardComponent() {
  const { signOut } = useAuth();
  const { data: adminData, isLoading } = useLeaderboard();
  const { data: linesData } = useLines();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Calculate leaderboard entries
  const leaderboard = useMemo(() => {
    if (!adminData?.users || !linesData?.lines) return [];

    const entries: LeaderboardEntry[] = [];

    // Create a map of lineId to all choices with their win status
    const lineChoicesMap = new Map<
      string,
      Array<{ id: string; isWin: boolean }>
    >();
    linesData.lines.forEach((line) => {
      const choices = line.choices.map((choice) => ({
        id: choice.id,
        isWin: choice.isPrimaryWin || choice.isSecondaryWin,
      }));
      lineChoicesMap.set(line.id, choices);
    });

    // Helper to determine pick status
    const getPickStatus = (
      choiceId: string,
      lineId: string,
      choiceIsWin: boolean
    ): PickStatus => {
      if (choiceIsWin) return "win";

      const lineChoices = lineChoicesMap.get(lineId) || [];
      const anyOtherChoiceHasWin = lineChoices.some(
        (c) => c.id !== choiceId && c.isWin
      );

      if (anyOtherChoiceHasWin) return "loss";
      return "pending";
    };

    adminData.users.forEach((userData) => {
      // Helper to get potential points for display
      // Shows actual points if graded, or the maximum potential points if pending
      const getPotentialPoints = (choice: {
        isPrimaryWin: boolean;
        isSecondaryWin: boolean;
        primaryPoints: number;
        secondaryPoints: number;
      }) => {
        if (choice.isPrimaryWin) {
          return choice.primaryPoints;
        } else if (choice.isSecondaryWin) {
          return choice.secondaryPoints;
        }
        // If not graded, show the higher of primary or secondary points as potential
        return Math.max(choice.primaryPoints, choice.secondaryPoints);
      };

      // Find champion pick (Championship line bet)
      const championBet = userData.bets.find(
        (bet) => bet.choice.line.title === "Championship"
      );
      const champion: PickWithPoints | null = championBet
        ? {
            flag: championBet.choice.flag,
            name: championBet.choice.title,
            points: getPotentialPoints(championBet.choice),
            status: getPickStatus(
              championBet.choice.id,
              championBet.choice.lineId,
              championBet.choice.isPrimaryWin ||
                championBet.choice.isSecondaryWin
            ),
            choiceId: championBet.choice.id,
            lineId: championBet.choice.lineId,
          }
        : null;

      // Find final four picks (Semifinals line bets - 2 teams)
      const semifinalsBets = userData.bets
        .filter((bet) => bet.choice.line.title === "Semifinals")
        .slice(0, 2); // Take up to 2

      const finalFour: PickWithPoints[] = semifinalsBets.map((bet) => ({
        flag: bet.choice.flag,
        name: bet.choice.title,
        points: getPotentialPoints(bet.choice),
        status: getPickStatus(
          bet.choice.id,
          bet.choice.lineId,
          bet.choice.isPrimaryWin || bet.choice.isSecondaryWin
        ),
        choiceId: bet.choice.id,
        lineId: bet.choice.lineId,
      }));

      // Find quarterfinals picks (Quarterfinals line bets - 4 teams)
      const quarterfinalsBets = userData.bets
        .filter((bet) => bet.choice.line.title === "Quarterfinals")
        .slice(0, 4); // Take up to 4

      const quarterfinals: PickWithPoints[] = quarterfinalsBets.map((bet) => ({
        flag: bet.choice.flag,
        name: bet.choice.title,
        points: getPotentialPoints(bet.choice),
        status: getPickStatus(
          bet.choice.id,
          bet.choice.lineId,
          bet.choice.isPrimaryWin || bet.choice.isSecondaryWin
        ),
        choiceId: bet.choice.id,
        lineId: bet.choice.lineId,
      }));

      // Find group winners (primary points only - show all picks but use primaryPoints)
      const groupWinnerBets = userData.bets.filter(
        (bet) =>
          bet.choice.line.title.startsWith("Group ") &&
          bet.choice.line.title.endsWith(" Winner")
      );
      const groupWinners: PickWithPoints[] = groupWinnerBets.map((bet) => ({
        flag: bet.choice.flag,
        name: bet.choice.title,
        points: bet.choice.primaryPoints, // Always show primary points
        status: getPickStatus(
          bet.choice.id,
          bet.choice.lineId,
          bet.choice.isPrimaryWin
        ),
        choiceId: bet.choice.id,
        lineId: bet.choice.lineId,
      }));

      // Find qualifiers: group winner secondary + runners up + third place (show all picks)
      const qualifiers: PickWithPoints[] = [];
      // Group winner secondary wins (show all group winner picks, use secondaryPoints)
      groupWinnerBets.forEach((bet) => {
        qualifiers.push({
          flag: bet.choice.flag,
          name: bet.choice.title,
          points: bet.choice.secondaryPoints,
          status: getPickStatus(
            bet.choice.id,
            bet.choice.lineId,
            bet.choice.isSecondaryWin && !bet.choice.isPrimaryWin
          ),
          choiceId: bet.choice.id,
          lineId: bet.choice.lineId,
        });
      });
      // Runners up (primary points - show all picks)
      const runnerUpBets = userData.bets.filter((bet) =>
        bet.choice.line.title.includes("Runner Up")
      );
      runnerUpBets.forEach((bet) => {
        qualifiers.push({
          flag: bet.choice.flag,
          name: bet.choice.title,
          points: bet.choice.primaryPoints,
          status: getPickStatus(
            bet.choice.id,
            bet.choice.lineId,
            bet.choice.isPrimaryWin
          ),
          choiceId: bet.choice.id,
          lineId: bet.choice.lineId,
        });
      });
      // Third place (primary points - show all picks)
      const thirdPlaceBets = userData.bets.filter((bet) =>
        bet.choice.line.title.includes("Third Place")
      );
      thirdPlaceBets.forEach((bet) => {
        qualifiers.push({
          flag: bet.choice.flag,
          name: bet.choice.title,
          points: bet.choice.primaryPoints,
          status: getPickStatus(
            bet.choice.id,
            bet.choice.lineId,
            bet.choice.isPrimaryWin
          ),
          choiceId: bet.choice.id,
          lineId: bet.choice.lineId,
        });
      });

      // Find Round of 32 picks
      const roundOf32Bets = userData.bets.filter(
        (bet) => bet.choice.line.title === "Round of 32"
      );
      const roundOf32: PickWithPoints[] = roundOf32Bets.map((bet) => ({
        flag: bet.choice.flag,
        name: bet.choice.title,
        points: getPotentialPoints(bet.choice),
        status: getPickStatus(
          bet.choice.id,
          bet.choice.lineId,
          bet.choice.isPrimaryWin || bet.choice.isSecondaryWin
        ),
        choiceId: bet.choice.id,
        lineId: bet.choice.lineId,
      }));

      // Find Round of 16 picks
      const roundOf16Bets = userData.bets.filter(
        (bet) => bet.choice.line.title === "Round of 16"
      );
      const roundOf16: PickWithPoints[] = roundOf16Bets.map((bet) => ({
        flag: bet.choice.flag,
        name: bet.choice.title,
        points: getPotentialPoints(bet.choice),
        status: getPickStatus(
          bet.choice.id,
          bet.choice.lineId,
          bet.choice.isPrimaryWin || bet.choice.isSecondaryWin
        ),
        choiceId: bet.choice.id,
        lineId: bet.choice.lineId,
      }));

      // Find player awards
      const goldenBootBet = userData.bets.find(
        (bet) => bet.choice.line.title === "Golden Boot (Top Scorer)"
      );
      const goldenBallBet = userData.bets.find(
        (bet) => bet.choice.line.title === "Golden Ball (Best Player)"
      );
      const goldenGloveBet = userData.bets.find(
        (bet) => bet.choice.line.title === "Golden Glove (Best Goalkeeper)"
      );
      const youngPlayerBet = userData.bets.find(
        (bet) => bet.choice.line.title === "FIFA Young Player Award"
      );

      const playerAwards = {
        goldenBoot: goldenBootBet
          ? {
              flag: goldenBootBet.choice.flag,
              name: goldenBootBet.choice.title,
              points: getPotentialPoints(goldenBootBet.choice),
              status: getPickStatus(
                goldenBootBet.choice.id,
                goldenBootBet.choice.lineId,
                goldenBootBet.choice.isPrimaryWin ||
                  goldenBootBet.choice.isSecondaryWin
              ),
              choiceId: goldenBootBet.choice.id,
              lineId: goldenBootBet.choice.lineId,
            }
          : null,
        goldenBall: goldenBallBet
          ? {
              flag: goldenBallBet.choice.flag,
              name: goldenBallBet.choice.title,
              points: getPotentialPoints(goldenBallBet.choice),
              status: getPickStatus(
                goldenBallBet.choice.id,
                goldenBallBet.choice.lineId,
                goldenBallBet.choice.isPrimaryWin ||
                  goldenBallBet.choice.isSecondaryWin
              ),
              choiceId: goldenBallBet.choice.id,
              lineId: goldenBallBet.choice.lineId,
            }
          : null,
        goldenGlove: goldenGloveBet
          ? {
              flag: goldenGloveBet.choice.flag,
              name: goldenGloveBet.choice.title,
              points: getPotentialPoints(goldenGloveBet.choice),
              status: getPickStatus(
                goldenGloveBet.choice.id,
                goldenGloveBet.choice.lineId,
                goldenGloveBet.choice.isPrimaryWin ||
                  goldenGloveBet.choice.isSecondaryWin
              ),
              choiceId: goldenGloveBet.choice.id,
              lineId: goldenGloveBet.choice.lineId,
            }
          : null,
        youngPlayer: youngPlayerBet
          ? {
              flag: youngPlayerBet.choice.flag,
              name: youngPlayerBet.choice.title,
              points: getPotentialPoints(youngPlayerBet.choice),
              status: getPickStatus(
                youngPlayerBet.choice.id,
                youngPlayerBet.choice.lineId,
                youngPlayerBet.choice.isPrimaryWin ||
                  youngPlayerBet.choice.isSecondaryWin
              ),
              choiceId: youngPlayerBet.choice.id,
              lineId: youngPlayerBet.choice.lineId,
            }
          : null,
      };

      // Calculate total points
      let totalPoints = 0;
      userData.bets.forEach((bet) => {
        const choice = bet.choice;
        // If primary win, use primary points
        if (choice.isPrimaryWin) {
          totalPoints += choice.primaryPoints;
        } else if (choice.isSecondaryWin) {
          // If only secondary win (not primary), use secondary points
          totalPoints += choice.secondaryPoints;
        }
        // If neither is true, don't add any points (pick not graded yet)
      });

      entries.push({
        userId: userData.id,
        displayName: userData.displayName || userData.name,
        email: userData.email,
        champion,
        finalFour,
        quarterfinals,
        totalPoints,
        groupWinners,
        qualifiers,
        roundOf32,
        roundOf16,
        playerAwards,
      });
    });

    // Sort by points descending
    entries.sort((a, b) => b.totalPoints - a.totalPoints);

    return entries;
  }, [adminData, linesData]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Title and Logout */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">🌍 World Cup 2026 ⚽</h1>
            <div className="flex items-center gap-2">
              <Link to="/leaderboard">
                <Button variant="outline" size="sm">
                  Leaderboard
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Leaderboard</CardTitle>
              <CardDescription>
                Current standings based on picks and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading leaderboard...</p>
              ) : leaderboard.length === 0 ? (
                <p className="text-muted-foreground">No entries yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table
                    className="w-full border-collapse text-sm"
                    style={{ minWidth: "800px" }}
                  >
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-semibold w-10"></th>
                        <th className="text-left p-3 font-semibold">Rank</th>
                        <th className="text-left p-3 font-semibold">Points</th>
                        <th className="text-left p-3 font-semibold">User</th>
                        <th className="text-center p-3 font-semibold">
                          Winner
                        </th>
                        <th className="text-center p-3 font-semibold">
                          Championship
                        </th>
                        <th className="text-center p-3 font-semibold">
                          Final Four
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <TooltipProvider>
                        {leaderboard.map((entry, index) => {
                          const isExpanded = expandedRows.has(entry.userId);
                          const toggleExpand = () => {
                            setExpandedRows((prev) => {
                              const next = new Set(prev);
                              if (next.has(entry.userId)) {
                                next.delete(entry.userId);
                              } else {
                                next.add(entry.userId);
                              }
                              return next;
                            });
                          };

                          return (
                            <>
                              <tr
                                key={entry.userId}
                                className="border-b hover:bg-muted/50 transition-colors"
                              >
                                <td className="p-3">
                                  <button
                                    onClick={toggleExpand}
                                    className="p-1 hover:bg-muted rounded transition-colors"
                                    aria-label={
                                      isExpanded ? "Collapse row" : "Expand row"
                                    }
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </button>
                                </td>
                                <td className="p-3 font-medium">
                                  #{index + 1}
                                </td>
                                <td className="p-3 text-left font-semibold">
                                  {entry.totalPoints}
                                </td>
                                <td className="p-3 font-medium">
                                  {entry.displayName}
                                </td>
                                <td className="p-3 text-center">
                                  {entry.champion ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex flex-col items-center gap-1 cursor-help">
                                          <span
                                            className={`text-2xl ${
                                              entry.champion.status === "loss"
                                                ? "line-through text-destructive"
                                                : entry.champion.status ===
                                                    "win"
                                                  ? "text-green-600"
                                                  : ""
                                            }`}
                                          >
                                            {entry.champion.flag || "-"}
                                          </span>
                                          <span
                                            className={`text-xs ${
                                              entry.champion.status === "loss"
                                                ? "line-through text-destructive"
                                                : entry.champion.status ===
                                                    "win"
                                                  ? "text-green-600"
                                                  : "text-muted-foreground"
                                            }`}
                                          >
                                            {entry.champion.status === "win" &&
                                              "+"}
                                            {entry.champion.points}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{entry.champion.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-start justify-center gap-2">
                                    {entry.finalFour.length > 0 ? (
                                      <>
                                        {entry.finalFour.map((pick, i) => (
                                          <Tooltip key={i}>
                                            <TooltipTrigger asChild>
                                              <div className="flex flex-col items-center gap-1 cursor-help">
                                                <span
                                                  className={`text-xl ${
                                                    pick.status === "loss"
                                                      ? "line-through text-destructive"
                                                      : pick.status === "win"
                                                        ? "text-green-600"
                                                        : ""
                                                  }`}
                                                >
                                                  {pick.flag || "-"}
                                                </span>
                                                <span
                                                  className={`text-xs ${
                                                    pick.status === "loss"
                                                      ? "line-through text-destructive"
                                                      : pick.status === "win"
                                                        ? "text-green-600"
                                                        : "text-muted-foreground"
                                                  }`}
                                                >
                                                  {pick.status === "win" && "+"}
                                                  {pick.points}
                                                </span>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{pick.name}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        ))}
                                        {/* Fill empty slots if less than 2 */}
                                        {Array.from({
                                          length: 2 - entry.finalFour.length,
                                        }).map((_, i) => (
                                          <span
                                            key={`empty-${i}`}
                                            className="text-xl text-muted-foreground/30"
                                          >
                                            -
                                          </span>
                                        ))}
                                      </>
                                    ) : (
                                      <>
                                        {Array.from({ length: 2 }).map(
                                          (_, i) => (
                                            <span
                                              key={`empty-${i}`}
                                              className="text-xl text-muted-foreground/30"
                                            >
                                              -
                                            </span>
                                          )
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-start justify-center gap-2 flex-wrap">
                                    {entry.quarterfinals.length > 0 ? (
                                      <>
                                        {entry.quarterfinals.map((pick, i) => (
                                          <Tooltip key={i}>
                                            <TooltipTrigger asChild>
                                              <div className="flex flex-col items-center gap-1 cursor-help">
                                                <span
                                                  className={`text-xl ${
                                                    pick.status === "loss"
                                                      ? "line-through text-destructive"
                                                      : pick.status === "win"
                                                        ? "text-green-600"
                                                        : ""
                                                  }`}
                                                >
                                                  {pick.flag || "-"}
                                                </span>
                                                <span
                                                  className={`text-xs ${
                                                    pick.status === "loss"
                                                      ? "line-through text-destructive"
                                                      : pick.status === "win"
                                                        ? "text-green-600"
                                                        : "text-muted-foreground"
                                                  }`}
                                                >
                                                  {pick.status === "win" && "+"}
                                                  {pick.points}
                                                </span>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{pick.name}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        ))}
                                        {/* Fill empty slots if less than 4 */}
                                        {Array.from({
                                          length:
                                            4 - entry.quarterfinals.length,
                                        }).map((_, i) => (
                                          <span
                                            key={`empty-${i}`}
                                            className="text-xl text-muted-foreground/30"
                                          >
                                            -
                                          </span>
                                        ))}
                                      </>
                                    ) : (
                                      <>
                                        {Array.from({ length: 4 }).map(
                                          (_, i) => (
                                            <span
                                              key={`empty-${i}`}
                                              className="text-xl text-muted-foreground/30"
                                            >
                                              -
                                            </span>
                                          )
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr
                                  key={`${entry.userId}-expanded`}
                                  className="border-b bg-muted/30"
                                >
                                  <td colSpan={7} className="p-4">
                                    <div className="space-y-4">
                                      {/* Round of 16 */}
                                      <div>
                                        <h4 className="text-sm font-semibold mb-2">
                                          Final 8
                                        </h4>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {entry.roundOf16.length > 0 ? (
                                            entry.roundOf16.map((pick, i) => (
                                              <Tooltip key={i}>
                                                <TooltipTrigger asChild>
                                                  <div className="flex flex-col items-center gap-1 cursor-help">
                                                    <span
                                                      className={`text-xl ${
                                                        pick.status === "loss"
                                                          ? "line-through text-destructive"
                                                          : pick.status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : ""
                                                      }`}
                                                    >
                                                      {pick.flag || "-"}
                                                    </span>
                                                    <span
                                                      className={`text-xs ${
                                                        pick.status === "loss"
                                                          ? "line-through text-destructive"
                                                          : pick.status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                      }`}
                                                    >
                                                      {pick.status === "win" &&
                                                        "+"}
                                                      {pick.points}
                                                    </span>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{pick.name}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            ))
                                          ) : (
                                            <span className="text-muted-foreground text-sm">
                                              No Round of 16 picks
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Round of 32 */}
                                      <div>
                                        <h4 className="text-sm font-semibold mb-2">
                                          Final 16
                                        </h4>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {entry.roundOf32.length > 0 ? (
                                            entry.roundOf32.map((pick, i) => (
                                              <Tooltip key={i}>
                                                <TooltipTrigger asChild>
                                                  <div className="flex flex-col items-center gap-1 cursor-help">
                                                    <span
                                                      className={`text-xl ${
                                                        pick.status === "loss"
                                                          ? "line-through text-destructive"
                                                          : pick.status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : ""
                                                      }`}
                                                    >
                                                      {pick.flag || "-"}
                                                    </span>
                                                    <span
                                                      className={`text-xs ${
                                                        pick.status === "loss"
                                                          ? "line-through text-destructive"
                                                          : pick.status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                      }`}
                                                    >
                                                      {pick.status === "win" &&
                                                        "+"}
                                                      {pick.points}
                                                    </span>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{pick.name}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            ))
                                          ) : (
                                            <span className="text-muted-foreground text-sm">
                                              No Round of 32 picks
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Group Winners */}
                                      <div>
                                        <h4 className="text-sm font-semibold mb-2">
                                          Group Winners
                                        </h4>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {entry.groupWinners.length > 0 ? (
                                            entry.groupWinners.map(
                                              (pick, i) => (
                                                <Tooltip key={i}>
                                                  <TooltipTrigger asChild>
                                                    <div className="flex flex-col items-center gap-1 cursor-help">
                                                      <span
                                                        className={`text-xl ${
                                                          pick.status === "loss"
                                                            ? "line-through text-destructive"
                                                            : pick.status ===
                                                                "win"
                                                              ? "text-green-600"
                                                              : ""
                                                        }`}
                                                      >
                                                        {pick.flag || "-"}
                                                      </span>
                                                      <span
                                                        className={`text-xs ${
                                                          pick.status === "loss"
                                                            ? "line-through text-destructive"
                                                            : pick.status ===
                                                                "win"
                                                              ? "text-green-600"
                                                              : "text-muted-foreground"
                                                        }`}
                                                      >
                                                        {pick.status ===
                                                          "win" && "+"}
                                                        {pick.points}
                                                      </span>
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>{pick.name}</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              )
                                            )
                                          ) : (
                                            <span className="text-muted-foreground text-sm">
                                              No group winners selected
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Qualifiers (Group Winner Secondary + Runners Up + Third Place) */}
                                      <div>
                                        <h4 className="text-sm font-semibold mb-2">
                                          Qualifiers (Runners Up / Third Place
                                          Qualifers)
                                        </h4>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {entry.qualifiers.length > 0 ? (
                                            entry.qualifiers.map((pick, i) => (
                                              <Tooltip key={i}>
                                                <TooltipTrigger asChild>
                                                  <div className="flex flex-col items-center gap-1 cursor-help">
                                                    <span
                                                      className={`text-xl ${
                                                        pick.status === "loss"
                                                          ? "line-through text-destructive"
                                                          : pick.status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : ""
                                                      }`}
                                                    >
                                                      {pick.flag || "-"}
                                                    </span>
                                                    <span
                                                      className={`text-xs ${
                                                        pick.status === "loss"
                                                          ? "line-through text-destructive"
                                                          : pick.status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                      }`}
                                                    >
                                                      {pick.status === "win" &&
                                                        "+"}
                                                      {pick.points}
                                                    </span>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{pick.name}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            ))
                                          ) : (
                                            <span className="text-muted-foreground text-sm">
                                              No qualifiers selected
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Player Awards */}
                                      <div>
                                        <h4 className="text-sm font-semibold mb-2">
                                          Player Awards
                                        </h4>
                                        <div className="flex items-center gap-4 flex-wrap">
                                          {entry.playerAwards.goldenBoot && (
                                            <div>
                                              <span className="text-xs text-muted-foreground block mb-1">
                                                Golden Boot
                                              </span>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div className="flex flex-col items-center gap-1 cursor-help">
                                                    <span
                                                      className={`text-xl ${
                                                        entry.playerAwards
                                                          .goldenBoot.status ===
                                                        "loss"
                                                          ? "line-through text-destructive"
                                                          : entry.playerAwards
                                                                .goldenBoot
                                                                .status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : ""
                                                      }`}
                                                    >
                                                      {entry.playerAwards
                                                        .goldenBoot.flag || "-"}
                                                    </span>
                                                    <span
                                                      className={`text-xs ${
                                                        entry.playerAwards
                                                          .goldenBoot.status ===
                                                        "loss"
                                                          ? "line-through text-destructive"
                                                          : entry.playerAwards
                                                                .goldenBoot
                                                                .status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                      }`}
                                                    >
                                                      {entry.playerAwards
                                                        .goldenBoot.status ===
                                                        "win" && "+"}
                                                      {
                                                        entry.playerAwards
                                                          .goldenBoot.points
                                                      }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground text-center max-w-[80px] truncate">
                                                      {
                                                        entry.playerAwards
                                                          .goldenBoot.name
                                                      }
                                                    </span>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>
                                                    {
                                                      entry.playerAwards
                                                        .goldenBoot.name
                                                    }
                                                  </p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          )}
                                          {entry.playerAwards.goldenBall && (
                                            <div>
                                              <span className="text-xs text-muted-foreground block mb-1">
                                                Golden Ball
                                              </span>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div className="flex flex-col items-center gap-1 cursor-help">
                                                    <span
                                                      className={`text-xl ${
                                                        entry.playerAwards
                                                          .goldenBall.status ===
                                                        "loss"
                                                          ? "line-through text-destructive"
                                                          : entry.playerAwards
                                                                .goldenBall
                                                                .status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : ""
                                                      }`}
                                                    >
                                                      {entry.playerAwards
                                                        .goldenBall.flag || "-"}
                                                    </span>
                                                    <span
                                                      className={`text-xs ${
                                                        entry.playerAwards
                                                          .goldenBall.status ===
                                                        "loss"
                                                          ? "line-through text-destructive"
                                                          : entry.playerAwards
                                                                .goldenBall
                                                                .status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                      }`}
                                                    >
                                                      {entry.playerAwards
                                                        .goldenBall.status ===
                                                        "win" && "+"}
                                                      {
                                                        entry.playerAwards
                                                          .goldenBall.points
                                                      }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground text-center max-w-[80px] truncate">
                                                      {
                                                        entry.playerAwards
                                                          .goldenBall.name
                                                      }
                                                    </span>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>
                                                    {
                                                      entry.playerAwards
                                                        .goldenBall.name
                                                    }
                                                  </p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          )}
                                          {entry.playerAwards.goldenGlove && (
                                            <div>
                                              <span className="text-xs text-muted-foreground block mb-1">
                                                Golden Glove
                                              </span>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div className="flex flex-col items-center gap-1 cursor-help">
                                                    <span
                                                      className={`text-xl ${
                                                        entry.playerAwards
                                                          .goldenGlove
                                                          .status === "loss"
                                                          ? "line-through text-destructive"
                                                          : entry.playerAwards
                                                                .goldenGlove
                                                                .status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : ""
                                                      }`}
                                                    >
                                                      {entry.playerAwards
                                                        .goldenGlove.flag ||
                                                        "-"}
                                                    </span>
                                                    <span
                                                      className={`text-xs ${
                                                        entry.playerAwards
                                                          .goldenGlove
                                                          .status === "loss"
                                                          ? "line-through text-destructive"
                                                          : entry.playerAwards
                                                                .goldenGlove
                                                                .status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                      }`}
                                                    >
                                                      {entry.playerAwards
                                                        .goldenGlove.status ===
                                                        "win" && "+"}
                                                      {
                                                        entry.playerAwards
                                                          .goldenGlove.points
                                                      }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground text-center max-w-[80px] truncate">
                                                      {
                                                        entry.playerAwards
                                                          .goldenGlove.name
                                                      }
                                                    </span>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>
                                                    {
                                                      entry.playerAwards
                                                        .goldenGlove.name
                                                    }
                                                  </p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          )}
                                          {entry.playerAwards.youngPlayer && (
                                            <div>
                                              <span className="text-xs text-muted-foreground block mb-1">
                                                Young Player
                                              </span>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div className="flex flex-col items-center gap-1 cursor-help">
                                                    <span
                                                      className={`text-xl ${
                                                        entry.playerAwards
                                                          .youngPlayer
                                                          .status === "loss"
                                                          ? "line-through text-destructive"
                                                          : entry.playerAwards
                                                                .youngPlayer
                                                                .status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : ""
                                                      }`}
                                                    >
                                                      {entry.playerAwards
                                                        .youngPlayer.flag ||
                                                        "-"}
                                                    </span>
                                                    <span
                                                      className={`text-xs ${
                                                        entry.playerAwards
                                                          .youngPlayer
                                                          .status === "loss"
                                                          ? "line-through text-destructive"
                                                          : entry.playerAwards
                                                                .youngPlayer
                                                                .status ===
                                                              "win"
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                      }`}
                                                    >
                                                      {entry.playerAwards
                                                        .youngPlayer.status ===
                                                        "win" && "+"}
                                                      {
                                                        entry.playerAwards
                                                          .youngPlayer.points
                                                      }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground text-center max-w-[80px] truncate">
                                                      {
                                                        entry.playerAwards
                                                          .youngPlayer.name
                                                      }
                                                    </span>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>
                                                    {
                                                      entry.playerAwards
                                                        .youngPlayer.name
                                                    }
                                                  </p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          )}
                                          {!entry.playerAwards.goldenBoot &&
                                            !entry.playerAwards.goldenBall &&
                                            !entry.playerAwards.goldenGlove &&
                                            !entry.playerAwards.youngPlayer && (
                                              <span className="text-muted-foreground text-sm">
                                                No player awards selected
                                              </span>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </TooltipProvider>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
