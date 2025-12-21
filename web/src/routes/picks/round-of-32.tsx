import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useState, useEffect, useMemo } from "react";
import { useLineByStepSlug } from "@/lib/lines";

const ROUND_OF_32_STORAGE_KEY = "fifa_round_of_32_winners";

export const Route = createFileRoute("/picks/round-of-32")({
  component: RoundOf32Page,
});

function RoundOf32Page() {
  const { data: line, isLoading, error } = useLineByStepSlug("round-of-32");
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

  // Convert choices to teams and create matchups
  const matchups: Matchup[] = useMemo(() => {
    if (!line?.choices) return [];

    const teams: Team[] = line.choices.map((choice) => ({
      id: choice.id,
      name: choice.title,
      flag: choice.flag || "",
      points: choice.secondaryPoints,
    }));

    // Create matchups: pair teams 1-16 with teams 17-32
    const matchupList: Matchup[] = [];
    const halfLength = Math.floor(teams.length / 2);
    for (let i = 0; i < halfLength; i++) {
      matchupList.push({
        id: `match-${i + 1}`,
        team1: teams[i] || null,
        team2: teams[i + halfLength] || null,
      });
    }
    return matchupList;
  }, [line]);

  const handleTeamSelect = (team: Team) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(team.id)) {
      // Deselect if already selected
      newSelected.delete(team.id);
    } else {
      // Only allow selection if under max
      const maxSelections = line?.choiceLimit || 16;
      if (newSelected.size < maxSelections) {
        newSelected.add(team.id);
      }
    }
    setSelectedTeams(newSelected);
    localStorage.setItem(
      ROUND_OF_32_STORAGE_KEY,
      JSON.stringify(Array.from(newSelected))
    );
  };

  if (isLoading) {
    return (
      <PicksLayout slug="round-of-32">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading teams...</div>
        </div>
      </PicksLayout>
    );
  }

  if (error || !line) {
    return (
      <PicksLayout slug="round-of-32">
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">
            {error ? "Error loading teams" : "No teams available"}
          </div>
        </div>
      </PicksLayout>
    );
  }

  return (
    <PicksLayout slug="round-of-32">
      <BracketView
        matchups={matchups}
        onTeamSelect={handleTeamSelect}
        selectedTeams={selectedTeams}
        maxSelections={line.choiceLimit}
      />
    </PicksLayout>
  );
}
