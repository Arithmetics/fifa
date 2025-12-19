import { ReactNode, useEffect, useState } from "react";
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
import {
  GROUP_WINNERS_STORAGE_KEY,
  GROUP_RUNNERS_UP_STORAGE_KEY,
  THIRD_PLACE_STORAGE_KEY,
} from "@/lib/picks-data";

type PicksLayoutProps = {
  slug: string;
  children: ReactNode;
};

export function PicksLayout({ slug, children }: PicksLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const currentStep = getStepBySlug(slug);
  const stepIndex = getStepIndex(slug);

  // Calculate step-specific progress with state to trigger re-renders
  const [stepProgress, setStepProgress] = useState<{
    current: number;
    total: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (!currentStep?.progressKey) {
      setStepProgress(null);
      return;
    }

    const calculateProgress = () => {
      if (currentStep.progressKey === "group-winners") {
        // Group Winners: count selected groups / 12
        const stored = localStorage.getItem(GROUP_WINNERS_STORAGE_KEY);
        const selectedWinners = stored ? JSON.parse(stored) : {};
        const selectedCount =
          Object.values(selectedWinners).filter(Boolean).length;
        setStepProgress({
          current: selectedCount,
          total: currentStep.progressTotal || 12,
          label: currentStep.progressLabel || "Group Winners Selected",
        });
      } else if (currentStep.progressKey === "group-runners-up") {
        // Group Runners Up: count selected groups / 12
        const stored = localStorage.getItem(GROUP_RUNNERS_UP_STORAGE_KEY);
        const selectedRunnersUp = stored ? JSON.parse(stored) : {};
        const selectedCount =
          Object.values(selectedRunnersUp).filter(Boolean).length;
        setStepProgress({
          current: selectedCount,
          total: currentStep.progressTotal || 12,
          label: currentStep.progressLabel || "Group Runners Up Selected",
        });
      } else if (currentStep.progressKey === "third-place-advancers") {
        // Third Place Advancers: count selected / 8
        const stored = localStorage.getItem(THIRD_PLACE_STORAGE_KEY);
        const selectedAdvancers = stored ? JSON.parse(stored) : {};
        const totalSelected = Object.values(selectedAdvancers).flat().length;
        setStepProgress({
          current: totalSelected,
          total: currentStep.progressTotal || 8,
          label: currentStep.progressLabel || "Third Place Advancers Selected",
        });
      } else {
        setStepProgress(null);
      }
    };

    calculateProgress();

    // Listen for storage events to update progress when localStorage changes
    const handleStorageChange = () => {
      calculateProgress();
    };

    window.addEventListener("storage", handleStorageChange);
    // Also poll periodically to catch same-tab localStorage changes
    const interval = setInterval(calculateProgress, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [currentStep]);

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
      };
      const route = routeMap[previousStep.slug];
      if (route) {
        navigate({ to: route as any });
      }
    }
  };

  const handleNext = () => {
    if (nextStep) {
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
      };
      const route = routeMap[nextStep.slug];
      if (route) {
        navigate({ to: route as any });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 pb-32">
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
              <CardDescription>
                Make your picks for this stage of the tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">{children}</CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Footer with Progress and Navigation */}
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
              <Progress value={stepProgressValue} />
            </div>
          )}

          {/* Step Indicator and Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!previousStep}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Step {stepIndex + 1} of {STEPS.length}
            </span>

            <div className="flex gap-2">
              {nextStep ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button>Submit Picks</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
