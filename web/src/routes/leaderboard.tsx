import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useAdminUsers } from "@/lib/admin";
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
import { useMemo } from "react";

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
};

function LeaderboardComponent() {
  const { signOut } = useAuth();
  const { data: adminData, isLoading } = useAdminUsers();
  const { data: linesData } = useLines();

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

      // Calculate total points
      let totalPoints = 0;

      // Debug: Log all Tunisia bets for this user
      const tunisiaBets = userData.bets.filter(
        (bet) => bet.choice.title === "Tunisia"
      );
      if (tunisiaBets.length > 0) {
        console.log(
          `\n=== Tunisia bets for user ${userData.displayName || userData.name} ===`
        );
        tunisiaBets.forEach((bet) => {
          const choice = bet.choice;
          let pointsAwarded = 0;
          if (choice.isPrimaryWin) {
            pointsAwarded = choice.primaryPoints;
          } else if (choice.isSecondaryWin) {
            pointsAwarded = choice.secondaryPoints;
          }
          console.log({
            line: choice.line.title,
            isPrimaryWin: choice.isPrimaryWin,
            isSecondaryWin: choice.isSecondaryWin,
            primaryPoints: choice.primaryPoints,
            secondaryPoints: choice.secondaryPoints,
            pointsAwarded: pointsAwarded,
          });
        });
        console.log("=== End Tunisia bets ===\n");
      }

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
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-semibold">Rank</th>
                        <th className="text-right p-3 font-semibold">Points</th>
                        <th className="text-left p-3 font-semibold">User</th>
                        <th className="text-left p-3 font-semibold">Email</th>
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
                        {leaderboard.map((entry, index) => (
                          <tr
                            key={entry.userId}
                            className="border-b hover:bg-muted/50 transition-colors"
                          >
                            <td className="p-3 font-medium">#{index + 1}</td>
                            <td className="p-3 text-right font-semibold">
                              {entry.totalPoints}
                            </td>
                            <td className="p-3 font-medium">
                              {entry.displayName}
                            </td>
                            <td className="p-3 text-muted-foreground text-sm">
                              {entry.email}
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
                                            : entry.champion.status === "win"
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
                                            : entry.champion.status === "win"
                                              ? "text-green-600"
                                              : "text-muted-foreground"
                                        }`}
                                      >
                                        {entry.champion.status === "win" && "+"}
                                        {entry.champion.points}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{entry.champion.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-muted-foreground">-</span>
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
                                    {Array.from({ length: 2 }).map((_, i) => (
                                      <span
                                        key={`empty-${i}`}
                                        className="text-xl text-muted-foreground/30"
                                      >
                                        -
                                      </span>
                                    ))}
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
                                      length: 4 - entry.quarterfinals.length,
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
                                    {Array.from({ length: 4 }).map((_, i) => (
                                      <span
                                        key={`empty-${i}`}
                                        className="text-xl text-muted-foreground/30"
                                      >
                                        -
                                      </span>
                                    ))}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
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
