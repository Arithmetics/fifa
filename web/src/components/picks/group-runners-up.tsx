import {
  useState,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLinesByCollection, type Line } from "@/lib/lines";
import { useBetsByCollection, useSubmitBets } from "@/lib/bets";

export type GroupRunnersUpHandle = {
  submit: () => Promise<void>;
  isValid: () => boolean;
};

export const GroupRunnersUpComponent = forwardRef<GroupRunnersUpHandle>(
  function GroupRunnersUpComponent(_, ref) {
    const { data: lines, isLoading } = useLinesByCollection("group-runner-up");
    const { data: bets } = useBetsByCollection("group-runner-up");
    const { data: winnerBets } = useBetsByCollection("group-winner");
    const submitBets = useSubmitBets();

    // Map from group letter to selected choice ID
    const [selectedChoices, setSelectedChoices] = useState<Map<string, string>>(
      new Map()
    );

    // Error state
    const [error, setError] = useState<string | null>(null);

    // Get group winners from bets (map group letter to country name)
    const groupWinners = useMemo(() => {
      if (!winnerBets) return new Map<string, string>();

      const winners = new Map<string, string>();
      winnerBets.forEach((bet) => {
        const choice = bet.choice;
        const match = bet.choice.line.title.match(/Group ([A-L]) Winner/);
        if (match) {
          winners.set(match[1], choice.title);
        }
      });
      return winners;
    }, [winnerBets]);

    // Load existing bets into state
    useEffect(() => {
      if (!bets || !lines) return;

      const newSelected = new Map<string, string>();
      bets.forEach((bet) => {
        const choice = bet.choice;
        const match = choice.line.title.match(/Group ([A-L]) Runner Up/);
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
        // Extract group letter from "Group A Runner Up" -> "A"
        const match = line.title.match(/Group ([A-L]) Runner Up/);
        if (match) {
          map.set(match[1], line);
        }
      });
      return map;
    }, [lines]);

    // Validation: must have exactly 12 selections (one per group)
    const isValid = useMemo(() => {
      return selectedChoices.size === 12;
    }, [selectedChoices]);

    // Expose submit and isValid to parent
    useImperativeHandle(
      ref,
      () => ({
        submit: async () => {
          if (!isValid) {
            throw new Error("Please select a runner-up for all 12 groups");
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
      [isValid, selectedChoices, submitBets]
    );

    const handleRunnerUpChange = (groupLetter: string, choiceId: string) => {
      const newSelected = new Map(selectedChoices);
      newSelected.set(groupLetter, choiceId);
      setSelectedChoices(newSelected);
      setError(null);
    };

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
            Please select a runner-up for all 12 groups ({selectedChoices.size}
            /12)
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGroups.map(([groupLetter, line]) => {
            const groupWinner = groupWinners.get(groupLetter);
            const selectedChoiceId = selectedChoices.get(groupLetter);

            // Sort: group winner first, then others
            const sortedChoices = [...line.choices].sort((a, b) => {
              if (a.title === groupWinner) return -1;
              if (b.title === groupWinner) return 1;
              return 0;
            });

            return (
              <Card key={groupLetter}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Group {groupLetter}</CardTitle>
                  {groupWinner && (
                    <CardDescription className="text-xs">
                      Winner:{" "}
                      {line.choices.find((c) => c.title === groupWinner)?.flag}{" "}
                      {groupWinner}
                    </CardDescription>
                  )}
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
                    <RadioGroup
                      value={selectedChoiceId || ""}
                      onValueChange={(value) =>
                        handleRunnerUpChange(groupLetter, value)
                      }
                    >
                      <div className="space-y-2">
                        {sortedChoices.map((choice) => {
                          const isGroupWinner = choice.title === groupWinner;
                          const isDisabled = isGroupWinner;

                          return (
                            <div
                              key={choice.id}
                              className={`flex items-center space-x-2 space-y-0 ${
                                isGroupWinner ? "opacity-50" : ""
                              }`}
                            >
                              <RadioGroupItem
                                value={choice.id}
                                id={`runner-${groupLetter}-${choice.id}`}
                                disabled={isDisabled}
                              />
                              <Label
                                htmlFor={`runner-${groupLetter}-${choice.id}`}
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
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
);
