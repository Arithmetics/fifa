import { useQuery } from "@tanstack/react-query";
import type { AdminUsersResponse } from "./admin";

/**
 * Hook to fetch leaderboard data (respects contest closed setting)
 */
export function useLeaderboard() {
  return useQuery<AdminUsersResponse>({
    queryKey: ["leaderboard", "users"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard/users", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch leaderboard");
      }

      return response.json();
    },
  });
}

