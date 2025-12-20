import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useState, useEffect } from "react";

// Fake data for 32 teams that advanced from group stage
const FAKE_ROUND_OF_32_TEAMS: Team[] = [
  { id: "1", name: "Brazil", flag: "🇧🇷", points: 15 },
  { id: "2", name: "Argentina", flag: "🇦🇷", points: 14 },
  { id: "3", name: "France", flag: "🇫🇷", points: 13 },
  { id: "4", name: "Spain", flag: "🇪🇸", points: 12 },
  { id: "5", name: "Germany", flag: "🇩🇪", points: 11 },
  { id: "6", name: "Italy", flag: "🇮🇹", points: 10 },
  { id: "7", name: "Portugal", flag: "🇵🇹", points: 9 },
  { id: "8", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 8 },
  { id: "9", name: "Netherlands", flag: "🇳🇱", points: 7 },
  { id: "10", name: "Belgium", flag: "🇧🇪", points: 6 },
  { id: "11", name: "Croatia", flag: "🇭🇷", points: 5 },
  { id: "12", name: "Uruguay", flag: "🇺🇾", points: 4 },
  { id: "13", name: "Mexico", flag: "🇲🇽", points: 3 },
  { id: "14", name: "Japan", flag: "🇯🇵", points: 2 },
  { id: "15", name: "South Korea", flag: "🇰🇷", points: 1 },
  { id: "16", name: "Morocco", flag: "🇲🇦", points: 0 },
  { id: "17", name: "Senegal", flag: "🇸🇳", points: 0 },
  { id: "18", name: "USA", flag: "🇺🇸", points: 1 },
  { id: "19", name: "Colombia", flag: "🇨🇴", points: 2 },
  { id: "20", name: "Chile", flag: "🇨🇱", points: 3 },
  { id: "21", name: "Denmark", flag: "🇩🇰", points: 4 },
  { id: "22", name: "Switzerland", flag: "🇨🇭", points: 5 },
  { id: "23", name: "Sweden", flag: "🇸🇪", points: 6 },
  { id: "24", name: "Poland", flag: "🇵🇱", points: 7 },
  { id: "25", name: "Serbia", flag: "🇷🇸", points: 8 },
  { id: "26", name: "Ukraine", flag: "🇺🇦", points: 9 },
  { id: "27", name: "Czech Republic", flag: "🇨🇿", points: 10 },
  { id: "28", name: "Austria", flag: "🇦🇹", points: 11 },
  { id: "29", name: "Nigeria", flag: "🇳🇬", points: 12 },
  { id: "30", name: "Algeria", flag: "🇩🇿", points: 13 },
  { id: "31", name: "Egypt", flag: "🇪🇬", points: 14 },
  { id: "32", name: "Ghana", flag: "🇬🇭", points: 15 },
];

const ROUND_OF_32_STORAGE_KEY = "fifa_round_of_32_winners";

export const Route = createFileRoute("/picks/round-of-32")({
  component: RoundOf32Page,
});

function RoundOf32Page() {
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  // Load saved selections from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(ROUND_OF_32_STORAGE_KEY);
    if (stored) {
      try {
        const teamIds = JSON.parse(stored);
        setSelectedTeams(new Set(Array.isArray(teamIds) ? teamIds : []));
      } catch (e) {
        console.error("Failed to parse stored round of 32 winners", e);
      }
    }
  }, []);

  // Create matchups: pair teams 1-16 with teams 17-32
  const matchups: Matchup[] = [];
  for (let i = 0; i < 16; i++) {
    matchups.push({
      id: `match-${i + 1}`,
      team1: FAKE_ROUND_OF_32_TEAMS[i],
      team2: FAKE_ROUND_OF_32_TEAMS[i + 16],
    });
  }

  const handleTeamSelect = (team: Team) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(team.id)) {
      // Deselect if already selected
      newSelected.delete(team.id);
    } else {
      // Only allow selection if under max (16)
      if (newSelected.size < 16) {
        newSelected.add(team.id);
      }
    }
    setSelectedTeams(newSelected);
    localStorage.setItem(
      ROUND_OF_32_STORAGE_KEY,
      JSON.stringify(Array.from(newSelected))
    );
  };

  return (
    <PicksLayout slug="round-of-32">
      <BracketView
        matchups={matchups}
        onTeamSelect={handleTeamSelect}
        selectedTeams={selectedTeams}
        maxSelections={16}
      />
    </PicksLayout>
  );
}
