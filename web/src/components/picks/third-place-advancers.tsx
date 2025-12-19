import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  GROUPS,
  THIRD_PLACE_STORAGE_KEY,
  GROUP_WINNERS_STORAGE_KEY,
  GROUP_RUNNERS_UP_STORAGE_KEY,
  type ThirdPlaceAdvancersState,
  type GroupWinnersState,
  type GroupRunnersUpState,
} from "@/lib/picks-data";

export function ThirdPlaceAdvancersComponent() {
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
  const maxAdvancers = 8;

  // Check if we've reached the max
  const hasReachedMax = totalSelected >= maxAdvancers;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(GROUPS).map(([groupLetter, countries]) => {
        const groupWinner = groupWinners[groupLetter];
        const groupRunnerUp = groupRunnersUp[groupLetter];
        const groupAdvancer = selectedAdvancers[groupLetter]?.[0];

        // Include all countries, but mark winner and runner-up as disabled
        // Sort: winner first, runner-up second, selected advancer third, then others
        const sortedCountries = [...countries].sort((a, b) => {
          if (a.name === groupWinner) return -1;
          if (b.name === groupWinner) return 1;
          if (a.name === groupRunnerUp) return -1;
          if (b.name === groupRunnerUp) return 1;
          if (a.name === groupAdvancer) return -1;
          if (b.name === groupAdvancer) return 1;
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
                {sortedCountries.map((country) => {
                  const isSelected = groupAdvancer === country.name;
                  const isGroupWinner = country.name === groupWinner;
                  const isGroupRunnerUp = country.name === groupRunnerUp;
                  const isDisabled =
                    isGroupWinner ||
                    isGroupRunnerUp ||
                    (hasReachedMax && !isSelected);

                  return (
                    <div
                      key={country.name}
                      className={`flex items-center space-x-2 space-y-0 ${
                        isGroupWinner || isGroupRunnerUp ? "opacity-50" : ""
                      }`}
                    >
                      <Checkbox
                        id={`third-${groupLetter}-${country.name}`}
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={(checked) =>
                          handleAdvancerToggle(
                            groupLetter,
                            country.name,
                            checked === true
                          )
                        }
                      />
                      <Label
                        htmlFor={`third-${groupLetter}-${country.name}`}
                        className={`flex items-center gap-2 flex-1 text-sm ${
                          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <span className="text-xl">{country.flag}</span>
                        <span className="font-medium">{country.name}</span>
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
                            {country.qualifyPoints}
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
