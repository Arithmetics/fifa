import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";

export const Route = createFileRoute("/picks/round-of-32")({
  component: RoundOf32Page,
});

function RoundOf32Page() {
  return (
    <PicksLayout slug="round-of-32">
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-lg">Placeholder for Round of 32</p>
        <p className="text-sm mt-2">Picks will be implemented here</p>
      </div>
    </PicksLayout>
  );
}
