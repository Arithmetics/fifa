import {
  useState,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLinesByCollection, type Line } from "@/lib/lines";
import { useBetsByCollection, useSubmitBets } from "@/lib/bets";

export type ThirdPlaceAdvancersHandle = {
  submit: () => Promise<void>;
  isValid: () => boolean;
};

export const ThirdPlaceAdvancersComponent =
  forwardRef<ThirdPlaceAdvancersHandle>(
    function ThirdPlaceAdvancersComponent(_, ref) {
      const { data: lines, isLoading } =
        useLinesByCollection("group-third-place");
      const { data: bets } = useBetsByCollection("group-third-place");
      const { data: winnerBets } = useBetsByCollection("group-winner");
      const { data: runnerUpBets } = useBetsByCollection("group-runner-up");
      const submitBets = useSubmitBets();

      // Map from group letter to selected choice ID
      const [selectedChoices, setSelectedChoices] = useState<
        Map<string, string>
      >(new Map());

      // Error state
      const [error, setError] = useState<string | null>(null);

      // Get group winners from bets (map group letter to country name)
      const groupWinners = useMemo(() => {
        if (!winnerBets) return new Map<string, string>();

        const winners = new Map<string, string>();
        winnerBets.forEach((bet) => {
          const match = bet.choice.line.title.match(/Group ([A-L]) Winner/);
          if (match) {
            winners.set(match[1], bet.choice.title);
          }
        });
        return winners;
      }, [winnerBets]);

      // Get group runners up from bets (map group letter to country name)
      const groupRunnersUp = useMemo(() => {
        if (!runnerUpBets) return new Map<string, string>();

        const runnersUp = new Map<string, string>();
        runnerUpBets.forEach((bet) => {
          const match = bet.choice.line.title.match(/Group ([A-L]) Runner Up/);
          if (match) {
            runnersUp.set(match[1], bet.choice.title);
          }
        });
        return runnersUp;
      }, [runnerUpBets]);

      // Load existing bets into state
      useEffect(() => {
        if (!bets || !lines) return;

        const newSelected = new Map<string, string>();
        bets.forEach((bet) => {
          const choice = bet.choice;
          const match = choice.line.title.match(/Group ([A-L]) Third Place/);
          if (match) {
            newSelected.set(match[1], choice.id);
          }
        });
        setSelectedChoices(newSelected);
      }, [bets, lines]);

      // Create a map of group letter to line
      const linesByGroup = useMemo(() => {
        if (!lines) return new Map<string, Line>();
        const map = new Map<string, Line>();
        lines.forEach((line) => {
          // Extract group letter from "Group A Third Place" -> "A"
          const match = line.title.match(/Group ([A-L]) Third Place/);
          if (match) {
            map.set(match[1], line);
          }
        });
        return map;
      }, [lines]);

      // Get collection limit (total across all groups)
      const maxAdvancers = useMemo(() => {
        return lines?.[0]?.choiceCollectionLimit || 8;
      }, [lines]);

      // Validation: must have exactly maxAdvancers selections
      const isValid = useMemo(() => {
        return selectedChoices.size === maxAdvancers;
      }, [selectedChoices, maxAdvancers]);

      // Expose submit and isValid to parent
      useImperativeHandle(
        ref,
        () => ({
          submit: async () => {
            if (!isValid) {
              throw new Error(
                `Please select exactly ${maxAdvancers} third-place advancers`
              );
            }

            const choiceIds = Array.from(selectedChoices.values());
            setError(null);

            try {
              await submitBets.mutateAsync({ choiceIds });
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Failed to submit bets";
              setError(message);
              throw err;
            }
          },
          isValid: () => isValid,
        }),
        [isValid, selectedChoices, submitBets, maxAdvancers]
      );

      const handleAdvancerToggle = (
        groupLetter: string,
        choiceId: string,
        checked: boolean
      ) => {
        const newSelected = new Map(selectedChoices);

        if (checked) {
          // Only allow one per group - replace if one exists
          newSelected.set(groupLetter, choiceId);
        } else {
          // Remove from selection
          newSelected.delete(groupLetter);
        }

        setSelectedChoices(newSelected);
        setError(null);
      };

      // Calculate total selected
      const totalSelected = selectedChoices.size;

      // Check if we've reached the max
      const hasReachedMax = totalSelected >= maxAdvancers;

      if (isLoading) {
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading group data...</div>
          </div>
        );
      }

      // Sort groups alphabetically
      const sortedGroups = useMemo(() => {
        return Array.from(linesByGroup.entries()).sort(([a], [b]) =>
          a.localeCompare(b)
        );
      }, [linesByGroup]);

      return (
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
          {!isValid && (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-400">
              Please select exactly {maxAdvancers} third-place advancers (
              {totalSelected}/{maxAdvancers})
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedGroups.map(([groupLetter, line]) => {
              const groupWinner = groupWinners.get(groupLetter);
              const groupRunnerUp = groupRunnersUp.get(groupLetter);
              const selectedChoiceId = selectedChoices.get(groupLetter);

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
                <Card key={groupLetter}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Group {groupLetter}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-end pb-1">
                        <div className="text-xs text-muted-foreground text-right">
                          <div>points:</div>
                          <div>
                            <span className="text-yellow-500">qualify</span>
                          </div>
                        </div>
                      </div>
                      {sortedChoices.map((choice) => {
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
                              isGroupWinner || isGroupRunnerUp
                                ? "opacity-50"
                                : ""
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
                              <span className="font-medium">
                                {choice.title}
                              </span>
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
      );
    }
  );
