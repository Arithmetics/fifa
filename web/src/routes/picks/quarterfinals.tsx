import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useState, useEffect } from "react";

// Fake data for 8 teams that advanced from round of 16
const FAKE_QUARTERFINALS_TEAMS: Team[] = [
  { id: "qf-1", name: "Brazil", flag: "🇧🇷", points: 25 },
  { id: "qf-2", name: "Argentina", flag: "🇦🇷", points: 24 },
  { id: "qf-3", name: "France", flag: "🇫🇷", points: 23 },
  { id: "qf-4", name: "Spain", flag: "🇪🇸", points: 22 },
  { id: "qf-5", name: "Germany", flag: "🇩🇪", points: 21 },
  { id: "qf-6", name: "Italy", flag: "🇮🇹", points: 20 },
  { id: "qf-7", name: "Portugal", flag: "🇵🇹", points: 19 },
  { id: "qf-8", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 18 },
];

const QUARTERFINALS_STORAGE_KEY = "fifa_quarterfinals_winners";

export const Route = createFileRoute("/picks/quarterfinals")({
  component: QuarterfinalsPage,
});

function QuarterfinalsPage() {
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  // Load saved selections from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(QUARTERFINALS_STORAGE_KEY);
    if (stored) {
      try {
        const teamIds = JSON.parse(stored);
        setSelectedTeams(new Set(Array.isArray(teamIds) ? teamIds : []));
      } catch (e) {
        console.error("Failed to parse stored quarterfinals winners", e);
      }
    }
  }, []);

  // Create matchups: pair teams 1-4 with teams 5-8
  const matchups: Matchup[] = [];
  for (let i = 0; i < 4; i++) {
    matchups.push({
      id: `match-${i + 1}`,
      team1: FAKE_QUARTERFINALS_TEAMS[i],
      team2: FAKE_QUARTERFINALS_TEAMS[i + 4],
    });
  }

  const handleTeamSelect = (team: Team) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(team.id)) {
      // Deselect if already selected
      newSelected.delete(team.id);
    } else {
      // Only allow selection if under max (4)
      if (newSelected.size < 4) {
        newSelected.add(team.id);
      }
    }
    setSelectedTeams(newSelected);
    localStorage.setItem(
      QUARTERFINALS_STORAGE_KEY,
      JSON.stringify(Array.from(newSelected))
    );
  };

  return (
    <PicksLayout slug="quarterfinals">
      <BracketView
        matchups={matchups}
        onTeamSelect={handleTeamSelect}
        selectedTeams={selectedTeams}
        maxSelections={4}
      />
    </PicksLayout>
  );
}
