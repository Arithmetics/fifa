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
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/picks/$step")({
  component: PicksComponent,
});

const STEPS = [
  { number: 1, name: "Group Stage" },
  { number: 2, name: "Round of 32" },
  { number: 3, name: "Round of 16" },
  { number: 4, name: "Quarterfinals" },
  { number: 5, name: "Semifinals" },
  { number: 6, name: "Championship" },
  { number: 7, name: "Player Picks" },
];

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
      navigate({ to: "/picks/1" });
    }
  }, [currentStep, navigate]);

  if (!user) {
    return null;
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      navigate({ to: `/picks/${currentStep - 1}` });
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      navigate({ to: `/picks/${currentStep + 1}` });
    }
  };

  return (
    <div className="min-h-screen p-4 relative">
      {/* Logout button in top right */}
      <div className="absolute top-4 right-4">
        <Button onClick={signOut} variant="outline" size="sm">
          Sign Out
        </Button>
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
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
            {/* Placeholder Content */}
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-lg">Placeholder for {currentStepData?.name}</p>
              <p className="text-sm mt-2">Picks will be implemented here</p>
            </div>

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
