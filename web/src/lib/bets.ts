import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Bet } from "./lines";

export type BetWithRelations = {
  id: string;
  choiceId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  choice: {
    id: string;
    lineId: string;
    title: string;
    flag: string | null;
    primaryPoints: number;
    secondaryPoints: number;
    isPrimaryWin: boolean;
    createdAt: string;
    updatedAt: string;
    line: {
      id: string;
      title: string;
      choiceLimit: number;
      collection: string[];
      choiceCollectionLimit: number | null;
      createdAt: string;
      updatedAt: string;
    };
  };
};

export type BetsResponse = {
  bets: BetWithRelations[];
};

export type SubmitBetsRequest = {
  choiceIds: string[];
};

export type SubmitBetsResponse = {
  bets: BetWithRelations[];
};

/**
 * Hook to fetch all bets for the logged-in user
 */
export function useBets() {
  return useQuery<BetsResponse>({
    queryKey: ["bets"],
    queryFn: async () => {
      const response = await fetch("/api/bets", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch bets");
      }

      return response.json();
    },
  });
}

/**
 * Hook to submit bets for a collection
 */
export function useSubmitBets() {
  const queryClient = useQueryClient();

  return useMutation<SubmitBetsResponse, Error, SubmitBetsRequest>({
    mutationFn: async (data) => {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit bets");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch bets
      queryClient.invalidateQueries({ queryKey: ["bets"] });
    },
  });
}

/**
 * Get bets by collection type
 */
export function useBetsByCollection(collectionType: string) {
  const { data, ...rest } = useBets();

  return {
    ...rest,
    data: data?.bets.filter((bet) =>
      bet.choice.line.collection.includes(collectionType)
    ),
  };
}

/**
 * Get bets by line ID
 */
export function useBetsByLineId(lineId: string) {
  const { data, ...rest } = useBets();

  return {
    ...rest,
    data: data?.bets.filter((bet) => bet.choice.lineId === lineId),
  };
}
