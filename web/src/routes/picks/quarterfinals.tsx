import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { PlayoffRoundComponent } from "@/components/picks/playoff-round";

export const Route = createFileRoute("/picks/quarterfinals")({
  component: QuarterfinalsPage,
});

function QuarterfinalsPage() {
  return (
    <PicksLayout slug="quarterfinals">
      <PlayoffRoundComponent stepSlug="quarterfinals" />
    </PicksLayout>
  );
}
