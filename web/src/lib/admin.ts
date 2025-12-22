import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type PickStatus = {
  required: number;
  current: number;
};

export type UserWithPickStatus = {
  id: string;
  name: string;
  email: string;
  displayName: string | null;
  hasPaid: boolean;
  createdAt: string;
  pickStatus: Record<string, PickStatus>;
  allComplete: boolean;
};

export type AdminUsersResponse = {
  users: UserWithPickStatus[];
};

/**
 * Hook to fetch all users with their pick completion status (admin only)
 */
export function useAdminUsers() {
  return useQuery<AdminUsersResponse>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch admin users");
      }

      return response.json();
    },
  });
}

export type UpdatePaymentStatusRequest = {
  userId: string;
  hasPaid: boolean;
};

export type UpdatePaymentStatusResponse = {
  user: {
    id: string;
    hasPaid: boolean;
  };
};

/**
 * Hook to update user payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation<UpdatePaymentStatusResponse, Error, UpdatePaymentStatusRequest>({
    mutationFn: async ({ userId, hasPaid }) => {
      const response = await fetch(`/api/admin/users/${userId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ hasPaid }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update payment status");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch admin users
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}


export type UpdateChoiceWinStatusRequest = {
  choiceId: string;
  isPrimaryWin: boolean;
  isSecondaryWin: boolean;
};

export type UpdateWinStatusRequest = {
  updates: UpdateChoiceWinStatusRequest[];
};

export type UpdateWinStatusResponse = {
  success: boolean;
};

/**
 * Hook to update win status for a single choice
 */
export function useUpdateChoiceWinStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    UpdateChoiceWinStatusRequest
  >({
    mutationFn: async ({ choiceId, isPrimaryWin, isSecondaryWin }) => {
      const response = await fetch("/api/admin/win-status/update-choice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ choiceId, isPrimaryWin, isSecondaryWin }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update choice win status");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate lines to refresh data
      queryClient.invalidateQueries({ queryKey: ["lines"] });
    },
  });
}

