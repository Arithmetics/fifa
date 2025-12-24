import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type SettingsResponse = {
  contestClosed: boolean;
};

/**
 * Hook to fetch settings
 */
export function useSettings() {
  return useQuery<SettingsResponse>({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch settings");
      }

      return response.json();
    },
  });
}

export type UpdateSettingsRequest = {
  contestClosed: boolean;
};

export type UpdateSettingsResponse = SettingsResponse;

/**
 * Hook to update settings (admin only)
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<UpdateSettingsResponse, Error, UpdateSettingsRequest>({
    mutationFn: async (data) => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update settings");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch settings and leaderboard
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

