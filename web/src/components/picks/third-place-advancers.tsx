import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLinesByCollection, type Choice } from "@/lib/lines";
import { useBetsByCollection, useSubmitBets } from "@/lib/bets";
import { StepFooter } from "./step-footer";

export function ThirdPlaceAdvancersComponent() {
  const { data: lines } = useLinesByCollection("group-third-place");
  const { data: bets } = useBetsByCollection("group-third-place");
  const { data: winnerBets } = useBetsByCollection("group-winner");
  const { data: runnerUpBets } = useBetsByCollection("group-runner-up");
  const submitBets = useSubmitBets();

  // Initialize state from bets on first render
  const [selectedChoices, setSelectedChoices] = useState<
    Record<string, string>
  >(() => {
    if (!bets) return {};
    const initial: Record<string, string> = {};
    bets.forEach((bet) => {
      const match = bet.choice.line.title.match(/Group ([A-L]) Third Place/);
      if (match) {
        initial[match[1]] = bet.choice.id;
      }
    });
    return initial;
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get group winners and runners up from bets
  const groupWinners: Record<string, string> = {};
  if (winnerBets) {
    winnerBets.forEach((bet) => {
      const match = bet.choice.line.title.match(/Group ([A-L]) Winner/);
      if (match) {
        groupWinners[match[1]] = bet.choice.title;
      }
    });
  }

  const groupRunnersUp: Record<string, string> = {};
  if (runnerUpBets) {
    runnerUpBets.forEach((bet) => {
      const match = bet.choice.line.title.match(/Group ([A-L]) Runner Up/);
      if (match) {
        groupRunnersUp[match[1]] = bet.choice.title;
      }
    });
  }

  // Create lines by group
  const linesByGroup: Record<string, NonNullable<typeof lines>[0]> = {};
  if (lines) {
    lines.forEach((line) => {
      const match = line.title.match(/Group ([A-L]) Third Place/);
      if (match) {
        linesByGroup[match[1]] = line;
      }
    });
  }

  const sortedGroups = Object.entries(linesByGroup).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const maxAdvancers = lines?.[0]?.choiceCollectionLimit || 8;
  const totalSelected = Object.keys(selectedChoices).length;
  const isValid = totalSelected === maxAdvancers;
  const hasReachedMax = totalSelected >= maxAdvancers;

  const handleAdvancerToggle = (
    groupLetter: string,
    choiceId: string,
    checked: boolean
  ) => {
    setSelectedChoices((prev) => {
      if (checked) {
        return { ...prev, [groupLetter]: choiceId };
      } else {
        const { [groupLetter]: _, ...rest } = prev;
        return rest;
      }
    });
    setError(null);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      const errorMessage = `Please select exactly ${maxAdvancers} third-place advancers`;
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
      throw new Error(errorMessage);
    }

    const choiceIds = Object.values(selectedChoices);
    setError(null);
    setIsSubmitting(true);

    try {
      await submitBets.mutateAsync({ choiceIds });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit bets";
      setError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lines) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 pb-32" id="third-place-advancers-content-top">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGroups.map(([groupLetter, line]) => {
            const groupWinner = groupWinners[groupLetter];
            const groupRunnerUp = groupRunnersUp[groupLetter];
            const selectedChoiceId = selectedChoices[groupLetter];

            // Sort: winner first, runner-up second, selected advancer third, then others
            const sortedChoices = [...line.choices].sort((a, b) => {
              if (a.title === groupWinner) return -1;
              if (b.title === groupWinner) return 1;
              if (a.title === groupRunnerUp) return -1;
              if (b.title === groupRunnerUp) return 1;
              if (a.id === selectedChoiceId) return -1;
              if (b.id === selectedChoiceId) return 1;
              return 0;
            });

            return (
              <Card
                key={groupLetter}
                style={{
                  backgroundColor: "rgb(22, 24, 28)",
                  borderTopColor: "rgb(68, 68, 71)",
                  borderTopWidth: "1px",
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Group {groupLetter}</CardTitle>
                    <div className="text-xs text-muted-foreground text-right">
                      <div>points:</div>
                      <div>
                        <span className="text-yellow-500">qualify</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sortedChoices.map((choice: Choice) => {
                      const isSelected = selectedChoiceId === choice.id;
                      const isGroupWinner = choice.title === groupWinner;
                      const isGroupRunnerUp = choice.title === groupRunnerUp;
                      const isDisabled =
                        isGroupWinner ||
                        isGroupRunnerUp ||
                        (hasReachedMax && !isSelected);

                      return (
                        <div
                          key={choice.id}
                          className={`flex items-center space-x-2 space-y-0 ${
                            isGroupWinner || isGroupRunnerUp ? "opacity-50" : ""
                          }`}
                        >
                          <Checkbox
                            id={`third-${groupLetter}-${choice.id}`}
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={(checked) =>
                              handleAdvancerToggle(
                                groupLetter,
                                choice.id,
                                checked === true
                              )
                            }
                          />
                          <Label
                            htmlFor={`third-${groupLetter}-${choice.id}`}
                            className={`flex items-center gap-2 flex-1 text-sm ${
                              isDisabled
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <span className="text-xl">{choice.flag}</span>
                            <span className="font-medium">{choice.title}</span>
                            {isGroupWinner && (
                              <span className="text-xs text-muted-foreground">
                                (Winner)
                              </span>
                            )}
                            {isGroupRunnerUp && (
                              <span className="text-xs text-muted-foreground">
                                (Runner Up)
                              </span>
                            )}
                            <span className="ml-auto text-xs text-muted-foreground">
                              <span className="text-yellow-500">
                                {choice.secondaryPoints}
                              </span>
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  {hasReachedMax && !selectedChoiceId && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Maximum advancers selected
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <StepFooter
        slug="third-place-advancers"
        progress={totalSelected}
        progressTotal={maxAdvancers}
        progressLabel="Third Place Advancers Selected"
        isValid={isValid}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </>
  );
}
