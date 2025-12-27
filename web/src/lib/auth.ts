import { createAuthClient } from "better-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export const authClient = createAuthClient({
  baseURL:
    import.meta.env.VITE_AUTH_URL || `${window.location.origin}/api/auth`,
});

// Extend the user type to include displayName
export type UserWithDisplayName = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  displayName?: string | null;
};

type SessionWithDisplayName = {
  user: UserWithDisplayName;
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: session } = useQuery<SessionWithDisplayName | null>({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data as SessionWithDisplayName | null;
    },
  });

  // Fetch user with displayName from our custom endpoint
  const { data: userData } = useQuery<UserWithDisplayName | null>({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      if (!session?.user) return null;
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      return data.user as UserWithDisplayName;
    },
    enabled: !!session?.user,
  });

  const user = userData || session?.user;

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
    const response = await fetch("/api/auth/user/display-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ displayName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to set display name");
    }

    // Don't optimistically update - just invalidate and let it refetch
    // This prevents race conditions with navigation
    queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
  };

  return {
    user,
    session,
    signIn,
    signOut,
    setDisplayName,
  };
}
