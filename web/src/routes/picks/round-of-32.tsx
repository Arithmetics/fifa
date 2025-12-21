import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { PlayoffRoundComponent } from "@/components/picks/playoff-round";

export const Route = createFileRoute("/picks/round-of-32")({
  component: RoundOf32Page,
});

function RoundOf32Page() {
  return (
    <PicksLayout slug="round-of-32">
      <PlayoffRoundComponent stepSlug="round-of-32" />
    </PicksLayout>
  );
}
