import {
  useState,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLinesByCollection, type Line } from "@/lib/lines";
import { useBetsByCollection, useSubmitBets } from "@/lib/bets";

export type GroupWinnersHandle = {
  submit: () => Promise<void>;
  isValid: () => boolean;
};

export const GroupWinnersComponent = forwardRef<GroupWinnersHandle>(
  function GroupWinnersComponent(_, ref) {
    const { data: lines, isLoading } = useLinesByCollection("group-winner");
    const { data: bets } = useBetsByCollection("group-winner");
    const submitBets = useSubmitBets();

    // Map from group letter to selected choice ID
    const [selectedChoices, setSelectedChoices] = useState<Map<string, string>>(
      new Map()
    );

    // Error state
    const [error, setError] = useState<string | null>(null);

    // Load existing bets into state
    useEffect(() => {
      if (!bets || !lines) return;

      const newSelected = new Map<string, string>();
      bets.forEach((bet) => {
        const choice = bet.choice;
        const line = lines.find((l) => l.id === choice.lineId);
        if (line) {
          const match = line.title.match(/Group ([A-L]) Winner/);
          if (match) {
            newSelected.set(match[1], choice.id);
          }
        }
      });
      setSelectedChoices(newSelected);
    }, [bets, lines]);

    // Create a map of group letter to line
    const linesByGroup = useMemo(() => {
      if (!lines) return new Map<string, Line>();
      const map = new Map<string, Line>();
      lines.forEach((line) => {
        // Extract group letter from "Group A Winner" -> "A"
        const match = line.title.match(/Group ([A-L]) Winner/);
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
            throw new Error("Please select a winner for all 12 groups");
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

    const handleGroupChange = (groupLetter: string, choiceId: string) => {
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
            Please select a winner for all 12 groups ({selectedChoices.size}/12)
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGroups.map(([groupLetter, line]) => {
            const selectedChoiceId = selectedChoices.get(groupLetter);

            return (
              <Card key={groupLetter}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Group {groupLetter}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-end pb-1">
                      <div className="text-xs text-muted-foreground text-right">
                        <div>points:</div>
                        <div>
                          <span className="text-purple-500">win group</span> /
                        </div>
                        <div>
                          <span className="text-yellow-500">qualify</span>
                        </div>
                      </div>
                    </div>
                    <RadioGroup
                      value={selectedChoiceId || ""}
                      onValueChange={(value) =>
                        handleGroupChange(groupLetter, value)
                      }
                    >
                      <div className="space-y-2">
                        {line.choices.map((choice) => (
                          <div
                            key={choice.id}
                            className="flex items-center space-x-2 space-y-0"
                          >
                            <RadioGroupItem
                              value={choice.id}
                              id={`${groupLetter}-${choice.id}`}
                            />
                            <Label
                              htmlFor={`${groupLetter}-${choice.id}`}
                              className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                            >
                              <span className="text-xl">{choice.flag}</span>
                              <span className="font-medium">
                                {choice.title}
                              </span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                <span className="text-purple-500">
                                  {choice.primaryPoints}
                                </span>
                                /
                                <span className="text-yellow-500">
                                  {choice.secondaryPoints}
                                </span>
                              </span>
                            </Label>
                          </div>
                        ))}
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
