import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useState, useEffect } from "react";

// Fake data for 4 teams that advanced from quarterfinals
const FAKE_SEMIFINALS_TEAMS: Team[] = [
  { id: "sf-1", name: "Brazil", flag: "🇧🇷", points: 30 },
  { id: "sf-2", name: "Argentina", flag: "🇦🇷", points: 29 },
  { id: "sf-3", name: "France", flag: "🇫🇷", points: 28 },
  { id: "sf-4", name: "Spain", flag: "🇪🇸", points: 27 },
];

const SEMIFINALS_STORAGE_KEY = "fifa_semifinals_winners";

export const Route = createFileRoute("/picks/semifinals")({
  component: SemifinalsPage,
});

function SemifinalsPage() {
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  // Load saved selections from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SEMIFINALS_STORAGE_KEY);
    if (stored) {
      try {
        const teamIds = JSON.parse(stored);
        setSelectedTeams(new Set(Array.isArray(teamIds) ? teamIds : []));
      } catch (e) {
        console.error("Failed to parse stored semifinals winners", e);
      }
    }
  }, []);

  // Create matchups: pair teams 1-2 with teams 3-4
  const matchups: Matchup[] = [];
  for (let i = 0; i < 2; i++) {
    matchups.push({
      id: `match-${i + 1}`,
      team1: FAKE_SEMIFINALS_TEAMS[i],
      team2: FAKE_SEMIFINALS_TEAMS[i + 2],
    });
  }

  const handleTeamSelect = (team: Team) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(team.id)) {
      // Deselect if already selected
      newSelected.delete(team.id);
    } else {
      // Only allow selection if under max (2)
      if (newSelected.size < 2) {
        newSelected.add(team.id);
      }
    }
    setSelectedTeams(newSelected);
    localStorage.setItem(
      SEMIFINALS_STORAGE_KEY,
      JSON.stringify(Array.from(newSelected))
    );
  };

  return (
    <PicksLayout slug="semifinals">
      <BracketView
        matchups={matchups}
        onTeamSelect={handleTeamSelect}
        selectedTeams={selectedTeams}
        maxSelections={2}
      />
    </PicksLayout>
  );
}
