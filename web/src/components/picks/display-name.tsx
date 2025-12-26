import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { StepFooter } from "./step-footer";

export function DisplayNameComponent() {
  const { user, setDisplayName } = useAuth();
  const [displayName, setDisplayNameValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepopulate with user's name (Google name) or existing displayName
  useEffect(() => {
    if (user) {
      setDisplayNameValue(user.displayName || user.name || "");
    }
  }, [user]);

  const trimmedName = displayName.trim();
  const isValid = trimmedName.length >= 3 && trimmedName.length <= 26;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayNameValue(e.target.value);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      const errorMessage =
        trimmedName.length < 3
          ? "Display name must be at least 3 characters"
          : "Display name must be no more than 26 characters";
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
      throw new Error(errorMessage);
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await setDisplayName(trimmedName);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save display name";
      setError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 pb-32" id="display-name-content-top">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="display-name" className="text-base">
            Display Name
          </Label>
          <Input
            id="display-name"
            type="text"
            placeholder="Enter your display name"
            value={displayName}
            onChange={handleChange}
            disabled={isSubmitting}
            className="text-lg h-12"
            autoFocus
          />
          <p className="text-sm text-muted-foreground">
            {trimmedName.length > 0 && (
              <span
                className={
                  isValid ? "text-green-600" : "text-destructive"
                }
              >
                {trimmedName.length} / 26 characters
              </span>
            )}
            {trimmedName.length === 0 && "Enter a name between 3-26 characters"}
          </p>
        </div>
      </div>
      <StepFooter
        slug="display-name"
        progress={isValid ? 1 : 0}
        progressTotal={1}
        progressLabel="Display Name Set"
        isValid={isValid}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </>
  );
}

