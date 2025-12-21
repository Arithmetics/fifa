import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useState, useEffect, useMemo } from "react";
import { useLineByStepSlug } from "@/lib/lines";

const CHAMPIONSHIP_STORAGE_KEY = "fifa_championship_winner";

export const Route = createFileRoute("/picks/championship")({
  component: ChampionshipPage,
});

function ChampionshipPage() {
  const { data: line, isLoading, error } = useLineByStepSlug("championship");
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

  // Convert choices to teams and create single matchup for championship
  const matchups: Matchup[] = useMemo(() => {
    if (!line?.choices || line.choices.length < 2) return [];

    const teams: Team[] = line.choices.map((choice) => ({
      id: choice.id,
      name: choice.title,
      flag: choice.flag || "",
      points: choice.primaryPoints, // Championship uses primaryPoints
    }));

    return [
      {
        id: "championship",
        team1: teams[0] || null,
        team2: teams[1] || null,
      },
    ];
  }, [line]);

  const handleTeamSelect = (team: Team) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(team.id)) {
      newSelected.delete(team.id);
    } else {
      const maxSelections = line?.choiceLimit || 1;
      if (newSelected.size < maxSelections) {
        newSelected.add(team.id);
      }
    }
    setSelectedTeams(newSelected);
    localStorage.setItem(
      CHAMPIONSHIP_STORAGE_KEY,
      JSON.stringify(Array.from(newSelected))
    );
  };

  if (isLoading) {
    return (
      <PicksLayout slug="championship">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading teams...</div>
        </div>
      </PicksLayout>
    );
  }

  if (error || !line) {
    return (
      <PicksLayout slug="championship">
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">
            {error ? "Error loading teams" : "No teams available"}
          </div>
        </div>
      </PicksLayout>
    );
  }

  return (
    <PicksLayout slug="championship">
      <BracketView
        matchups={matchups}
        onTeamSelect={handleTeamSelect}
        selectedTeams={selectedTeams}
        maxSelections={line.choiceLimit}
      />
    </PicksLayout>
  );
}
