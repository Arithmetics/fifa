import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  GROUP_RUNNERS_UP_STORAGE_KEY,
  GROUP_WINNERS_STORAGE_KEY,
  type GroupRunnersUpState,
  type GroupWinnersState,
} from "@/lib/picks-data";
import { useLinesByCollection, type Line } from "@/lib/lines";

export function GroupRunnersUpComponent() {
  const { data: lines, isLoading } = useLinesByCollection("group-runner-up");
  const [selectedRunnersUp, setSelectedRunnersUp] =
    useState<GroupRunnersUpState>(() => {
      const stored = localStorage.getItem(GROUP_RUNNERS_UP_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    });

  // Get group winners from localStorage
  const groupWinners: GroupWinnersState = (() => {
    const stored = localStorage.getItem(GROUP_WINNERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  })();

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

  const handleRunnerUpChange = (groupLetter: string, countryName: string) => {
    const newState = {
      ...selectedRunnersUp,
      [groupLetter]: countryName,
    };
    setSelectedRunnersUp(newState);
    localStorage.setItem(
      GROUP_RUNNERS_UP_STORAGE_KEY,
      JSON.stringify(newState)
    );
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedGroups.map(([groupLetter, line]) => {
        const groupWinner = groupWinners[groupLetter];

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
                  value={selectedRunnersUp[groupLetter] || ""}
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
                            value={choice.title}
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
                            <span className="font-medium">{choice.title}</span>
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
  );
}
