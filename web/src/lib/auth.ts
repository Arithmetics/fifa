import { createAuthClient } from "better-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export const authClient = createAuthClient({
  baseURL:
    import.meta.env.VITE_AUTH_URL || `${window.location.origin}/api/auth`,
});

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data;
    },
  });

  const user = session?.user;

  const signIn = async (provider: "google") => {
    if (provider === "google") {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/",
      });
    }
  };

  const signOut = async () => {
    await authClient.signOut();
    queryClient.invalidateQueries({ queryKey: ["auth"] });
    navigate({ to: "/" });
  };

  const setDisplayName = async (displayName: string) => {
    // This will need to be implemented as an API endpoint
    const response = await fetch("/api/auth/user/display-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ displayName }),
    });

    if (!response.ok) {
      throw new Error("Failed to set display name");
    }

    queryClient.invalidateQueries({ queryKey: ["auth"] });
  };

  return {
    user,
    session,
    signIn,
    signOut,
    setDisplayName,
  };
}
