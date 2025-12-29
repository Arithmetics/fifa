import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLinesByCollection, type Choice } from "@/lib/lines";
import { useBetsByCollection, useSubmitBets } from "@/lib/bets";
import { StepFooter } from "./step-footer";

export function GroupRunnersUpComponent() {
  const { data: lines } = useLinesByCollection("group-runner-up");
  const { data: bets } = useBetsByCollection("group-runner-up");
  const { data: winnerBets } = useBetsByCollection("group-winner");
  const submitBets = useSubmitBets();

  // Initialize state from bets on first render
  const [selectedChoices, setSelectedChoices] = useState<
    Record<string, string>
  >(() => {
    if (!bets) return {};
    const initial: Record<string, string> = {};
    bets.forEach((bet) => {
      const match = bet.choice.line.title.match(/Group ([A-L]) Runner Up/);
      if (match) {
        initial[match[1]] = bet.choice.id;
      }
    });
    return initial;
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get group winners from bets
  const groupWinners: Record<string, string> = {};
  if (winnerBets) {
    winnerBets.forEach((bet) => {
      const match = bet.choice.line.title.match(/Group ([A-L]) Winner/);
      if (match) {
        groupWinners[match[1]] = bet.choice.title;
      }
    });
  }

  // Create lines by group
  const linesByGroup: Record<string, NonNullable<typeof lines>[0]> = {};
  if (lines) {
    lines.forEach((line) => {
      const match = line.title.match(/Group ([A-L]) Runner Up/);
      if (match) {
        linesByGroup[match[1]] = line;
      }
    });
  }

  const sortedGroups = Object.entries(linesByGroup).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const progress = Object.keys(selectedChoices).length;
  const isValid = progress === 12;

  const handleRunnerUpChange = (groupLetter: string, choiceId: string) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [groupLetter]: choiceId,
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      const errorMessage = "Please select a runner-up for all 12 groups";
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
      <div className="space-y-4 pb-32" id="group-runners-up-content-top">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGroups.map(([groupLetter, line]) => {
            const groupWinner = groupWinners[groupLetter];
            const selectedChoiceId = selectedChoices[groupLetter];

            // Sort: group winner first, then others
            const sortedChoices = [...line.choices].sort((a, b) => {
              if (a.title === groupWinner) return -1;
              if (b.title === groupWinner) return 1;
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
                    <RadioGroup
                      value={selectedChoiceId || ""}
                      onValueChange={(value) =>
                        handleRunnerUpChange(groupLetter, value)
                      }
                    >
                      <div className="space-y-2">
                        {sortedChoices.map((choice: Choice) => {
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
      <StepFooter
        slug="group-runners-up"
        progress={progress}
        progressTotal={12}
        progressLabel="Group Runners Up Selected"
        isValid={isValid}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </>
  );
}
