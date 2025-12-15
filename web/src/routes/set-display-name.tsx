import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await setDisplayName(name.trim());
      navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to set display name:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Your Display Name</CardTitle>
          <CardDescription>
            Please choose a display name to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Display Name"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
