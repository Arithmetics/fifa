import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  THIRD_PLACE_STORAGE_KEY,
  GROUP_WINNERS_STORAGE_KEY,
  GROUP_RUNNERS_UP_STORAGE_KEY,
  type ThirdPlaceAdvancersState,
  type GroupWinnersState,
  type GroupRunnersUpState,
} from "@/lib/picks-data";
import { useLinesByCollection, type Line } from "@/lib/lines";

export function ThirdPlaceAdvancersComponent() {
  const { data: lines, isLoading } = useLinesByCollection("group-third-place");
  const [selectedAdvancers, setSelectedAdvancers] =
    useState<ThirdPlaceAdvancersState>(() => {
      const stored = localStorage.getItem(THIRD_PLACE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    });

  // Get group winners from localStorage
  const groupWinners: GroupWinnersState = (() => {
    const stored = localStorage.getItem(GROUP_WINNERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  })();

  // Get group runners up from localStorage
  const groupRunnersUp: GroupRunnersUpState = (() => {
    const stored = localStorage.getItem(GROUP_RUNNERS_UP_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  })();

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

  const handleAdvancerToggle = (
    groupLetter: string,
    countryName: string,
    checked: boolean
  ) => {
    setSelectedAdvancers((prev) => {
      const groupSelections = prev[groupLetter] || [];

      if (checked) {
        // Only allow one per group - replace if one exists
        const newGroupSelections = [countryName];
        const newState = {
          ...prev,
          [groupLetter]: newGroupSelections,
        };
        localStorage.setItem(THIRD_PLACE_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      } else {
        // Remove from selection
        const newGroupSelections = groupSelections.filter(
          (name) => name !== countryName
        );
        const newState = {
          ...prev,
          [groupLetter]: newGroupSelections,
        };
        localStorage.setItem(THIRD_PLACE_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      }
    });
  };

  // Calculate total selected
  const totalSelected = Object.values(selectedAdvancers).flat().length;

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedGroups.map(([groupLetter, line]) => {
        const groupWinner = groupWinners[groupLetter];
        const groupRunnerUp = groupRunnersUp[groupLetter];
        const groupAdvancer = selectedAdvancers[groupLetter]?.[0];

        // Sort: winner first, runner-up second, selected advancer third, then others
        const sortedChoices = [...line.choices].sort((a, b) => {
          if (a.title === groupWinner) return -1;
          if (b.title === groupWinner) return 1;
          if (a.title === groupRunnerUp) return -1;
          if (b.title === groupRunnerUp) return 1;
          if (a.title === groupAdvancer) return -1;
          if (b.title === groupAdvancer) return 1;
          return 0;
        });

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
                      <span className="text-yellow-500">qualify</span>
                    </div>
                  </div>
                </div>
                {sortedChoices.map((choice) => {
                  const isSelected = groupAdvancer === choice.title;
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
                            choice.title,
                            checked === true
                          )
                        }
                      />
                      <Label
                        htmlFor={`third-${groupLetter}-${choice.id}`}
                        className={`flex items-center gap-2 flex-1 text-sm ${
                          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
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
              {hasReachedMax && !groupAdvancer && (
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum advancers selected
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
