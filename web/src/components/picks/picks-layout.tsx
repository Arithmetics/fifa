import { ReactNode, useEffect } from "react";
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
import { getStepBySlug } from "@/lib/picks-steps";

type PicksLayoutProps = {
  slug: string;
  children: ReactNode;
};

export function PicksLayout({ slug, children }: PicksLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const currentStep = getStepBySlug(slug);

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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4">
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
    </div>
  );
}
