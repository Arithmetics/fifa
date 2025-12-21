import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { PlayerPicksComponent } from "@/components/picks/player-picks";

export const Route = createFileRoute("/picks/player-picks")({
  component: PlayerPicksPage,
});

function PlayerPicksPage() {
  return (
    <PicksLayout slug="player-picks">
      <PlayerPicksComponent />
    </PicksLayout>
  );
}
