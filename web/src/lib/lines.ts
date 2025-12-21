import { useQuery } from "@tanstack/react-query";

// Types matching the Prisma schema
export type Choice = {
  id: string;
  lineId: string;
  title: string;
  flag: string | null;
  primaryPoints: number;
  secondaryPoints: number;
  isPrimaryWin: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Line = {
  id: string;
  title: string;
  choiceLimit: number;
  collection: string[];
  choiceCollectionLimit: number | null;
  createdAt: string;
  updatedAt: string;
  choices: Choice[];
};

export type LinesResponse = {
  lines: Line[];
};

// Mapping from step slugs to line titles
const STEP_SLUG_TO_LINE_TITLE: Record<string, string> = {
  "group-winners": "Group Winners",
  "group-runners-up": "Group Runners Up",
  "third-place-advancers": "Third Place Advancers",
  "round-of-32": "Round of 32",
  "round-of-16": "Round of 16",
  quarterfinals: "Quarterfinals",
  semifinals: "Semifinals",
  championship: "Championship",
  "player-picks": "", // Special case - will be handled separately
};

// Player award line titles
const PLAYER_AWARD_LINE_TITLES = [
  "Golden Boot (Top Scorer)",
  "Golden Ball (Best Player)",
  "Golden Glove (Best Goalkeeper)",
  "FIFA Young Player Award",
];

/**
 * Hook to fetch all lines with their choices
 */
export function useLines() {
  return useQuery<LinesResponse>({
    queryKey: ["lines"],
    queryFn: async () => {
      const response = await fetch("/api/lines", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch lines");
      }

      return response.json();
    },
  });
}

/**
 * Get a line by its title
 */
export function useLineByTitle(title: string) {
  const { data, ...rest } = useLines();

  return {
    ...rest,
    data: data?.lines.find((line) => line.title === title),
  };
}

/**
 * Get lines by collection type
 */
export function useLinesByCollection(collectionType: string) {
  const { data, ...rest } = useLines();

  return {
    ...rest,
    data: data?.lines.filter((line) =>
      line.collection.includes(collectionType)
    ),
  };
}

/**
 * Get a line by step slug (for playoff rounds that still have single lines)
 */
export function useLineByStepSlug(slug: string) {
  const lineTitle = STEP_SLUG_TO_LINE_TITLE[slug];
  return useLineByTitle(lineTitle || "");
}

/**
 * Get all player award lines
 */
export function usePlayerAwardLines() {
  const { data, ...rest } = useLines();

  return {
    ...rest,
    data: data?.lines.filter((line) =>
      PLAYER_AWARD_LINE_TITLES.includes(line.title)
    ),
  };
}
