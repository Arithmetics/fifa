import { useState } from "react";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useLineByStepSlug } from "@/lib/lines";
import { useBetsByLineId, useSubmitBets } from "@/lib/bets";
import { StepFooter } from "./step-footer";

type PlayoffRoundComponentProps = {
  stepSlug: string;
};

export function PlayoffRoundComponent({
  stepSlug,
}: PlayoffRoundComponentProps) {
  const { data: line } = useLineByStepSlug(stepSlug);
  const { data: bets } = useBetsByLineId(line?.id || "");
  const submitBets = useSubmitBets();

  // Initialize state from bets on first render
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(() => {
    if (!bets) return new Set();
    return new Set(bets.map((bet) => bet.choiceId));
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert choices to teams and create matchups
  let matchups: Matchup[] = [];
  if (line?.choices) {
    const usePrimaryPoints = stepSlug === "championship";
    const teams: Team[] = line.choices.map((choice) => ({
      id: choice.id,
      name: choice.title,
      flag: choice.flag || "",
      points: usePrimaryPoints ? choice.primaryPoints : choice.secondaryPoints,
    }));

    if (stepSlug === "championship" && teams.length >= 2) {
      matchups = [
        {
          id: "championship",
          team1: teams[0] || null,
          team2: teams[1] || null,
        },
      ];
    } else {
      const halfLength = Math.floor(teams.length / 2);
      for (let i = 0; i < halfLength; i++) {
        matchups.push({
          id: `match-${i + 1}`,
          team1: teams[i] || null,
          team2: teams[i + halfLength] || null,
        });
      }
    }
  }

  const progress = selectedTeams.size;
  const isValid = line ? progress === line.choiceLimit : false;

  const handleTeamSelect = (team: Team) => {
    setSelectedTeams((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(team.id)) {
        newSelected.delete(team.id);
      } else {
        const maxSelections = line?.choiceLimit || 0;
        if (newSelected.size < maxSelections) {
          newSelected.add(team.id);
        }
      }
      return newSelected;
    });
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setSubmitError(`Please select exactly ${line?.choiceLimit || 0} teams`);
      throw new Error(`Please select exactly ${line?.choiceLimit || 0} teams`);
    }

    const choiceIds = Array.from(selectedTeams);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await submitBets.mutateAsync({ choiceIds });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit bets";
      setSubmitError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!line) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 pb-32">
        {submitError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}
        {!isValid && (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-400">
            Please select exactly {line.choiceLimit} teams ({progress}/
            {line.choiceLimit})
          </div>
        )}
        <BracketView
          matchups={matchups}
          onTeamSelect={handleTeamSelect}
          selectedTeams={selectedTeams}
          maxSelections={line.choiceLimit}
        />
      </div>
      <StepFooter
        slug={stepSlug}
        progress={progress}
        progressTotal={line.choiceLimit}
        progressLabel="Teams Selected"
        isValid={isValid}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </>
  );
}
