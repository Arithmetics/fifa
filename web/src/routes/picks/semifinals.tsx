import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";

export const Route = createFileRoute("/picks/semifinals")({
  component: SemifinalsPage,
});

function SemifinalsPage() {
  return (
    <PicksLayout slug="semifinals">
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-lg">Placeholder for Semifinals</p>
        <p className="text-sm mt-2">Picks will be implemented here</p>
      </div>
    </PicksLayout>
  );
}
