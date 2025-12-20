import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useState, useEffect } from "react";

// Fake data for 2 teams that advanced from semifinals
const FAKE_CHAMPIONSHIP_TEAMS: Team[] = [
  { id: "champ-1", name: "Brazil", flag: "🇧🇷", points: 50 },
  { id: "champ-2", name: "Argentina", flag: "🇦🇷", points: 45 },
];

const CHAMPIONSHIP_STORAGE_KEY = "fifa_championship_winner";

export const Route = createFileRoute("/picks/championship")({
  component: ChampionshipPage,
});

function ChampionshipPage() {
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  // Load saved selections from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(CHAMPIONSHIP_STORAGE_KEY);
    if (stored) {
      try {
        const teamIds = JSON.parse(stored);
        setSelectedTeams(new Set(Array.isArray(teamIds) ? teamIds : []));
      } catch (e) {
        console.error("Failed to parse stored championship winner", e);
      }
    }
  }, []);

  // Create single matchup for championship
  const matchups: Matchup[] = [
    {
      id: "championship",
      team1: FAKE_CHAMPIONSHIP_TEAMS[0],
      team2: FAKE_CHAMPIONSHIP_TEAMS[1],
    },
  ];

  const handleTeamSelect = (team: Team) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(team.id)) {
      // Deselect if already selected
      newSelected.delete(team.id);
    } else {
      // Only allow selection if under max (1)
      if (newSelected.size < 1) {
        newSelected.add(team.id);
      }
    }
    setSelectedTeams(newSelected);
    localStorage.setItem(
      CHAMPIONSHIP_STORAGE_KEY,
      JSON.stringify(Array.from(newSelected))
    );
  };

  return (
    <PicksLayout slug="championship">
      <BracketView
        matchups={matchups}
        onTeamSelect={handleTeamSelect}
        selectedTeams={selectedTeams}
        maxSelections={1}
      />
    </PicksLayout>
  );
}
