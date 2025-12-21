import {
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  BracketView,
  type Matchup,
  type Team,
} from "@/components/picks/bracket-view";
import { useLineByStepSlug } from "@/lib/lines";
import { useBetsByLineId, useSubmitBets } from "@/lib/bets";

export type PlayoffRoundHandle = {
  submit: () => Promise<void>;
  isValid: () => boolean;
};

type PlayoffRoundComponentProps = {
  stepSlug: string;
};

export const PlayoffRoundComponent = forwardRef<
  PlayoffRoundHandle,
  PlayoffRoundComponentProps
>(function PlayoffRoundComponent({ stepSlug }, ref) {
  const { data: line, isLoading, error } = useLineByStepSlug(stepSlug);
  const { data: bets } = useBetsByLineId(line?.id || "");
  const submitBets = useSubmitBets();

  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load existing bets into state
  useEffect(() => {
    if (!bets || !line) return;

    const betChoiceIds = new Set(bets.map((bet) => bet.choiceId));
    setSelectedTeams(betChoiceIds);
  }, [bets, line]);

  // Convert choices to teams and create matchups
  const matchups: Matchup[] = useMemo(() => {
    if (!line?.choices) return [];

    // Championship uses primaryPoints, others use secondaryPoints
    const usePrimaryPoints = stepSlug === "championship";
    const teams: Team[] = line.choices.map((choice) => ({
      id: choice.id,
      name: choice.title,
      flag: choice.flag || "",
      points: usePrimaryPoints ? choice.primaryPoints : choice.secondaryPoints,
    }));

    // Championship has a special matchup layout (just 2 teams)
    if (stepSlug === "championship" && teams.length >= 2) {
      return [
        {
          id: "championship",
          team1: teams[0] || null,
          team2: teams[1] || null,
        },
      ];
    }

    // Create matchups: pair teams 1-n/2 with teams (n/2+1)-n
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

  // Validation: must have exactly choiceLimit selections
  const isValid = useMemo(() => {
    if (!line) return false;
    return selectedTeams.size === line.choiceLimit;
  }, [selectedTeams, line]);

  // Expose submit and isValid to parent
  useImperativeHandle(
    ref,
    () => ({
      submit: async () => {
        if (!isValid) {
          throw new Error(
            `Please select exactly ${line?.choiceLimit || 0} teams`
          );
        }

        const choiceIds = Array.from(selectedTeams);
        setSubmitError(null);

        try {
          await submitBets.mutateAsync({ choiceIds });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to submit bets";
          setSubmitError(message);
          throw err;
        }
      },
      isValid: () => isValid,
    }),
    [isValid, selectedTeams, submitBets, line]
  );

  const handleTeamSelect = (team: Team) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(team.id)) {
      // Deselect if already selected
      newSelected.delete(team.id);
    } else {
      // Only allow selection if under max
      const maxSelections = line?.choiceLimit || 0;
      if (newSelected.size < maxSelections) {
        newSelected.add(team.id);
      }
    }
    setSelectedTeams(newSelected);
    setSubmitError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading teams...</div>
      </div>
    );
  }

  if (error || !line) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">
          {error ? "Error loading teams" : "No teams available"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submitError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {submitError}
        </div>
      )}
      {!isValid && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-400">
          Please select exactly {line.choiceLimit} teams ({selectedTeams.size}/
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
  );
});
