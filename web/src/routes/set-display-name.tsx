import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/set-display-name")({
  component: SetDisplayNameComponent,
});

function SetDisplayNameComponent() {
  const { user, setDisplayName } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if user already has display name (guard against direct navigation to this route)
  useEffect(() => {
    if (user?.displayName) {
      navigate({ to: "/", replace: true });
    }
  }, [user?.displayName, navigate]);

  // Don't render if no user or already has display name
  if (!user || user.displayName) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await setDisplayName(name.trim());
      // Navigate immediately - the query will refetch in background
      // This prevents the useEffect from seeing the updated user and redirecting
      navigate({ to: "/", replace: true });
    } catch (error) {
      console.error("Failed to set display name:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="text-4xl mb-2">⚽</div>
          <CardTitle className="text-2xl">Welcome to World Cup 2026!</CardTitle>
          <CardDescription>
            Choose a display name to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="text-lg h-12"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
