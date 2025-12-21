import { useState } from "react";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useLineByStepSlug } from "@/lib/lines";
import { useBets, useBetsByLineId, useSubmitBets } from "@/lib/bets";
import { StepFooter } from "./step-footer";
import { getPreviousRoundSlugs } from "@/lib/picks-steps";
import { createMatchupsFromTeams } from "@/lib/playoff-matchups";
import type { Choice } from "@/lib/lines";

type PlayoffRoundComponentProps = {
  stepSlug: string;
};

const STEP_SLUG_TO_LINE_TITLE: Record<string, string> = {
  "group-winners": "Group Winners",
  "group-runners-up": "Group Runners Up",
  "third-place-advancers": "Third Place Advancers",
  "round-of-32": "Round of 32",
  "round-of-16": "Round of 16",
  quarterfinals: "Quarterfinals",
  semifinals: "Semifinals",
  championship: "Championship",
};

export function PlayoffRoundComponent({
  stepSlug,
}: PlayoffRoundComponentProps) {
  const { data: line } = useLineByStepSlug(stepSlug);
  const { data: bets } = useBetsByLineId(line?.id || "");
  const { data: allBetsData } = useBets();
  const submitBets = useSubmitBets();

  // Initialize state from bets on first render
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(() => {
    if (!bets) return new Set();
    return new Set(bets.map((bet) => bet.choiceId));
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get teams from previous round(s)
  const previousRoundSlugs = getPreviousRoundSlugs(stepSlug);
  const previousRoundTeamTitles = new Set<string>();

  if (allBetsData && previousRoundSlugs.length > 0) {
    previousRoundSlugs.forEach((prevSlug) => {
      // Group rounds use collections, playoff rounds use line titles
      const isGroupRound = [
        "group-winners",
        "group-runners-up",
        "third-place-advancers",
      ].includes(prevSlug);

      if (isGroupRound) {
        // Map group step slugs to collection types
        const collectionMap: Record<string, string> = {
          "group-winners": "group-winner",
          "group-runners-up": "group-runner-up",
          "third-place-advancers": "group-third-place",
        };

        const collectionType = collectionMap[prevSlug];
        if (!collectionType) return;

        // Get all bets for this previous round by collection type
        const prevRoundBets = allBetsData.bets.filter((bet) =>
          bet.choice.line.collection.includes(collectionType)
        );

        // Add team titles from these bets
        prevRoundBets.forEach((bet) => {
          previousRoundTeamTitles.add(bet.choice.title);
        });
      } else {
        // For playoff rounds, match by line title
        const prevLineTitle = STEP_SLUG_TO_LINE_TITLE[prevSlug];
        if (!prevLineTitle) return;

        // Get all bets for this previous round by line title
        const prevRoundBets = allBetsData.bets.filter(
          (bet) => bet.choice.line.title === prevLineTitle
        );

        // Add team titles from these bets
        prevRoundBets.forEach((bet) => {
          previousRoundTeamTitles.add(bet.choice.title);
        });
      }
    });
  }

  // Filter line choices to only include teams from previous round(s)
  const availableChoices: Choice[] = [];
  if (line?.choices) {
    line.choices.forEach((choice) => {
      if (previousRoundTeamTitles.has(choice.title)) {
        availableChoices.push(choice);
      }
    });
  }

  // Filter selectedTeams to only include choices that are currently available
  const availableChoiceIds = new Set(availableChoices.map((c) => c.id));
  const filteredSelectedTeams = new Set(
    Array.from(selectedTeams).filter((id) => availableChoiceIds.has(id))
  );

  // Convert filtered choices to teams and create matchups
  let matchups: Matchup[] = [];
  if (availableChoices.length > 0) {
    const usePrimaryPoints = stepSlug === "championship";
    const teams: Team[] = availableChoices.map((choice) => ({
      id: choice.id,
      name: choice.title,
      flag: choice.flag || "",
      points: usePrimaryPoints ? choice.primaryPoints : choice.secondaryPoints,
    }));

    matchups = createMatchupsFromTeams(teams);
  }

  const progress = filteredSelectedTeams.size;
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
    // Clear error when user makes a selection
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      const errorMessage = `Please select exactly ${line?.choiceLimit || 0} teams`;
      setSubmitError(errorMessage);
      // Scroll to top and let step-footer handle showing the error
      window.scrollTo({ top: 0, behavior: "smooth" });
      throw new Error(errorMessage);
    }

    const choiceIds = Array.from(filteredSelectedTeams);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await submitBets.mutateAsync({ choiceIds });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit bets";
      setSubmitError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!line) {
    return null;
  }

  // Show message if no teams available from previous round
  if (previousRoundSlugs.length > 0 && availableChoices.length === 0) {
    return (
      <>
        <div className="space-y-4 pb-32">
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-400">
            Please complete the previous round(s) first to see available teams
            here.
          </div>
        </div>
        <StepFooter
          slug={stepSlug}
          progress={0}
          progressTotal={line.choiceLimit}
          progressLabel="Teams Selected"
          isValid={false}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4 pb-32" id="playoff-content-top">
        {submitError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}
        <BracketView
          matchups={matchups}
          onTeamSelect={handleTeamSelect}
          selectedTeams={filteredSelectedTeams}
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
