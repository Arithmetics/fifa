import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useState, useEffect, useMemo } from "react";
import { useLineByStepSlug } from "@/lib/lines";

const SEMIFINALS_STORAGE_KEY = "fifa_semifinals_winners";

export const Route = createFileRoute("/picks/semifinals")({
  component: SemifinalsPage,
});

function SemifinalsPage() {
  const { data: line, isLoading, error } = useLineByStepSlug("semifinals");
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

  // Convert choices to teams and create matchups
  const matchups: Matchup[] = useMemo(() => {
    if (!line?.choices) return [];

    const teams: Team[] = line.choices.map((choice) => ({
      id: choice.id,
      name: choice.title,
      flag: choice.flag || "",
      points: choice.secondaryPoints,
    }));

    // Create matchups: pair teams 1-2 with teams 3-4
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
      newSelected.delete(team.id);
    } else {
      const maxSelections = line?.choiceLimit || 2;
      if (newSelected.size < maxSelections) {
        newSelected.add(team.id);
      }
    }
    setSelectedTeams(newSelected);
    localStorage.setItem(
      SEMIFINALS_STORAGE_KEY,
      JSON.stringify(Array.from(newSelected))
    );
  };

  if (isLoading) {
    return (
      <PicksLayout slug="semifinals">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading teams...</div>
        </div>
      </PicksLayout>
    );
  }

  if (error || !line) {
    return (
      <PicksLayout slug="semifinals">
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">
            {error ? "Error loading teams" : "No teams available"}
          </div>
        </div>
      </PicksLayout>
    );
  }

  return (
    <PicksLayout slug="semifinals">
      <BracketView
        matchups={matchups}
        onTeamSelect={handleTeamSelect}
        selectedTeams={selectedTeams}
        maxSelections={line.choiceLimit}
      />
    </PicksLayout>
  );
}
