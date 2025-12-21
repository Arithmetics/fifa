import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GROUPS } from "@/lib/picks-data";
import { useMemo } from "react";
import { useBets } from "@/lib/bets";
import { useLines } from "@/lib/lines";
import type {
  GroupWinnersState,
  GroupRunnersUpState,
  ThirdPlaceAdvancersState,
} from "@/lib/picks-data";
import { getPreviousRoundSlugs } from "@/lib/picks-steps";
import { createMatchupsFromTeams } from "@/lib/playoff-matchups";
import type { Team } from "@/components/picks/bracket-view";

export function PicksSummary() {
  const { data: betsData } = useBets();
  const { data: linesData } = useLines();

  // Transform bets into the format the component expects
  const picks = useMemo(() => {
    if (!betsData || !linesData) {
      return {
        groupWinners: {} as GroupWinnersState,
        groupRunnersUp: {} as GroupRunnersUpState,
        thirdPlaceAdvancers: {} as ThirdPlaceAdvancersState,
        roundOf32: [] as string[],
        roundOf16: [] as string[],
        quarterfinals: [] as string[],
        semifinals: [] as string[],
        championship: [] as string[],
        playerPicks: {} as Record<string, string>,
      };
    }

    const bets = betsData.bets;
    const lines = linesData.lines;

    // Create a map of choiceId to choice data for quick lookup
    const choiceMap = new Map<string, { title: string; flag: string | null }>();
    lines.forEach((line) => {
      line.choices.forEach((choice) => {
        choiceMap.set(choice.id, {
          title: choice.title,
          flag: choice.flag,
        });
      });
    });

    // Group winners: map group letter to country name
    const groupWinners: GroupWinnersState = {};
    bets
      .filter((bet) => bet.choice.line.collection.includes("group-winner"))
      .forEach((bet) => {
        const match = bet.choice.line.title.match(/Group ([A-L]) Winner/);
        if (match) {
          groupWinners[match[1]] = bet.choice.title;
        }
      });

    // Group runners up: map group letter to country name
    const groupRunnersUp: GroupRunnersUpState = {};
    bets
      .filter((bet) => bet.choice.line.collection.includes("group-runner-up"))
      .forEach((bet) => {
        const match = bet.choice.line.title.match(/Group ([A-L]) Runner Up/);
        if (match) {
          groupRunnersUp[match[1]] = bet.choice.title;
        }
      });

    // Third place advancers: map group letter to array of country names
    const thirdPlaceAdvancers: ThirdPlaceAdvancersState = {};
    bets
      .filter((bet) => bet.choice.line.collection.includes("group-third-place"))
      .forEach((bet) => {
        const match = bet.choice.line.title.match(/Group ([A-L]) Third Place/);
        if (match) {
          const groupLetter = match[1];
          if (!thirdPlaceAdvancers[groupLetter]) {
            thirdPlaceAdvancers[groupLetter] = [];
          }
          thirdPlaceAdvancers[groupLetter].push(bet.choice.title);
        }
      });

    // Round of 32: array of choice IDs
    const roundOf32Line = lines.find((l) => l.title === "Round of 32");
    const roundOf32 = bets
      .filter((bet) => bet.choice.lineId === roundOf32Line?.id)
      .map((bet) => bet.choiceId);

    // Round of 16: array of choice IDs
    const roundOf16Line = lines.find((l) => l.title === "Round of 16");
    const roundOf16 = bets
      .filter((bet) => bet.choice.lineId === roundOf16Line?.id)
      .map((bet) => bet.choiceId);

    // Quarterfinals: array of choice IDs
    const quarterfinalsLine = lines.find((l) => l.title === "Quarterfinals");
    const quarterfinals = bets
      .filter((bet) => bet.choice.lineId === quarterfinalsLine?.id)
      .map((bet) => bet.choiceId);

    // Semifinals: array of choice IDs
    const semifinalsLine = lines.find((l) => l.title === "Semifinals");
    const semifinals = bets
      .filter((bet) => bet.choice.lineId === semifinalsLine?.id)
      .map((bet) => bet.choiceId);

    // Championship: array of choice IDs
    const championshipLine = lines.find((l) => l.title === "Championship");
    const championship = bets
      .filter((bet) => bet.choice.lineId === championshipLine?.id)
      .map((bet) => bet.choiceId);

    // Player picks: map award key to choice ID
    const playerPicks: Record<string, string> = {};
    const playerAwardTitles = [
      "Golden Boot (Top Scorer)",
      "Golden Ball (Best Player)",
      "Golden Glove (Best Goalkeeper)",
      "FIFA Young Player Award",
    ];
    const awardKeyMap: Record<string, string> = {
      "Golden Boot (Top Scorer)": "golden-boot",
      "Golden Ball (Best Player)": "golden-ball",
      "Golden Glove (Best Goalkeeper)": "golden-glove",
      "FIFA Young Player Award": "young-player",
    };
    bets
      .filter((bet) => playerAwardTitles.includes(bet.choice.line.title))
      .forEach((bet) => {
        const key = awardKeyMap[bet.choice.line.title];
        if (key) {
          playerPicks[key] = bet.choiceId;
        }
      });

    return {
      groupWinners,
      groupRunnersUp,
      thirdPlaceAdvancers,
      roundOf32,
      roundOf16,
      quarterfinals,
      semifinals,
      championship,
      playerPicks,
    };
  }, [betsData, linesData]);

  const { groupWinners, groupRunnersUp, thirdPlaceAdvancers } = picks;

  // Helper to get selected choices for a round from bets
  const getRoundChoices = useMemo(() => {
    if (!betsData || !linesData) {
      return () =>
        [] as Array<{
          id: string;
          title: string;
          flag: string | null;
          primaryPoints: number;
          secondaryPoints: number;
        }>;
    }
    const bets = betsData.bets;
    const lines = linesData.lines;
    return (roundTitle: string) => {
      const line = lines.find((l) => l.title === roundTitle);
      if (!line) return [];
      return bets
        .filter((bet) => bet.choice.lineId === line.id)
        .map((bet) => bet.choice);
    };
  }, [betsData, linesData]);

  // Helper to get previous round choices for bracket rounds
  const getPreviousRoundChoices = useMemo(() => {
    if (!betsData || !linesData) {
      return () =>
        [] as Array<{
          id: string;
          title: string;
          flag: string | null;
          primaryPoints: number;
          secondaryPoints: number;
        }>;
    }
    const bets = betsData.bets;
    const lines = linesData.lines;

    // Map round title to slug
    const roundTitleToSlug: Record<string, string> = {
      "Round of 32": "round-of-32",
      "Round of 16": "round-of-16",
      Quarterfinals: "quarterfinals",
      Semifinals: "semifinals",
      Championship: "championship",
    };

    return (roundTitle: string) => {
      const slug = roundTitleToSlug[roundTitle];
      if (!slug) return [];

      const previousSlugs = getPreviousRoundSlugs(slug);
      if (previousSlugs.length === 0) return [];

      const previousChoices: Array<{
        id: string;
        title: string;
        flag: string | null;
        primaryPoints: number;
        secondaryPoints: number;
      }> = [];

      previousSlugs.forEach((prevSlug) => {
        if (prevSlug === "group-winners") {
          // Get all group winners
          bets
            .filter((bet) =>
              bet.choice.line.collection.includes("group-winner")
            )
            .forEach((bet) => {
              previousChoices.push(bet.choice);
            });
        } else if (prevSlug === "group-runners-up") {
          // Get all group runners-up
          bets
            .filter((bet) =>
              bet.choice.line.collection.includes("group-runner-up")
            )
            .forEach((bet) => {
              previousChoices.push(bet.choice);
            });
        } else if (prevSlug === "third-place-advancers") {
          // Get all third place advancers
          bets
            .filter((bet) =>
              bet.choice.line.collection.includes("group-third-place")
            )
            .forEach((bet) => {
              previousChoices.push(bet.choice);
            });
        } else {
          // For other playoff rounds, find the line by slug
          const prevRoundTitleMap: Record<string, string> = {
            "round-of-32": "Round of 32",
            "round-of-16": "Round of 16",
            quarterfinals: "Quarterfinals",
            semifinals: "Semifinals",
            championship: "Championship",
          };
          const prevRoundTitle = prevRoundTitleMap[prevSlug];
          if (prevRoundTitle) {
            const prevLine = lines.find((l) => l.title === prevRoundTitle);
            if (prevLine) {
              bets
                .filter((bet) => bet.choice.lineId === prevLine.id)
                .forEach((bet) => {
                  previousChoices.push(bet.choice);
                });
            }
          }
        }
      });

      return previousChoices;
    };
  }, [betsData, linesData]);

  // Helper to get advancing teams for a group
  const getAdvancingTeams = (groupLetter: string) => {
    const winner = groupWinners[groupLetter];
    const runnerUp = groupRunnersUp[groupLetter];
    const thirdPlace = thirdPlaceAdvancers[groupLetter] || [];
    return { winner, runnerUp, thirdPlace };
  };

  // Helper to check if a team advances
  const isAdvancing = (groupLetter: string, countryName: string) => {
    const { winner, runnerUp, thirdPlace } = getAdvancingTeams(groupLetter);
    return (
      countryName === winner ||
      countryName === runnerUp ||
      thirdPlace.includes(countryName)
    );
  };

  return (
    <div className="space-y-6">
      {/* Bracket Summary - Most Important First */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Championship */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Championship</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const currentChoices = getRoundChoices("Championship");
                const previousChoices = getPreviousRoundChoices("Championship");
                const currentTeamNames = new Set(
                  currentChoices.map((c) => c.title)
                );

                if (previousChoices.length === 0) {
                  return (
                    <span className="text-sm text-muted-foreground">
                      No picks yet
                    </span>
                  );
                }

                // Create teams from previous choices
                const teams: Team[] = previousChoices.map((choice) => ({
                  id: choice.id,
                  name: choice.title,
                  flag: choice.flag || "",
                  points: choice.primaryPoints,
                }));

                const matchups = createMatchupsFromTeams(teams);

                return matchups.map((matchup) => (
                  <div
                    key={matchup.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    {matchup.team1 && (
                      <div
                        className={`flex items-center gap-1 ${
                          !currentTeamNames.has(matchup.team1.name)
                            ? "text-muted-foreground line-through opacity-60"
                            : ""
                        }`}
                      >
                        <span className="text-lg">{matchup.team1.flag}</span>
                        <span>{matchup.team1.name}</span>
                        {currentTeamNames.has(matchup.team1.name) && (
                          <span className="text-xs text-muted-foreground">
                            ({matchup.team1.points} pts)
                          </span>
                        )}
                      </div>
                    )}
                    <span className="text-muted-foreground">vs</span>
                    {matchup.team2 && (
                      <div
                        className={`flex items-center gap-1 ${
                          !currentTeamNames.has(matchup.team2.name)
                            ? "text-muted-foreground line-through opacity-60"
                            : ""
                        }`}
                      >
                        <span className="text-lg">{matchup.team2.flag}</span>
                        <span>{matchup.team2.name}</span>
                        {currentTeamNames.has(matchup.team2.name) && (
                          <span className="text-xs text-muted-foreground">
                            ({matchup.team2.points} pts)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Semifinals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Semifinals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const currentChoices = getRoundChoices("Semifinals");
                const previousChoices = getPreviousRoundChoices("Semifinals");
                const currentTeamNames = new Set(
                  currentChoices.map((c) => c.title)
                );

                if (previousChoices.length === 0) {
                  return (
                    <span className="text-sm text-muted-foreground">
                      No picks yet
                    </span>
                  );
                }

                // Create teams from previous choices
                const teams: Team[] = previousChoices.map((choice) => ({
                  id: choice.id,
                  name: choice.title,
                  flag: choice.flag || "",
                  points: choice.secondaryPoints,
                }));

                const matchups = createMatchupsFromTeams(teams);

                return matchups.map((matchup) => (
                  <div
                    key={matchup.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    {matchup.team1 && (
                      <div
                        className={`flex items-center gap-1 ${
                          !currentTeamNames.has(matchup.team1.name)
                            ? "text-muted-foreground line-through opacity-60"
                            : ""
                        }`}
                      >
                        <span className="text-lg">{matchup.team1.flag}</span>
                        <span>{matchup.team1.name}</span>
                        {currentTeamNames.has(matchup.team1.name) && (
                          <span className="text-xs text-muted-foreground">
                            ({matchup.team1.points} pts)
                          </span>
                        )}
                      </div>
                    )}
                    <span className="text-muted-foreground">vs</span>
                    {matchup.team2 && (
                      <div
                        className={`flex items-center gap-1 ${
                          !currentTeamNames.has(matchup.team2.name)
                            ? "text-muted-foreground line-through opacity-60"
                            : ""
                        }`}
                      >
                        <span className="text-lg">{matchup.team2.flag}</span>
                        <span>{matchup.team2.name}</span>
                        {currentTeamNames.has(matchup.team2.name) && (
                          <span className="text-xs text-muted-foreground">
                            ({matchup.team2.points} pts)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Quarterfinals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quarterfinals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const currentChoices = getRoundChoices("Quarterfinals");
                const previousChoices =
                  getPreviousRoundChoices("Quarterfinals");
                const currentTeamNames = new Set(
                  currentChoices.map((c) => c.title)
                );

                if (previousChoices.length === 0) {
                  return (
                    <span className="text-sm text-muted-foreground">
                      No picks yet
                    </span>
                  );
                }

                // Create teams from previous choices
                const teams: Team[] = previousChoices.map((choice) => ({
                  id: choice.id,
                  name: choice.title,
                  flag: choice.flag || "",
                  points: choice.secondaryPoints,
                }));

                const matchups = createMatchupsFromTeams(teams);

                return matchups.map((matchup) => (
                  <div
                    key={matchup.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    {matchup.team1 && (
                      <div
                        className={`flex items-center gap-1 ${
                          !currentTeamNames.has(matchup.team1.name)
                            ? "text-muted-foreground line-through opacity-60"
                            : ""
                        }`}
                      >
                        <span className="text-lg">{matchup.team1.flag}</span>
                        <span>{matchup.team1.name}</span>
                        {currentTeamNames.has(matchup.team1.name) && (
                          <span className="text-xs text-muted-foreground">
                            ({matchup.team1.points} pts)
                          </span>
                        )}
                      </div>
                    )}
                    <span className="text-muted-foreground">vs</span>
                    {matchup.team2 && (
                      <div
                        className={`flex items-center gap-1 ${
                          !currentTeamNames.has(matchup.team2.name)
                            ? "text-muted-foreground line-through opacity-60"
                            : ""
                        }`}
                      >
                        <span className="text-lg">{matchup.team2.flag}</span>
                        <span>{matchup.team2.name}</span>
                        {currentTeamNames.has(matchup.team2.name) && (
                          <span className="text-xs text-muted-foreground">
                            ({matchup.team2.points} pts)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Round of 16 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Round of 16</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const currentChoices = getRoundChoices("Round of 16");
                const previousChoices = getPreviousRoundChoices("Round of 16");
                const currentTeamNames = new Set(
                  currentChoices.map((c) => c.title)
                );

                if (previousChoices.length === 0) {
                  return (
                    <span className="text-sm text-muted-foreground">
                      No picks yet
                    </span>
                  );
                }

                // Create teams from previous choices
                const teams: Team[] = previousChoices.map((choice) => ({
                  id: choice.id,
                  name: choice.title,
                  flag: choice.flag || "",
                  points: choice.secondaryPoints,
                }));

                const matchups = createMatchupsFromTeams(teams);

                return matchups.map((matchup) => (
                  <div
                    key={matchup.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    {matchup.team1 && (
                      <div
                        className={`flex items-center gap-1 ${
                          !currentTeamNames.has(matchup.team1.name)
                            ? "text-muted-foreground line-through opacity-60"
                            : ""
                        }`}
                      >
                        <span className="text-lg">{matchup.team1.flag}</span>
                        <span>{matchup.team1.name}</span>
                        {currentTeamNames.has(matchup.team1.name) && (
                          <span className="text-xs text-muted-foreground">
                            ({matchup.team1.points} pts)
                          </span>
                        )}
                      </div>
                    )}
                    <span className="text-muted-foreground">vs</span>
                    {matchup.team2 && (
                      <div
                        className={`flex items-center gap-1 ${
                          !currentTeamNames.has(matchup.team2.name)
                            ? "text-muted-foreground line-through opacity-60"
                            : ""
                        }`}
                      >
                        <span className="text-lg">{matchup.team2.flag}</span>
                        <span>{matchup.team2.name}</span>
                        {currentTeamNames.has(matchup.team2.name) && (
                          <span className="text-xs text-muted-foreground">
                            ({matchup.team2.points} pts)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Round of 32 - More columns since it has many matchups */}
        <div className="col-span-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Round of 32</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(() => {
                  const currentChoices = getRoundChoices("Round of 32");
                  const previousChoices =
                    getPreviousRoundChoices("Round of 32");
                  const currentTeamNames = new Set(
                    currentChoices.map((c) => c.title)
                  );

                  if (previousChoices.length === 0) {
                    return (
                      <span className="text-sm text-muted-foreground">
                        No picks yet
                      </span>
                    );
                  }

                  // Create teams from previous choices
                  const teams: Team[] = previousChoices.map((choice) => ({
                    id: choice.id,
                    name: choice.title,
                    flag: choice.flag || "",
                    points: choice.secondaryPoints,
                  }));

                  const matchups = createMatchupsFromTeams(teams);

                  return matchups.map((matchup) => (
                    <div
                      key={matchup.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {matchup.team1 && (
                        <div
                          className={`flex items-center gap-1 ${
                            !currentTeamNames.has(matchup.team1.name)
                              ? "text-muted-foreground line-through opacity-60"
                              : ""
                          }`}
                        >
                          <span className="text-lg">{matchup.team1.flag}</span>
                          <span>{matchup.team1.name}</span>
                          {currentTeamNames.has(matchup.team1.name) && (
                            <span className="text-xs text-muted-foreground">
                              ({matchup.team1.points} pts)
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-muted-foreground">vs</span>
                      {matchup.team2 && (
                        <div
                          className={`flex items-center gap-1 ${
                            !currentTeamNames.has(matchup.team2.name)
                              ? "text-muted-foreground line-through opacity-60"
                              : ""
                          }`}
                        >
                          <span className="text-lg">{matchup.team2.flag}</span>
                          <span>{matchup.team2.name}</span>
                          {currentTeamNames.has(matchup.team2.name) && (
                            <span className="text-xs text-muted-foreground">
                              ({matchup.team2.points} pts)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Player Awards Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Player Awards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              if (!betsData) return null;
              const playerAwardTitles = [
                "Golden Boot (Top Scorer)",
                "Golden Ball (Best Player)",
                "Golden Glove (Best Goalkeeper)",
                "FIFA Young Player Award",
              ];
              const awardDisplayNames: Record<string, string> = {
                "Golden Boot (Top Scorer)": "Golden Boot",
                "Golden Ball (Best Player)": "Golden Ball",
                "Golden Glove (Best Goalkeeper)": "Golden Glove",
                "FIFA Young Player Award": "Young Player Award",
              };
              return playerAwardTitles.map((title) => {
                const bet = betsData.bets.find(
                  (b) => b.choice.line.title === title
                );
                if (!bet) return null;
                return (
                  <div key={title}>
                    <h4 className="font-semibold text-sm mb-2">
                      {awardDisplayNames[title]}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{bet.choice.flag}</span>
                      <span>{bet.choice.title}</span>
                      <span className="text-xs text-muted-foreground">
                        ({bet.choice.primaryPoints} pts)
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Group Stage Summary - Compact */}
      <Card>
        <CardHeader>
          <CardTitle>Group Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(GROUPS).map(([groupLetter, countries]) => {
              const { winner, runnerUp, thirdPlace } =
                getAdvancingTeams(groupLetter);

              // Determine standings for each country
              const getStanding = (countryName: string): number => {
                if (countryName === winner) return 1;
                if (countryName === runnerUp) return 2;
                if (thirdPlace.includes(countryName)) return 3;
                return 4;
              };

              // Get points for each country
              const getPoints = (
                countryName: string
              ): {
                primary: number | null;
                secondary: number | null;
              } => {
                const country = countries.find((c) => c.name === countryName);
                if (countryName === winner) {
                  return {
                    primary: country?.winGroupPoints ?? null,
                    secondary: country?.qualifyPoints ?? null,
                  };
                }
                if (
                  countryName === runnerUp ||
                  thirdPlace.includes(countryName)
                ) {
                  return {
                    primary: country?.qualifyPoints ?? null,
                    secondary: null,
                  };
                }
                return { primary: null, secondary: null };
              };

              // Sort countries by standing
              const sortedCountries = [...countries].sort((a, b) => {
                return getStanding(a.name) - getStanding(b.name);
              });

              return (
                <div key={groupLetter} className="border rounded p-2">
                  <h4 className="font-semibold mb-1.5 text-xs">
                    Group {groupLetter}
                  </h4>
                  <div className="space-y-0.5">
                    {sortedCountries.map((country) => {
                      const advances = isAdvancing(groupLetter, country.name);
                      const standing = getStanding(country.name);
                      const points = getPoints(country.name);

                      return (
                        <div
                          key={country.name}
                          className={`flex items-center gap-1 text-xs ${
                            advances
                              ? "font-semibold"
                              : "text-muted-foreground line-through opacity-60"
                          }`}
                        >
                          <span className="text-xs font-bold w-3">
                            {standing}.
                          </span>
                          <span className="text-sm">{country.flag}</span>
                          <span className="truncate flex-1">
                            {country.name}
                          </span>
                          {points.primary !== null && (
                            <span className="text-xs text-muted-foreground">
                              {points.secondary !== null
                                ? `${points.primary} / ${points.secondary}`
                                : points.primary}{" "}
                              pts
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
