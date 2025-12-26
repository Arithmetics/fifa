export type StepConfig = {
  slug: string;
  name: string;
  description?: string;
  progressKey?: string;
  progressTotal?: number;
  progressLabel?: string;
};

export const STEPS: StepConfig[] = [
  {
    slug: "display-name",
    name: "Display Name",
    description:
      "Choose a display name that will be shown on the leaderboard. This can be different from your Google name.",
  },
  {
    slug: "group-winners",
    name: "Group Winners",
    description:
      "Pick the team your think will win each group. You will get more points if they win their group, and less points if they mearly qualify for the next round.",
    progressKey: "group-winners",
    progressTotal: 12,
    progressLabel: "Group Winners Selected",
  },
  {
    slug: "group-runners-up",
    name: "Group Runners Up",
    description:
      "Select the runners up for each group. You will get the listed number of points if they qualify for the next round (which could be through placing in the top two of their group OR by earning a third place qualify position). ",
    progressKey: "group-runners-up",
    progressTotal: 12,
    progressLabel: "Group Runners Up Selected",
  },
  {
    slug: "third-place-advancers",
    name: "Third Place Advancers",
    description:
      "Select 8 third-place teams that will advance. You will get the listed number of points if they qualify for the next round (which could be through placing in the top two of their group OR by earning a third place qualify position).",
    progressKey: "third-place-advancers",
    progressTotal: 8,
    progressLabel: "Third Place Advancers Selected",
  },
  {
    slug: "round-of-32",
    name: "Round of 32",
    description:
      "Pick your winners for the round of 32. This is the bracket as you have picked it, but since deviations in possible brackets means that other brackets are possible, you may pick ANY 16 teams to advance to the round of 16. You will get the listed number of points if they advance to the next round.",
    progressKey: "round-of-32",
    progressTotal: 16,
    progressLabel: "Teams Selected",
  },
  {
    slug: "round-of-16",
    name: "Round of 16",
    description:
      "Pick your winners for the round of 16. This is the bracket as you have picked it, but since deviations in possible brackets means that other brackets are possible, you may pick ANY 8 teams to advance to the quarterfinals. You will get the listed number of points if they advance to the next round.",
    progressKey: "round-of-16",
    progressTotal: 8,
    progressLabel: "Teams Selected",
  },
  {
    slug: "quarterfinals",
    name: "Quarterfinals",
    description:
      "Pick your winners for the quarterfinals. This is the bracket as you have picked it, but since deviations in possible brackets means that other brackets are possible, you may pick ANY 4 teams to advance to the semifinals. You will get the listed number of points if they advance to the next round.",
    progressKey: "quarterfinals",
    progressTotal: 4,
    progressLabel: "Teams Selected",
  },
  {
    slug: "semifinals",
    name: "Semifinals",
    description:
      "Pick your winners for the semifinals. This is the bracket as you have picked it, but since deviations in possible brackets means that other brackets are possible, you may pick ANY 2 teams to advance to the championship. You will get the listed number of points if they advance to the next round.",
    progressKey: "semifinals",
    progressTotal: 2,
    progressLabel: "Teams Selected",
  },
  {
    slug: "championship",
    name: "Championship",
    description:
      "Pick your winner for the World Cup. You will get the listed number of points if they win the World Cup.",
    progressKey: "championship",
    progressTotal: 1,
    progressLabel: "Team Selected",
  },
  {
    slug: "player-picks",
    name: "Player Picks",
    description:
      "Pick the player you think will win the listed awards. You will get the listed number of points if they win the award.",
    progressKey: "player-picks",
    progressTotal: 4,
    progressLabel: "Awards Selected",
  },
  {
    slug: "summary",
    name: "Summary",
    description: "",
  },
];

export function getStepBySlug(slug: string): StepConfig | undefined {
  return STEPS.find((s) => s.slug === slug);
}

export function getStepIndex(slug: string): number {
  return STEPS.findIndex((s) => s.slug === slug);
}

export function getPreviousStep(currentSlug: string): StepConfig | null {
  const index = getStepIndex(currentSlug);
  return index > 0 ? STEPS[index - 1] : null;
}

export function getNextStep(currentSlug: string): StepConfig | null {
  const index = getStepIndex(currentSlug);
  return index < STEPS.length - 1 ? STEPS[index + 1] : null;
}

/**
 * Get the previous round slug for playoff rounds
 * For round-of-32, returns an array of slugs: ["group-winners", "group-runners-up", "third-place-advancers"]
 * For other rounds, returns the previous playoff round slug
 */
export function getPreviousRoundSlugs(currentSlug: string): string[] {
  if (currentSlug === "round-of-32") {
    return ["group-winners", "group-runners-up", "third-place-advancers"];
  }

  const playoffRoundMap: Record<string, string> = {
    "round-of-16": "round-of-32",
    quarterfinals: "round-of-16",
    semifinals: "quarterfinals",
    championship: "semifinals",
  };

  const prevSlug = playoffRoundMap[currentSlug];
  return prevSlug ? [prevSlug] : [];
}
