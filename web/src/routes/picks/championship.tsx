import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { PlayoffRoundComponent } from "@/components/picks/playoff-round";

export const Route = createFileRoute("/picks/championship")({
  component: ChampionshipPage,
});

function ChampionshipPage() {
  return (
    <PicksLayout slug="championship">
      <PlayoffRoundComponent stepSlug="championship" />
    </PicksLayout>
  );
}
