import { useState } from "react";
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
  GROUPS,
  GROUP_RUNNERS_UP_STORAGE_KEY,
  type GroupRunnersUpState,
  type GroupWinnersState,
} from "@/lib/picks-data";

export function GroupRunnersUpComponent() {
  const [selectedRunnersUp, setSelectedRunnersUp] =
    useState<GroupRunnersUpState>(() => {
      const stored = localStorage.getItem(GROUP_RUNNERS_UP_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    });

  // Sample data for group winners (in reality this will come from the database)
  // Using the first team from each group as sample winners
  const groupWinners: GroupWinnersState = {
    A: GROUPS.A[0].name, // Brazil
    B: GROUPS.B[0].name, // Germany
    C: GROUPS.C[0].name, // Netherlands
    D: GROUPS.D[0].name, // Mexico
    E: GROUPS.E[0].name, // Senegal
    F: GROUPS.F[0].name, // Colombia
    G: GROUPS.G[0].name, // Denmark
    H: GROUPS.H[0].name, // Poland
    I: GROUPS.I[0].name, // Australia
    J: GROUPS.J[0].name, // Nigeria
    K: GROUPS.K[0].name, // Algeria
    L: GROUPS.L[0].name, // Czech Republic
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(GROUPS).map(([groupLetter, countries]) => {
        const groupWinner = groupWinners[groupLetter];

        // Sort: group winner first, then others
        const sortedCountries = [...countries].sort((a, b) => {
          if (a.name === groupWinner) return -1;
          if (b.name === groupWinner) return 1;
          return 0;
        });

        return (
          <Card key={groupLetter}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Group {groupLetter}</CardTitle>
              {groupWinner && (
                <CardDescription className="text-xs">
                  Winner: {countries.find((c) => c.name === groupWinner)?.flag}{" "}
                  {groupWinner}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedRunnersUp[groupLetter] || ""}
                onValueChange={(value) =>
                  handleRunnerUpChange(groupLetter, value)
                }
              >
                <div className="space-y-2">
                  {sortedCountries.map((country) => {
                    const isGroupWinner = country.name === groupWinner;
                    const isDisabled = isGroupWinner;

                    return (
                      <div
                        key={country.name}
                        className={`flex items-center space-x-2 space-y-0 ${
                          isGroupWinner ? "opacity-50" : ""
                        }`}
                      >
                        <RadioGroupItem
                          value={country.name}
                          id={`runner-${groupLetter}-${country.name}`}
                          disabled={isDisabled}
                        />
                        <Label
                          htmlFor={`runner-${groupLetter}-${country.name}`}
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
                          <span className="ml-auto text-xs text-muted-foreground">
                            {country.points}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

