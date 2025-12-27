import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  STEPS,
  getStepIndex,
  getPreviousStep,
  getNextStep,
} from "@/lib/picks-steps";

type StepFooterProps = {
  slug: string;
  progress: number;
  progressTotal: number;
  progressLabel: string;
  isValid: boolean;
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
};

export function StepFooter({
  slug,
  progress,
  progressTotal,
  progressLabel,
  isValid,
  onSubmit,
  isSubmitting = false,
  error,
}: StepFooterProps) {
  const navigate = useNavigate();
  const stepIndex = getStepIndex(slug);
  const previousStep = getPreviousStep(slug);
  const nextStep = getNextStep(slug);

  const progressValue =
    progressTotal > 0 ? (progress / progressTotal) * 100 : 0;

  const handlePrevious = () => {
    if (previousStep) {
      const routeMap: Record<string, string> = {
        "display-name": "/picks/display-name",
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

  const handleNext = async () => {
    if (!nextStep) return;

    try {
      await onSubmit();
      // Only navigate if submission succeeded
      const routeMap: Record<string, string> = {
        "display-name": "/picks/display-name",
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
        // Scroll to top after navigation
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      // Error handling is done by the component (it sets error state and scrolls to top)
      // Don't navigate on error
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Step Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{progressLabel}</span>
            <span className="font-medium">
              {progress} / {progressTotal}
            </span>
          </div>
          <div
            className={
              progress === progressTotal
                ? "[&_[class*='bg-primary']]:!bg-green-500"
                : ""
            }
          >
            <Progress value={progressValue} />
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive text-center">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between">
            {previousStep ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            ) : (
              <div /> // Placeholder to maintain layout
            )}

            <span className="text-sm text-muted-foreground">
              Step {stepIndex + 1} of{" "}
              {STEPS.filter((s) => s.slug !== "summary").length}
            </span>

            <div className="flex gap-2">
              {nextStep && nextStep.slug !== "summary" ? (
                <Button onClick={handleNext} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Next"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    try {
                      await onSubmit();
                      navigate({ to: "/picks/summary" as any });
                    } catch (err) {
                      // Error handling is done by the component
                      // Don't navigate on error
                    }
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
  );
}
