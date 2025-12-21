import type { Team, Matchup } from "@/components/picks/bracket-view";

/**
 * Creates matchups from teams by seeding them alphabetically.
 * Teams are sorted by name, then paired: first vs last, second vs second-to-last, etc.
 */
export function createMatchupsFromTeams(teams: Team[]): Matchup[] {
  if (teams.length === 0) {
    return [];
  }

  // Sort teams alphabetically by name
  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));

  const matchups: Array<{
    id: string;
    team1: Team | null;
    team2: Team | null;
  }> = [];

  if (sortedTeams.length === 2) {
    // Championship or final matchup
    matchups.push({
      id: "championship",
      team1: sortedTeams[0] || null,
      team2: sortedTeams[1] || null,
    });
  } else {
    // For other rounds, pair first vs last, second vs second-to-last, etc.
    // This creates matchups where the top seed plays the bottom seed
    // For 32 teams, this creates 16 matchups: (0,31), (1,30), ..., (15,16)
    const numMatchups = Math.floor(sortedTeams.length / 2);
    for (let i = 0; i < numMatchups; i++) {
      const team1Index = i;
      const team2Index = sortedTeams.length - 1 - i;
      const team1 = sortedTeams[team1Index];
      const team2 = sortedTeams[team2Index];

      // Ensure we don't pair a team with itself (shouldn't happen with even numbers, but safety check)
      if (team1 && team2 && team1Index !== team2Index) {
        matchups.push({
          id: `match-${i + 1}`,
          team1,
          team2,
        });
      }
    }
  }

  return matchups;
}
