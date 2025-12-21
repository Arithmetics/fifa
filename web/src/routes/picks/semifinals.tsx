import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { PlayoffRoundComponent } from "@/components/picks/playoff-round";

export const Route = createFileRoute("/picks/semifinals")({
  component: SemifinalsPage,
});

function SemifinalsPage() {
  return (
    <PicksLayout slug="semifinals">
      <PlayoffRoundComponent stepSlug="semifinals" />
    </PicksLayout>
  );
}
