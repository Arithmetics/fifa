import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";

export const Route = createFileRoute("/picks/player-picks")({
  component: PlayerPicksPage,
});

function PlayerPicksPage() {
  return (
    <PicksLayout slug="player-picks">
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-lg">Placeholder for Player Picks</p>
        <p className="text-sm mt-2">Picks will be implemented here</p>
      </div>
    </PicksLayout>
  );
}
