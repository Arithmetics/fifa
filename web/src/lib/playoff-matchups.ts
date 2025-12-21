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
    const halfLength = Math.floor(sortedTeams.length / 2);
    for (let i = 0; i < halfLength; i++) {
      matchups.push({
        id: `match-${i + 1}`,
        team1: sortedTeams[i] || null,
        team2: sortedTeams[sortedTeams.length - 1 - i] || null,
      });
    }
  }

  return matchups;
}
