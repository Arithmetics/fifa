import { ReactNode, useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  STEPS,
  getStepBySlug,
  getPreviousStep,
  getNextStep,
  getStepIndex,
} from "@/lib/picks-steps";
import { useBets } from "@/lib/bets";

type PicksLayoutProps = {
  slug: string;
  children: ReactNode;
  onSubmit?: () => Promise<void>;
  isValid?: () => boolean;
};

export function PicksLayout({
  slug,
  children,
  onSubmit,
  isValid,
}: PicksLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const currentStep = getStepBySlug(slug);
  const stepIndex = getStepIndex(slug);

  const { data: betsData } = useBets();

  // Calculate step-specific progress from bets
  const stepProgress = useMemo(() => {
    if (!currentStep?.progressKey || !betsData) return null;

    const bets = betsData.bets;
    const collectionMap: Record<string, string> = {
      "group-winners": "group-winner",
      "group-runners-up": "group-runner-up",
      "third-place-advancers": "group-third-place",
    };

    const collection = collectionMap[currentStep.progressKey];

    if (collection) {
      // For collection-based steps (groups)
      const collectionBets = bets.filter((bet) =>
        bet.choice.line.collection.includes(collection)
      );
      return {
        current: collectionBets.length,
        total: currentStep.progressTotal || 12,
        label: currentStep.progressLabel || "Selected",
      };
    }

    // For single-line steps (rounds, championship)
    const stepToLineTitle: Record<string, string> = {
      "round-of-32": "Round of 32",
      "round-of-16": "Round of 16",
      quarterfinals: "Quarterfinals",
      semifinals: "Semifinals",
      championship: "Championship",
    };

    const lineTitle = stepToLineTitle[currentStep.progressKey];
    if (lineTitle) {
      const lineBets = bets.filter(
        (bet) => bet.choice.line.title === lineTitle
      );
      return {
        current: lineBets.length,
        total: currentStep.progressTotal || 0,
        label: currentStep.progressLabel || "Teams Selected",
      };
    }

    // For player picks
    if (currentStep.progressKey === "player-picks") {
      const playerLineTitles = [
        "Golden Boot (Top Scorer)",
        "Golden Ball (Best Player)",
        "Golden Glove (Best Goalkeeper)",
        "FIFA Young Player Award",
      ];
      const playerBets = bets.filter((bet) =>
        playerLineTitles.includes(bet.choice.line.title)
      );
      // Count unique lines with bets
      const uniqueLines = new Set(playerBets.map((bet) => bet.choice.line.id));
      return {
        current: uniqueLines.size,
        total: currentStep.progressTotal || 4,
        label: currentStep.progressLabel || "Awards Selected",
      };
    }

    return null;
  }, [currentStep, betsData]);

  const stepProgressValue = stepProgress
    ? (stepProgress.current / stepProgress.total) * 100
    : 0;

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  // Validate step slug
  useEffect(() => {
    if (!currentStep) {
      navigate({ to: "/picks/group-winners" as any });
    }
  }, [currentStep, navigate]);

  if (!user || !currentStep) {
    return null;
  }

  const previousStep = getPreviousStep(slug);
  const nextStep = getNextStep(slug);

  const handlePrevious = () => {
    if (previousStep) {
      const routeMap: Record<string, string> = {
        "group-winners": "/picks/group-winners",
        "group-runners-up": "/picks/group-runners-up",
        "third-place-advancers": "/picks/third-place-advancers",
        "round-of-32": "/picks/round-of-32",
        "round-of-16": "/picks/round-of-16",
        quarterfinals: "/picks/quarterfinals",
        semifinals: "/picks/semifinals",
        championship: "/picks/championship",
        "player-picks": "/picks/player-picks",
        summary: "/picks/summary",
      };
      const route = routeMap[previousStep.slug];
      if (route) {
        navigate({ to: route as any });
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNext = async () => {
    if (!nextStep) return;

    // Validate if validator provided
    if (isValid && !isValid()) {
      setSubmitError("Please complete all required selections");
      return;
    }

    // Submit if submit handler provided
    if (onSubmit) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmit();
        // Clear error on success
        setSubmitError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save selections";
        setSubmitError(message);
        setIsSubmitting(false);
        return; // Don't navigate on error
      } finally {
        setIsSubmitting(false);
      }
    }

    // Navigate to next step
    const routeMap: Record<string, string> = {
      "group-winners": "/picks/group-winners",
      "group-runners-up": "/picks/group-runners-up",
      "third-place-advancers": "/picks/third-place-advancers",
      "round-of-32": "/picks/round-of-32",
      "round-of-16": "/picks/round-of-16",
      quarterfinals: "/picks/quarterfinals",
      semifinals: "/picks/semifinals",
      championship: "/picks/championship",
      "player-picks": "/picks/player-picks",
      summary: "/picks/summary",
    };
    const route = routeMap[nextStep.slug];
    if (route) {
      navigate({ to: route as any });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`flex-1 p-4 ${slug !== "summary" ? "pb-32" : ""}`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with Title and Logout */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">🌍 World Cup 2026 ⚽</h1>
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>

          {/* Step Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{currentStep.name}</CardTitle>
              {currentStep.description && (
                <CardDescription>{currentStep.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">{children}</CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Footer with Progress and Navigation */}
      {slug !== "summary" && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {/* Step Progress Bar */}
            {stepProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {stepProgress.label}
                  </span>
                  <span className="font-medium">
                    {stepProgress.current} / {stepProgress.total}
                  </span>
                </div>
                <div
                  className={
                    stepProgress.current === stepProgress.total
                      ? "[&_[class*='bg-primary']]:!bg-green-500"
                      : ""
                  }
                >
                  <Progress value={stepProgressValue} />
                </div>
              </div>
            )}

            {/* Step Indicator and Navigation */}
            <div className="space-y-2">
              {submitError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive text-center">
                  {submitError}
                </div>
              )}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={!previousStep || isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Step {stepIndex + 1} of {STEPS.length}
                </span>

                <div className="flex gap-2">
                  {nextStep && nextStep.slug !== "summary" ? (
                    <Button
                      onClick={handleNext}
                      disabled={isSubmitting || (isValid && !isValid())}
                    >
                      {isSubmitting ? "Saving..." : "Next"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        navigate({ to: "/picks/summary" as any });
                      }}
                      disabled={isSubmitting}
                    >
                      Submit Picks
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
