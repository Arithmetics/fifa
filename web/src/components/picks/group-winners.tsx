import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  GROUP_WINNERS_STORAGE_KEY,
  type GroupWinnersState,
} from "@/lib/picks-data";
import { useLinesByCollection, type Line } from "@/lib/lines";

export function GroupWinnersComponent() {
  const { data: lines, isLoading } = useLinesByCollection("group-winner");
  const [selectedWinners, setSelectedWinners] = useState<GroupWinnersState>(
    () => {
      const stored = localStorage.getItem(GROUP_WINNERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    }
  );

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

  const handleGroupChange = (groupLetter: string, countryName: string) => {
    const newWinners = {
      ...selectedWinners,
      [groupLetter]: countryName,
    };
    setSelectedWinners(newWinners);
    localStorage.setItem(GROUP_WINNERS_STORAGE_KEY, JSON.stringify(newWinners));
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
      {sortedGroups.map(([groupLetter, line]) => (
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
                value={selectedWinners[groupLetter] || ""}
                onValueChange={(value) => handleGroupChange(groupLetter, value)}
              >
                <div className="space-y-2">
                  {line.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className="flex items-center space-x-2 space-y-0"
                    >
                      <RadioGroupItem
                        value={choice.title}
                        id={`${groupLetter}-${choice.id}`}
                      />
                      <Label
                        htmlFor={`${groupLetter}-${choice.id}`}
                        className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                      >
                        <span className="text-xl">{choice.flag}</span>
                        <span className="font-medium">{choice.title}</span>
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
      ))}
    </div>
  );
}
