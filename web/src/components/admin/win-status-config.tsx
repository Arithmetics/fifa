import { useState, useEffect, useMemo } from "react";
import { useUpdateChoiceWinStatus } from "@/lib/admin";
import { useLines, type Line } from "@/lib/lines";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BRACKET_ROUNDS = [
  "Round of 32",
  "Round of 16",
  "Quarterfinals",
  "Semifinals",
  "Championship",
];

const PLAYER_AWARDS = [
  "Golden Boot (Top Scorer)",
  "Golden Ball (Best Player)",
  "Golden Glove (Best Goalkeeper)",
  "FIFA Young Player Award",
];

const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export function WinStatusConfig() {
  const { data: linesData, isLoading } = useLines();
  const updateChoice = useUpdateChoiceWinStatus();

  const handleChoiceToggle = async (
    choiceId: string,
    currentPrimary: boolean,
    currentSecondary: boolean,
    type: "primary" | "secondary"
  ) => {
    const newPrimary = type === "primary" ? !currentPrimary : currentPrimary;
    const newSecondary = type === "secondary" ? !currentSecondary : currentSecondary;

    try {
      await updateChoice.mutateAsync({
        choiceId,
        isPrimaryWin: newPrimary,
        isSecondaryWin: newSecondary,
      });
    } catch (error) {
      console.error("Failed to update choice:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Win Status Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading options...</p>
        </CardContent>
      </Card>
    );
  }

  if (!linesData?.lines) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Win Status Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load options</p>
        </CardContent>
      </Card>
    );
  }

  const lines = linesData.lines;

  // Get group winner lines organized by group
  const groupWinnerLinesByGroup = new Map<string, Line>();
  lines
    .filter((line) => line.collection.includes("group-winner"))
    .forEach((line) => {
      const match = line.title.match(/Group ([A-L]) Winner/);
      if (match) {
        groupWinnerLinesByGroup.set(match[1], line);
      }
    });

  // Get runner-up lines organized by group
  const runnerUpLinesByGroup = new Map<string, Line>();
  lines
    .filter((line) => line.collection.includes("group-runner-up"))
    .forEach((line) => {
      const match = line.title.match(/Group ([A-L]) Runner Up/);
      if (match) {
        runnerUpLinesByGroup.set(match[1], line);
      }
    });

  // Get third-place lines organized by group
  const thirdPlaceLinesByGroup = new Map<string, Line>();
  lines
    .filter((line) => line.collection.includes("group-third-place"))
    .forEach((line) => {
      const match = line.title.match(/Group ([A-L]) Third Place/);
      if (match) {
        thirdPlaceLinesByGroup.set(match[1], line);
      }
    });

  // Get bracket lines
  const bracketLines = lines.filter((line) => BRACKET_ROUNDS.includes(line.title));

  // Get player award lines
  const playerAwardLines = lines.filter((line) =>
    PLAYER_AWARDS.includes(line.title)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Win Status Configuration</CardTitle>
        <CardDescription>
          Set which teams and players won to calculate points correctly. Each checkbox updates exactly one choice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Group Winners - Primary Win */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Group Winners - Primary Win (12)</Label>
            <p className="text-sm text-muted-foreground">
              Select teams that won their groups. Each checkbox updates one group winner choice.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GROUP_LETTERS.map((groupLetter) => {
              const line = groupWinnerLinesByGroup.get(groupLetter);
              if (!line) return null;

              return (
                <Card key={`primary-${groupLetter}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Group {groupLetter} Winner</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {line.choices
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((choice) => (
                        <div key={choice.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={choice.isPrimaryWin}
                            onCheckedChange={() =>
                              handleChoiceToggle(
                                choice.id,
                                choice.isPrimaryWin,
                                choice.isSecondaryWin,
                                "primary"
                              )
                            }
                            disabled={updateChoice.isPending}
                          />
                          <Label className="text-sm flex items-center gap-1.5 cursor-pointer">
                            {choice.flag && <span>{choice.flag}</span>}
                            <span>{choice.title}</span>
                          </Label>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Group Winners - Secondary Win */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Group Winners - Secondary Win</Label>
            <p className="text-sm text-muted-foreground">
              Select teams that qualified but didn't win their group. Each checkbox updates one group winner choice.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GROUP_LETTERS.map((groupLetter) => {
              const line = groupWinnerLinesByGroup.get(groupLetter);
              if (!line) return null;

              return (
                <Card key={`secondary-${groupLetter}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Group {groupLetter} Winner</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {line.choices
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((choice) => (
                        <div key={choice.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={choice.isSecondaryWin}
                            onCheckedChange={() =>
                              handleChoiceToggle(
                                choice.id,
                                choice.isPrimaryWin,
                                choice.isSecondaryWin,
                                "secondary"
                              )
                            }
                            disabled={updateChoice.isPending}
                          />
                          <Label className="text-sm flex items-center gap-1.5 cursor-pointer">
                            {choice.flag && <span>{choice.flag}</span>}
                            <span>{choice.title}</span>
                          </Label>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Remaining Qualifiers - Runner Up and Third Place */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Remaining Qualifiers - Primary Win (20)</Label>
            <p className="text-sm text-muted-foreground">
              Select teams that qualified as runners-up or third place. Each checkbox updates one choice.
            </p>
          </div>
          <div className="space-y-4">
            {/* Runner Up */}
            <div>
              <Label className="text-sm font-medium">Runners Up</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                {GROUP_LETTERS.map((groupLetter) => {
                  const line = runnerUpLinesByGroup.get(groupLetter);
                  if (!line) return null;

                  return (
                    <Card key={`runnerup-${groupLetter}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Group {groupLetter} Runner Up</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {line.choices
                          .sort((a, b) => a.title.localeCompare(b.title))
                          .map((choice) => (
                            <div key={choice.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={choice.isPrimaryWin}
                                onCheckedChange={() =>
                                  handleChoiceToggle(
                                    choice.id,
                                    choice.isPrimaryWin,
                                    choice.isSecondaryWin,
                                    "primary"
                                  )
                                }
                                disabled={updateChoice.isPending}
                              />
                              <Label className="text-sm flex items-center gap-1.5 cursor-pointer">
                                {choice.flag && <span>{choice.flag}</span>}
                                <span>{choice.title}</span>
                              </Label>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Third Place */}
            <div>
              <Label className="text-sm font-medium">Third Place</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                {GROUP_LETTERS.map((groupLetter) => {
                  const line = thirdPlaceLinesByGroup.get(groupLetter);
                  if (!line) return null;

                  return (
                    <Card key={`third-${groupLetter}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Group {groupLetter} Third Place</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {line.choices
                          .sort((a, b) => a.title.localeCompare(b.title))
                          .map((choice) => (
                            <div key={choice.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={choice.isPrimaryWin}
                                onCheckedChange={() =>
                                  handleChoiceToggle(
                                    choice.id,
                                    choice.isPrimaryWin,
                                    choice.isSecondaryWin,
                                    "primary"
                                  )
                                }
                                disabled={updateChoice.isPending}
                              />
                              <Label className="text-sm flex items-center gap-1.5 cursor-pointer">
                                {choice.flag && <span>{choice.flag}</span>}
                                <span>{choice.title}</span>
                              </Label>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bracket Rounds */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Bracket Stage Winners</Label>
          {BRACKET_ROUNDS.map((roundTitle) => {
            const line = bracketLines.find((l) => l.title === roundTitle);
            if (!line) return null;

            const limits: Record<string, number> = {
              "Round of 32": 16,
              "Round of 16": 8,
              "Quarterfinals": 4,
              "Semifinals": 2,
              "Championship": 1,
            };

            return (
              <Card key={roundTitle}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {roundTitle} ({limits[roundTitle]})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {line.choices
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((choice) => (
                        <div key={choice.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={choice.isPrimaryWin}
                            onCheckedChange={() =>
                              handleChoiceToggle(
                                choice.id,
                                choice.isPrimaryWin,
                                choice.isSecondaryWin,
                                "primary"
                              )
                            }
                            disabled={updateChoice.isPending}
                          />
                          <Label className="text-sm flex items-center gap-1.5 cursor-pointer">
                            {choice.flag && <span>{choice.flag}</span>}
                            <span>{choice.title}</span>
                          </Label>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Player Awards */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Player Award Winners</Label>
          {PLAYER_AWARDS.map((awardTitle) => {
            const line = playerAwardLines.find((l) => l.title === awardTitle);
            if (!line) return null;

            return (
              <Card key={awardTitle}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{awardTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {line.choices
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((choice) => (
                        <div key={choice.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={choice.isPrimaryWin}
                            onCheckedChange={() =>
                              handleChoiceToggle(
                                choice.id,
                                choice.isPrimaryWin,
                                choice.isSecondaryWin,
                                "primary"
                              )
                            }
                            disabled={updateChoice.isPending}
                          />
                          <Label className="text-sm flex items-center gap-1.5 cursor-pointer">
                            {choice.flag && <span>{choice.flag}</span>}
                            <span>{choice.title}</span>
                          </Label>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
