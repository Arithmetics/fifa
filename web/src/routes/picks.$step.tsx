import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/picks/$step")({
  component: PicksComponent,
});

const STEPS = [
  { number: 1, name: "Group Winners" },
  { number: 2, name: "Group Runners Up" },
  { number: 3, name: "Round of 32" },
  { number: 4, name: "Round of 16" },
  { number: 5, name: "Quarterfinals" },
  { number: 6, name: "Semifinals" },
  { number: 7, name: "Championship" },
  { number: 8, name: "Player Picks" },
];

// Fake country data for groups
const FAKE_COUNTRIES = [
  { name: "Brazil", flag: "🇧🇷", points: 100 },
  { name: "Argentina", flag: "🇦🇷", points: 95 },
  { name: "France", flag: "🇫🇷", points: 90 },
  { name: "Spain", flag: "🇪🇸", points: 85 },
  { name: "Germany", flag: "🇩🇪", points: 88 },
  { name: "Italy", flag: "🇮🇹", points: 82 },
  { name: "Portugal", flag: "🇵🇹", points: 80 },
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 87 },
  { name: "Netherlands", flag: "🇳🇱", points: 78 },
  { name: "Belgium", flag: "🇧🇪", points: 83 },
  { name: "Croatia", flag: "🇭🇷", points: 75 },
  { name: "Uruguay", flag: "🇺🇾", points: 77 },
  { name: "Mexico", flag: "🇲🇽", points: 72 },
  { name: "Japan", flag: "🇯🇵", points: 70 },
  { name: "South Korea", flag: "🇰🇷", points: 68 },
  { name: "Morocco", flag: "🇲🇦", points: 73 },
  { name: "Senegal", flag: "🇸🇳", points: 71 },
  { name: "Egypt", flag: "🇪🇬", points: 69 },
  { name: "USA", flag: "🇺🇸", points: 76 },
  { name: "Canada", flag: "🇨🇦", points: 65 },
  { name: "Colombia", flag: "🇨🇴", points: 74 },
  { name: "Chile", flag: "🇨🇱", points: 72 },
  { name: "Peru", flag: "🇵🇪", points: 66 },
  { name: "Ecuador", flag: "🇪🇨", points: 64 },
  { name: "Denmark", flag: "🇩🇰", points: 79 },
  { name: "Switzerland", flag: "🇨🇭", points: 76 },
  { name: "Sweden", flag: "🇸🇪", points: 74 },
  { name: "Norway", flag: "🇳🇴", points: 70 },
  { name: "Poland", flag: "🇵🇱", points: 73 },
  { name: "Serbia", flag: "🇷🇸", points: 71 },
  { name: "Turkey", flag: "🇹🇷", points: 68 },
  { name: "Russia", flag: "🇷🇺", points: 75 },
  { name: "Australia", flag: "🇦🇺", points: 67 },
  { name: "Iran", flag: "🇮🇷", points: 69 },
  { name: "Saudi Arabia", flag: "🇸🇦", points: 63 },
  { name: "Qatar", flag: "🇶🇦", points: 62 },
  { name: "Nigeria", flag: "🇳🇬", points: 72 },
  { name: "Ghana", flag: "🇬🇭", points: 70 },
  { name: "Tunisia", flag: "🇹🇳", points: 68 },
  { name: "Cameroon", flag: "🇨🇲", points: 67 },
  { name: "Costa Rica", flag: "🇨🇷", points: 65 },
  { name: "Panama", flag: "🇵🇦", points: 61 },
  { name: "Jamaica", flag: "🇯🇲", points: 60 },
  { name: "New Zealand", flag: "🇳🇿", points: 59 },
  { name: "Algeria", flag: "🇩🇿", points: 71 },
  { name: "Iceland", flag: "🇮🇸", points: 66 },
  { name: "Ukraine", flag: "🇺🇦", points: 74 },
  { name: "Czech Republic", flag: "🇨🇿", points: 72 },
  { name: "Austria", flag: "🇦🇹", points: 70 },
  { name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", points: 69 },
];

// Generate groups A-L with 4 countries each
function generateGroups() {
  const groups: Record<string, typeof FAKE_COUNTRIES> = {};
  const letters = "ABCDEFGHIJKL";
  let countryIndex = 0;

  for (const letter of letters) {
    groups[letter] = FAKE_COUNTRIES.slice(countryIndex, countryIndex + 4);
    countryIndex += 4;
  }

  return groups;
}

const GROUPS = generateGroups();

type GroupWinnersState = Record<string, string>;
const GROUP_WINNERS_STORAGE_KEY = "fifa_group_winners";

function GroupWinnersComponent() {
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

type GroupRunnersUpState = Record<string, string>;
const GROUP_RUNNERS_UP_STORAGE_KEY = "fifa_group_runners_up";

function GroupRunnersUpComponent() {
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

function PicksComponent() {
  const { step } = Route.useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const currentStep = parseInt(step, 10);
  const progress = (currentStep / STEPS.length) * 100;
  const currentStepData = STEPS.find((s) => s.number === currentStep);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  // Validate step number
  useEffect(() => {
    if (currentStep < 1 || currentStep > STEPS.length) {
      navigate({ to: "/picks/$step", params: { step: "1" } });
    }
  }, [currentStep, navigate]);

  if (!user) {
    return null;
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      navigate({
        to: "/picks/$step",
        params: { step: String(currentStep - 1) },
      });
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      navigate({
        to: "/picks/$step",
        params: { step: String(currentStep + 1) },
      });
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Title and Logout */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🌍 World Cup 2026 ⚽</h1>
          <Button onClick={signOut} variant="outline" size="sm">
            Sign Out
          </Button>
        </div>
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {STEPS.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Step Title */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentStepData?.name}</CardTitle>
            <CardDescription>
              Make your picks for this stage of the tournament
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step-specific content */}
            {currentStep === 1 ? (
              <GroupWinnersComponent />
            ) : currentStep === 2 ? (
              <GroupRunnersUpComponent />
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg">
                  Placeholder for {currentStepData?.name}
                </p>
                <p className="text-sm mt-2">Picks will be implemented here</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentStep < STEPS.length ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button>Submit Picks</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
