import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  GROUPS,
  THIRD_PLACE_STORAGE_KEY,
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

  // Sample data for group winners (in reality this will come from the database)
  const groupWinners: GroupWinnersState = {
    A: GROUPS.A[0].name,
    B: GROUPS.B[0].name,
    C: GROUPS.C[0].name,
    D: GROUPS.D[0].name,
    E: GROUPS.E[0].name,
    F: GROUPS.F[0].name,
    G: GROUPS.G[0].name,
    H: GROUPS.H[0].name,
    I: GROUPS.I[0].name,
    J: GROUPS.J[0].name,
    K: GROUPS.K[0].name,
    L: GROUPS.L[0].name,
  };

  // Sample data for group runners up (in reality this will come from the database)
  const groupRunnersUp: GroupRunnersUpState = {
    A: GROUPS.A[1]?.name || "",
    B: GROUPS.B[1]?.name || "",
    C: GROUPS.C[1]?.name || "",
    D: GROUPS.D[1]?.name || "",
    E: GROUPS.E[1]?.name || "",
    F: GROUPS.F[1]?.name || "",
    G: GROUPS.G[1]?.name || "",
    H: GROUPS.H[1]?.name || "",
    I: GROUPS.I[1]?.name || "",
    J: GROUPS.J[1]?.name || "",
    K: GROUPS.K[1]?.name || "",
    L: GROUPS.L[1]?.name || "",
  };

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

        // Filter out winner and runner up - they're not eligible
        const eligibleCountries = countries.filter(
          (country) =>
            country.name !== groupWinner && country.name !== groupRunnerUp
        );

        // Sort: selected advancer first (if any), then others
        const sortedCountries = [...eligibleCountries].sort((a, b) => {
          if (a.name === groupAdvancer) return -1;
          if (b.name === groupAdvancer) return 1;
          return 0;
        });

        return (
          <Card key={groupLetter}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Group {groupLetter}</CardTitle>
              <CardDescription className="text-xs">
                {groupWinner && (
                  <>
                    Winner:{" "}
                    {countries.find((c) => c.name === groupWinner)?.flag}{" "}
                    {groupWinner}
                    {groupRunnerUp && " • "}
                  </>
                )}
                {groupRunnerUp && (
                  <>
                    Runner Up:{" "}
                    {countries.find((c) => c.name === groupRunnerUp)?.flag}{" "}
                    {groupRunnerUp}
                  </>
                )}
              </CardDescription>
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
                  const isDisabled = hasReachedMax && !isSelected;

                  return (
                    <div
                      key={country.name}
                      className="flex items-center space-x-2 space-y-0"
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
