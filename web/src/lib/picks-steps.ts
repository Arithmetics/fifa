export type StepConfig = {
  slug: string;
  name: string;
  progressKey?: string;
  progressTotal?: number;
  progressLabel?: string;
};

export const STEPS: StepConfig[] = [
  {
    slug: "group-winners",
    name: "Group Winners",
    progressKey: "group-winners",
    progressTotal: 12,
    progressLabel: "Group Winners Selected",
  },
  {
    slug: "group-runners-up",
    name: "Group Runners Up",
    progressKey: "group-runners-up",
    progressTotal: 12,
    progressLabel: "Group Runners Up Selected",
  },
  {
    slug: "third-place-advancers",
    name: "Third Place Advancers",
    progressKey: "third-place-advancers",
    progressTotal: 8,
    progressLabel: "Third Place Advancers Selected",
  },
  { slug: "round-of-32", name: "Round of 32" },
  { slug: "round-of-16", name: "Round of 16" },
  { slug: "quarterfinals", name: "Quarterfinals" },
  { slug: "semifinals", name: "Semifinals" },
  { slug: "championship", name: "Championship" },
  { slug: "player-picks", name: "Player Picks" },
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
