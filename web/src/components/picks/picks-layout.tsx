import { ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate, Link } from "@tanstack/react-router";
import { useSettings } from "@/lib/settings";
import { isAdminUser } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStepBySlug, STEPS } from "@/lib/picks-steps";

type PicksLayoutProps = {
  slug: string;
  children: ReactNode;
};

export function PicksLayout({ slug, children }: PicksLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: settings, isLoading: settingsLoading } = useSettings();

  const currentStep = getStepBySlug(slug);
  const isAdmin = isAdminUser(user);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  // Redirect to leaderboard if contest is closed (but not for admin users)
  // This should run after settings are loaded
  useEffect(() => {
    if (!user || settingsLoading || !settings) {
      return;
    }
    if (settings.contestClosed && !isAdmin) {
      console.log("Redirecting to leaderboard - contest is closed");
      navigate({ to: "/leaderboard", replace: true });
    }
  }, [user, settings, settingsLoading, isAdmin, navigate]);

  // Validate step slug (only if we're not redirecting)
  useEffect(() => {
    if (!currentStep) {
      const firstStep = STEPS.find((s) => s.slug !== "summary");
      if (firstStep) {
        navigate({ to: `/picks/${firstStep.slug}` as any });
      }
    }
  }, [currentStep, navigate]);

  // Don't render if not logged in, settings are loading, or we're redirecting
  if (!user || !currentStep || settingsLoading) {
    return null;
  }

  // Don't render if contest is closed and user is not admin (redirect will happen)
  if (settings && settings.contestClosed && !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with Title and Logout */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">🌍 🏆 ⚽</h1>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
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
