import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { PlayoffRoundComponent } from "@/components/picks/playoff-round";

export const Route = createFileRoute("/picks/round-of-16")({
  component: RoundOf16Page,
});

function RoundOf16Page() {
  return (
    <PicksLayout slug="round-of-16">
      <PlayoffRoundComponent stepSlug="round-of-16" />
    </PicksLayout>
  );
}
