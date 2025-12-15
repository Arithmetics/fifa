import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to set display name if user is logged in but doesn't have one
    if (user && !user.displayName) {
      navigate({ to: "/set-display-name" });
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to FIFA</h1>

      {user ? (
        <div>
          <p className="mb-4">
            Welcome, {user.displayName || user.name || user.email}!
          </p>
          <Button onClick={signOut}>Sign Out</Button>
        </div>
      ) : (
        <Button onClick={() => signIn("google")}>Sign in with Google</Button>
      )}
    </div>
  );
}
