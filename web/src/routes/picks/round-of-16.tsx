import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useState, useEffect } from "react";

// Fake data for 16 teams that advanced from round of 32
const FAKE_ROUND_OF_16_TEAMS: Team[] = [
  { id: "r16-1", name: "Brazil", flag: "🇧🇷", points: 20 },
  { id: "r16-2", name: "Argentina", flag: "🇦🇷", points: 19 },
  { id: "r16-3", name: "France", flag: "🇫🇷", points: 18 },
  { id: "r16-4", name: "Spain", flag: "🇪🇸", points: 17 },
  { id: "r16-5", name: "Germany", flag: "🇩🇪", points: 16 },
  { id: "r16-6", name: "Italy", flag: "🇮🇹", points: 15 },
  { id: "r16-7", name: "Portugal", flag: "🇵🇹", points: 14 },
  { id: "r16-8", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 13 },
  { id: "r16-9", name: "Netherlands", flag: "🇳🇱", points: 12 },
  { id: "r16-10", name: "Belgium", flag: "🇧🇪", points: 11 },
  { id: "r16-11", name: "Croatia", flag: "🇭🇷", points: 10 },
  { id: "r16-12", name: "Uruguay", flag: "🇺🇾", points: 9 },
  { id: "r16-13", name: "Mexico", flag: "🇲🇽", points: 8 },
  { id: "r16-14", name: "Japan", flag: "🇯🇵", points: 7 },
  { id: "r16-15", name: "USA", flag: "🇺🇸", points: 6 },
  { id: "r16-16", name: "Colombia", flag: "🇨🇴", points: 5 },
];

const ROUND_OF_16_STORAGE_KEY = "fifa_round_of_16_winners";

export const Route = createFileRoute("/picks/round-of-16")({
  component: RoundOf16Page,
});

function RoundOf16Page() {
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  // Load saved selections from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(ROUND_OF_16_STORAGE_KEY);
    if (stored) {
      try {
        const teamIds = JSON.parse(stored);
        setSelectedTeams(new Set(Array.isArray(teamIds) ? teamIds : []));
      } catch (e) {
        console.error("Failed to parse stored round of 16 winners", e);
      }
    }
  }, []);

  // Create matchups: pair teams 1-8 with teams 9-16
  const matchups: Matchup[] = [];
  for (let i = 0; i < 8; i++) {
    matchups.push({
      id: `match-${i + 1}`,
      team1: FAKE_ROUND_OF_16_TEAMS[i],
      team2: FAKE_ROUND_OF_16_TEAMS[i + 8],
    });
  }

  const handleTeamSelect = (team: Team) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(team.id)) {
      // Deselect if already selected
      newSelected.delete(team.id);
    } else {
      // Only allow selection if under max (8)
      if (newSelected.size < 8) {
        newSelected.add(team.id);
      }
    }
    setSelectedTeams(newSelected);
    localStorage.setItem(
      ROUND_OF_16_STORAGE_KEY,
      JSON.stringify(Array.from(newSelected))
    );
  };

  return (
    <PicksLayout slug="round-of-16">
      <BracketView
        matchups={matchups}
        onTeamSelect={handleTeamSelect}
        selectedTeams={selectedTeams}
        maxSelections={8}
      />
    </PicksLayout>
  );
}
