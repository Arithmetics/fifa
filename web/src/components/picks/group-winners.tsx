import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  GROUPS,
  GROUP_WINNERS_STORAGE_KEY,
  type GroupWinnersState,
} from "@/lib/picks-data";

export function GroupWinnersComponent() {
  const [selectedWinners, setSelectedWinners] = useState<GroupWinnersState>(
    () => {
      const stored = localStorage.getItem(GROUP_WINNERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    }
  );

  const handleGroupChange = (groupLetter: string, countryName: string) => {
    const newWinners = {
      ...selectedWinners,
      [groupLetter]: countryName,
    };
    setSelectedWinners(newWinners);
    localStorage.setItem(GROUP_WINNERS_STORAGE_KEY, JSON.stringify(newWinners));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(GROUPS).map(([groupLetter, countries]) => (
        <Card key={groupLetter}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Group {groupLetter}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedWinners[groupLetter] || ""}
              onValueChange={(value) => handleGroupChange(groupLetter, value)}
            >
              <div className="space-y-2">
                {countries.map((country) => (
                  <div
                    key={country.name}
                    className="flex items-center space-x-2 space-y-0"
                  >
                    <RadioGroupItem
                      value={country.name}
                      id={`${groupLetter}-${country.name}`}
                    />
                    <Label
                      htmlFor={`${groupLetter}-${country.name}`}
                      className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="font-medium">{country.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {country.points}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
