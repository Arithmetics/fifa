import { Card } from "@/components/ui/card";

export type Team = {
  id: string;
  name: string;
  flag: string;
  points?: number;
};

export type Matchup = {
  id: string;
  team1: Team | null;
  team2: Team | null;
  winner?: Team | null;
};

type BracketViewProps = {
  matchups: Matchup[];
  onTeamSelect?: (team: Team) => void;
  selectedTeams?: Set<string> | string[]; // team IDs
  maxSelections?: number;
};

export function BracketView({
  matchups,
  onTeamSelect,
  selectedTeams = new Set(),
  maxSelections,
}: BracketViewProps) {
  // Group matchups into pairs for display (showing which matchups lead to the next round)
  const matchupPairs: Matchup[][] = [];
  for (let i = 0; i < matchups.length; i += 2) {
    matchupPairs.push([matchups[i], matchups[i + 1]].filter(Boolean));
  }

  // Convert selectedTeams to Set if it's an array
  const selectedSet = Array.isArray(selectedTeams)
    ? new Set(selectedTeams)
    : selectedTeams;

  const handleTeamClick = (team: Team) => {
    if (onTeamSelect) {
      onTeamSelect(team);
    }
  };

  const isTeamSelected = (teamId: string | undefined) => {
    if (!teamId) return false;
    return selectedSet.has(teamId);
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2">
        {matchupPairs.map((pair, pairIndex) => (
          <div
            key={pairIndex}
            className={
              pair.length === 1
                ? "flex justify-center"
                : "grid grid-cols-1 md:grid-cols-2 gap-2"
            }
          >
            {pair.map((matchup) => {
              if (!matchup) return null;

              const isTeam1Selected = isTeamSelected(matchup.team1?.id);
              const isTeam2Selected = isTeamSelected(matchup.team2?.id);
              const canSelectTeam1 =
                !maxSelections ||
                isTeam1Selected ||
                selectedSet.size < maxSelections;
              const canSelectTeam2 =
                !maxSelections ||
                isTeam2Selected ||
                selectedSet.size < maxSelections;

              return (
                <Card
                  key={matchup.id}
                  className={`p-2 ${pair.length === 1 ? "w-full max-w-md" : ""}`}
                  style={{
                    backgroundColor: "rgb(22, 24, 28)",
                    borderTopColor: "rgb(68, 68, 71)",
                    borderTopWidth: "1px",
                  }}
                >
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground mb-1">
                      Match {matchup.id}
                    </div>

                    {/* Teams horizontal layout */}
                    <div className="flex items-center gap-2">
                      {/* Team 1 */}
                      <div
                        className={`flex-1 flex items-center justify-between p-1.5 rounded border-2 transition-colors ${
                          canSelectTeam1
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-50"
                        } ${
                          isTeam1Selected
                            ? "border-primary bg-primary/10"
                            : canSelectTeam1
                              ? "border-border hover:border-primary/50"
                              : "border-border"
                        }`}
                        onClick={() =>
                          matchup.team1 &&
                          canSelectTeam1 &&
                          handleTeamClick(matchup.team1)
                        }
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{matchup.team1?.flag}</span>
                          <span className="font-medium text-sm">
                            {matchup.team1?.name || "TBD"}
                          </span>
                        </div>
                        {matchup.team1?.points !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {matchup.team1.points} pts
                          </span>
                        )}
                      </div>

                      <div className="text-muted-foreground text-xs px-1">
                        vs
                      </div>

                      {/* Team 2 */}
                      <div
                        className={`flex-1 flex items-center justify-between p-1.5 rounded border-2 transition-colors ${
                          canSelectTeam2
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-50"
                        } ${
                          isTeam2Selected
                            ? "border-primary bg-primary/10"
                            : canSelectTeam2
                              ? "border-border hover:border-primary/50"
                              : "border-border"
                        }`}
                        onClick={() =>
                          matchup.team2 &&
                          canSelectTeam2 &&
                          handleTeamClick(matchup.team2)
                        }
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{matchup.team2?.flag}</span>
                          <span className="font-medium text-sm">
                            {matchup.team2?.name || "TBD"}
                          </span>
                        </div>
                        {matchup.team2?.points !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {matchup.team2.points} pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
